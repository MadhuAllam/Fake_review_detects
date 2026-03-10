const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        category: { type: String, default: "General" },
        description: { type: String, default: "" },
        avg_rating: { type: Number, default: 0 },
        review_count: { type: Number, default: 0 },
        fake_count: { type: Number, default: 0 },
        manipulation_score: { type: Number, default: 0 },   // 0-100, higher = more suspicious
        image_url: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
