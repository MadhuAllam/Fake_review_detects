const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");
const Review = require("../models/Review");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// GET /api/reviewer/:id — reviewer profile + trust score
router.get("/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "Reviewer not found" });

        const reviews = await Review.find({ user_id: user._id })
            .sort("-createdAt")
            .limit(50)
            .populate("product_id", "name category");

        // Compute behavioral stats
        const review_texts = reviews.map((r) => r.review_text);
        const sentimentValues = reviews.map((r) => r.sentiment_score);
        const avg_sentiment = sentimentValues.length
            ? sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length
            : 0.5;
        const sentiment_std = _std(sentimentValues);
        const unique_products = new Set(reviews.map((r) => String(r.product_id)).filter(Boolean)).size;
        const avg_review_length = review_texts.length
            ? review_texts.reduce((a, b) => a + b.split(" ").length, 0) / review_texts.length
            : 0;

        // Call ML Trust Score endpoint
        let trustResult;
        try {
            const { data } = await axios.post(`${ML_SERVICE_URL}/api/trust-score`, {
                reviewer_id: String(user._id),
                review_count: user.review_count,
                fake_count: user.fake_count,
                avg_review_length,
                unique_products,
                account_age_days: user.account_age,
                avg_sentiment,
                sentiment_std,
                burst_detected: user.is_bot,
                duplicate_ratio: user.review_count > 0 ? user.fake_count / user.review_count : 0,
                review_texts,
            });
            trustResult = data;
        } catch {
            trustResult = { trust_score: user.trust_score, category: "medium", label: "Medium Trust", breakdown: {} };
        }

        // Persist updated trust score
        await User.findByIdAndUpdate(user._id, {
            trust_score: trustResult.trust_score,
            avg_sentiment,
            unique_products,
        });

        return res.json({
            user: {
                ...user.toObject(),
                trust_score: trustResult.trust_score,
                trust_category: trustResult.category,
                trust_label: trustResult.label,
                trust_breakdown: trustResult.breakdown,
            },
            review_stats: {
                total: user.review_count,
                fake: user.fake_count,
                real: user.review_count - user.fake_count,
                avg_sentiment: parseFloat(avg_sentiment.toFixed(4)),
                unique_products,
                avg_review_length: parseFloat(avg_review_length.toFixed(0)),
            },
            recent_reviews: reviews.slice(0, 10),
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/reviewer — leaderboard (top trusted + most suspicious)
router.get("/", async (req, res, next) => {
    try {
        const { sort = "-trust_score", limit = 20, page = 1 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            User.find().sort(sort).skip(skip).limit(Number(limit)),
            User.countDocuments(),
        ]);
        return res.json({ users, pagination: { total, page: Number(page), limit: Number(limit) } });
    } catch (err) {
        next(err);
    }
});

function _std(arr) {
    if (!arr.length) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length;
    return parseFloat(Math.sqrt(variance).toFixed(4));
}

module.exports = router;
