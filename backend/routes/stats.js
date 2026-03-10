const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const User = require("../models/User");
const Alert = require("../models/Alert");
const Product = require("../models/Product");

// GET /api/stats — dashboard summary
router.get("/", async (req, res, next) => {
    try {
        const [totalReviews, fakeReviews, totalUsers, botUsers, totalAlerts, totalProducts] = await Promise.all([
            Review.countDocuments(),
            Review.countDocuments({ is_fake: true }),
            User.countDocuments(),
            User.countDocuments({ is_bot: true }),
            Alert.countDocuments({ is_resolved: false }),
            Product.countDocuments(),
        ]);

        // Last 7 days volume
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const volumeByDay = await Review.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: 1 },
                    fake: { $sum: { $cond: ["$is_fake", 1, 0] } },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Sentiment distribution
        const sentimentDist = await Review.aggregate([
            { $group: { _id: "$sentiment_label", count: { $sum: 1 } } },
        ]);

        // Top suspicious users
        const suspiciousUsers = await User.find({ trust_score: { $lt: 40 } })
            .sort("trust_score")
            .limit(5)
            .select("name email trust_score review_count fake_count is_bot");

        return res.json({
            summary: {
                totalReviews,
                fakeReviews,
                realReviews: totalReviews - fakeReviews,
                fakePercent: totalReviews > 0 ? parseFloat(((fakeReviews / totalReviews) * 100).toFixed(1)) : 0,
                totalUsers,
                botUsers,
                totalAlerts,
                totalProducts,
            },
            volumeByDay,
            sentimentDist,
            suspiciousUsers,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
