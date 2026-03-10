const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        review_text: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, default: null },
        sentiment_score: { type: Number, default: 0.5 },           // 0 (neg) – 1 (pos)
        sentiment_label: { type: String, enum: ["positive", "negative", "neutral"], default: "neutral" },
        fake_probability: { type: Number, default: 0 },              // 0 – 1
        is_fake: { type: Boolean, default: false },
        confidence: { type: Number, default: 0 },
        text_features: { type: Object, default: {} },
        suspicious_words: { type: Array, default: [] },
        source: { type: String, enum: ["manual", "csv_upload"], default: "manual" },
    },
    { timestamps: true }
);

reviewSchema.index({ product_id: 1, createdAt: -1 });
reviewSchema.index({ user_id: 1, createdAt: -1 });
reviewSchema.index({ fake_probability: -1 });

module.exports = mongoose.model("Review", reviewSchema);
