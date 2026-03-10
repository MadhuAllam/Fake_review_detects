const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Review = require("../models/Review");

// GET /api/products — list all products with stats
router.get("/", async (req, res, next) => {
    try {
        const products = await Product.find().sort("-review_count").limit(50);
        return res.json({ products });
    } catch (err) { next(err); }
});

// GET /api/products/:id/sentiment — sentiment timeline
router.get("/:id/sentiment", async (req, res, next) => {
    try {
        const reviews = await Review.find({ product_id: req.params.id })
            .select("sentiment_score sentiment_label fake_probability createdAt")
            .sort("createdAt");

        // Group by month
        const byMonth = {};
        for (const r of reviews) {
            const key = r.createdAt.toISOString().slice(0, 7); // YYYY-MM
            if (!byMonth[key]) byMonth[key] = { positive: 0, negative: 0, neutral: 0, total: 0, avg_fake: 0 };
            byMonth[key][r.sentiment_label]++;
            byMonth[key].total++;
            byMonth[key].avg_fake += r.fake_probability;
        }

        const timeline = Object.entries(byMonth).map(([month, data]) => ({
            month,
            ...data,
            avg_fake: parseFloat((data.avg_fake / data.total).toFixed(4)),
        }));

        return res.json({ product_id: req.params.id, timeline });
    } catch (err) { next(err); }
});

module.exports = router;
