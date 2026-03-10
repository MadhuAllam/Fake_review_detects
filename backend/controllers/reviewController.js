const axios = require("axios");
const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");
const { checkBrandManipulation } = require("./alertController");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// ── POST /api/review/analyze ──────────────────────────────────────────────────
exports.analyzeReview = async (req, res, next) => {
    try {
        const {
            review_text, rating, user_id, product_id,
            reviewer_name, reviewer_email, product_name, product_category,
        } = req.body;

        if (!review_text || review_text.trim().length < 3) {
            return res.status(400).json({ error: "review_text is required (min 3 chars)" });
        }

        // ── Call ML service ───────────────────────────────────────────────────────
        let mlResult;
        try {
            const { data } = await axios.post(`${ML_SERVICE_URL}/api/analyze`, {
                text: review_text,
            });
            mlResult = data;
        } catch (mlErr) {
            console.warn("⚠️  ML service unavailable, using fallback scoring");
            mlResult = _fallbackScore(review_text);
        }

        // ── Resolve / create User ─────────────────────────────────────────────────
        let user = null;
        if (user_id) {
            user = await User.findById(user_id);
        } else if (reviewer_email) {
            user = await User.findOneAndUpdate(
                { email: reviewer_email },
                {
                    $setOnInsert: {
                        name: reviewer_name || "Anonymous",
                        email: reviewer_email,
                        account_age: 0,
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        // ── Resolve / create Product ──────────────────────────────────────────────
        let product = null;
        if (product_id) {
            product = await Product.findById(product_id);
        } else if (product_name) {
            product = await Product.findOneAndUpdate(
                { name: product_name },
                {
                    $setOnInsert: {
                        name: product_name,
                        category: product_category || "General",
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        // ── Save Review ───────────────────────────────────────────────────────────
        const review = await Review.create({
            user_id: user?._id,
            product_id: product?._id,
            review_text,
            rating: rating || null,
            sentiment_score: mlResult.sentiment_score,
            sentiment_label: mlResult.sentiment_label,
            fake_probability: mlResult.fake_probability,
            is_fake: mlResult.is_fake,
            confidence: mlResult.confidence,
            text_features: mlResult.text_features || {},
            suspicious_words: mlResult.suspicious_words || [],
        });

        // ── Update User stats ─────────────────────────────────────────────────────
        if (user) {
            await User.findByIdAndUpdate(user._id, {
                $inc: {
                    review_count: 1,
                    fake_count: mlResult.is_fake ? 1 : 0,
                },
            });
        }

        // ── Update Product stats ──────────────────────────────────────────────────
        if (product) {
            await Product.findByIdAndUpdate(product._id, {
                $inc: {
                    review_count: 1,
                    fake_count: mlResult.is_fake ? 1 : 0,
                },
            });
        }

        // ── Check brand manipulation patterns ────────────────────────────────────
        if (product) {
            await checkBrandManipulation(product._id).catch(console.error);
        }

        return res.status(201).json({
            success: true,
            review_id: review._id,
            ...mlResult,
        });
    } catch (err) {
        next(err);
    }
};

// ── GET /api/reviews ──────────────────────────────────────────────────────────
exports.getReviews = async (req, res, next) => {
    try {
        const {
            page = 1, limit = 20, product_id, is_fake, sort = "-createdAt",
        } = req.query;

        const filter = {};
        if (product_id) filter.product_id = product_id;
        if (is_fake !== undefined) filter.is_fake = is_fake === "true";

        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            Review.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate("user_id", "name email trust_score")
                .populate("product_id", "name category"),
            Review.countDocuments(filter),
        ]);

        return res.json({
            reviews,
            pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        next(err);
    }
};

// ── POST /api/review/bulk-upload ──────────────────────────────────────────────
exports.bulkUpload = async (req, res, next) => {
    try {
        const { reviews } = req.body;   // array of { review_text, rating, product_name }
        if (!Array.isArray(reviews) || reviews.length === 0) {
            return res.status(400).json({ error: "reviews array is required" });
        }

        const results = [];
        let fake_count = 0;

        for (const item of reviews.slice(0, 100)) {  // cap at 100
            let mlResult;
            try {
                const { data } = await axios.post(`${ML_SERVICE_URL}/api/analyze`, {
                    text: item.review_text || "",
                });
                mlResult = data;
            } catch {
                mlResult = _fallbackScore(item.review_text || "");
            }

            const doc = {
                review_text: item.review_text,
                rating: item.rating || null,
                sentiment_score: mlResult.sentiment_score,
                sentiment_label: mlResult.sentiment_label,
                fake_probability: mlResult.fake_probability,
                is_fake: mlResult.is_fake,
                confidence: mlResult.confidence,
                source: "csv_upload",
            };

            if (item.product_name) {
                const product = await Product.findOneAndUpdate(
                    { name: item.product_name },
                    { $setOnInsert: { name: item.product_name, category: item.category || "General" } },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                doc.product_id = product._id;
            }

            await Review.create(doc);
            if (mlResult.is_fake) fake_count++;
            results.push({ review_text: item.review_text?.slice(0, 50), is_fake: mlResult.is_fake });
        }

        return res.json({
            success: true,
            total_processed: results.length,
            fake_detected: fake_count,
            results,
        });
    } catch (err) {
        next(err);
    }
};

// ── Heuristic fallback when ML service is down ────────────────────────────────
function _fallbackScore(text) {
    const t = text.toLowerCase();
    const spamPhrases = [
        "amazing", "incredible", "must buy", "buy now", "best ever",
        "total scam", "worst ever", "do not buy", "changed my life",
    ];
    const hits = spamPhrases.filter((p) => t.includes(p)).length;
    const exclCount = (text.match(/!/g) || []).length;
    const capsRatio = text.replace(/[^A-Za-z]/g, "").split("").filter((c) => c === c.toUpperCase()).length
        / Math.max(text.length, 1);

    let score = Math.min(hits * 0.12 + (exclCount > 5 ? 0.15 : 0) + (capsRatio > 0.3 ? 0.15 : 0), 0.98);

    const sentimentScore = 0.5;
    return {
        fake_probability: parseFloat(score.toFixed(4)),
        is_fake: score >= 0.5,
        confidence: parseFloat(Math.max(score, 1 - score).toFixed(4)),
        sentiment_score: sentimentScore,
        sentiment_label: "neutral",
        text_features: { word_count: text.split(" ").length },
        suspicious_words: [],
    };
}
