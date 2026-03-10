const Review = require("../models/Review");
const Alert = require("../models/Alert");
const Product = require("../models/Product");

const RATING_SPIKE_THRESHOLD = 2.0;   // 200% increase
const BURST_WINDOW_HOURS = 1;
const BURST_MIN_REVIEWS = 5;
const NEW_ACCOUNT_AGE_DAYS_MAX = 7;

// ── Check brand manipulation for a product ────────────────────────────────────
exports.checkBrandManipulation = async (productId) => {
    const now = new Date();
    const oneHourAgo = new Date(now - BURST_WINDOW_HOURS * 60 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    const [recentReviews, dayReviews] = await Promise.all([
        Review.find({ product_id: productId, createdAt: { $gte: oneHourAgo } }),
        Review.find({ product_id: productId, createdAt: { $gte: oneDayAgo } }),
    ]);

    // ── 1. Review burst detection ─────────────────────────────────────────────
    if (recentReviews.length >= BURST_MIN_REVIEWS) {
        await _createAlertIfNew(productId, null, "review_burst", "high",
            `${recentReviews.length} reviews submitted in the last ${BURST_WINDOW_HOURS}h — possible coordinated attack`,
            { review_count: recentReviews.length, window_hours: BURST_WINDOW_HOURS }
        );
    }

    // ── 2. Rating spike detection ─────────────────────────────────────────────
    const product = await Product.findById(productId);
    if (product && product.review_count > 10) {
        const ratedReviews = dayReviews.filter((r) => r.rating != null);
        if (ratedReviews.length >= 3) {
            const avgRating = ratedReviews.reduce((s, r) => s + r.rating, 0) / ratedReviews.length;
            const fiveStarRatio = ratedReviews.filter((r) => r.rating === 5).length / ratedReviews.length;

            if (fiveStarRatio > 0.8 && ratedReviews.length >= 5) {
                await _createAlertIfNew(productId, null, "rating_spike", "critical",
                    `${Math.round(fiveStarRatio * 100)}% of reviews in last 24h are 5-star — rating manipulation suspected`,
                    { five_star_ratio: fiveStarRatio, avg_rating: avgRating, count: ratedReviews.length }
                );
            }
        }
    }

    // ── 3. New account bombing ────────────────────────────────────────────────
    const User = require("../models/User");
    for (const review of dayReviews) {
        if (review.user_id) {
            const user = await User.findById(review.user_id);
            if (user && user.account_age <= NEW_ACCOUNT_AGE_DAYS_MAX && user.fake_count > 0) {
                await _createAlertIfNew(productId, user._id, "new_account_bombing", "high",
                    `New account (age: ${user.account_age}d) posting fake-flagged review`,
                    { user_id: user._id, account_age: user.account_age }
                );
                break;
            }
        }
    }

    // ── 4. High similarity reviews ─────────────────────────────────────────────
    const fakeReviews = dayReviews.filter((r) => r.is_fake);
    if (fakeReviews.length >= 3) {
        await _createAlertIfNew(productId, null, "high_similarity", "medium",
            `${fakeReviews.length} fake reviews detected for this product in 24h`,
            { fake_count: fakeReviews.length }
        );
    }
};

// ── GET /api/alerts ───────────────────────────────────────────────────────────
exports.getAlerts = async (req, res, next) => {
    try {
        const { severity, alert_type, is_resolved = false, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (severity) filter.severity = severity;
        if (alert_type) filter.alert_type = alert_type;
        if (is_resolved !== undefined) filter.is_resolved = is_resolved === "true";

        const skip = (Number(page) - 1) * Number(limit);
        const [alerts, total] = await Promise.all([
            Alert.find(filter)
                .sort("-createdAt")
                .skip(skip)
                .limit(Number(limit))
                .populate("product_id", "name category")
                .populate("user_id", "name email"),
            Alert.countDocuments(filter),
        ]);

        return res.json({
            alerts,
            pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
        });
    } catch (err) {
        next(err);
    }
};

exports.resolveAlert = async (req, res, next) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { is_resolved: true },
            { new: true }
        );
        if (!alert) return res.status(404).json({ error: "Alert not found" });
        return res.json({ success: true, alert });
    } catch (err) {
        next(err);
    }
};

// ── Helper: create alert only if one doesn't already exist recently ────────────
async function _createAlertIfNew(productId, userId, type, severity, description, meta = {}) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existing = await Alert.findOne({
        product_id: productId,
        alert_type: type,
        createdAt: { $gte: oneHourAgo },
    });
    if (!existing) {
        await Alert.create({
            product_id: productId,
            user_id: userId,
            alert_type: type,
            severity,
            description,
            meta,
        });
        console.log(`🚨 Alert created: [${severity.toUpperCase()}] ${type} for product ${productId}`);
    }
}
