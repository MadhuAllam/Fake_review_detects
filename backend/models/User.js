const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        trust_score: { type: Number, default: 50, min: 0, max: 100 },
        account_age: { type: Number, default: 0 },         // days since creation
        review_count: { type: Number, default: 0 },
        fake_count: { type: Number, default: 0 },
        is_bot: { type: Boolean, default: false },
        bot_confidence: { type: Number, default: 0 },
        unique_products: { type: Number, default: 0 },
        avg_sentiment: { type: Number, default: 0.5 },
        avatar: { type: String, default: "" },
    },
    { timestamps: true }
);

// Virtual: fake ratio
userSchema.virtual("fake_ratio").get(function () {
    return this.review_count > 0
        ? (this.fake_count / this.review_count).toFixed(2)
        : 0;
});

module.exports = mongoose.model("User", userSchema);
