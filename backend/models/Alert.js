const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        alert_type: {
            type: String,
            enum: [
                "rating_spike",
                "review_burst",
                "bot_detected",
                "high_similarity",
                "new_account_bombing",
                "sentiment_manipulation",
            ],
            required: true,
        },
        severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
        description: { type: String, required: true },
        is_resolved: { type: Boolean, default: false },
        meta: { type: Object, default: {} },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
