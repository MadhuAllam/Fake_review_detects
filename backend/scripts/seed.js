require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Alert = require("../models/Alert");

const USERS = [
    { name: "Alice Martin", email: "alice@example.com", trust_score: 92, account_age: 365, review_count: 0, fake_count: 0 },
    { name: "Bob Kumar", email: "bob@example.com", trust_score: 78, account_age: 200, review_count: 0, fake_count: 0 },
    { name: "Carol Price", email: "carol@example.com", trust_score: 61, account_age: 120, review_count: 0, fake_count: 0 },
    { name: "BotUser_X1", email: "botx1@spam.com", trust_score: 12, account_age: 2, review_count: 0, fake_count: 0, is_bot: true },
    { name: "FakeReview99", email: "fake99@example.com", trust_score: 22, account_age: 5, review_count: 0, fake_count: 0 },
];

const PRODUCTS = [
    { name: "Sony WH-1000XM5", category: "Electronics" },
    { name: "Nike Air Max 270", category: "Footwear" },
    { name: "Instant Pot Pro", category: "Kitchen" },
    { name: "Protein Gold", category: "Health" },
    { name: "DeskPro Lamp", category: "Home Office" },
];

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await Promise.all([User.deleteMany({}), Product.deleteMany({}), Review.deleteMany({}), Alert.deleteMany({})]);
    console.log("🗑️  Cleared existing data");

    const users = await User.insertMany(USERS);
    const products = await Product.insertMany(PRODUCTS);
    console.log(`✅ Seeded ${users.length} users and ${products.length} products`);

    // Seed reviews
    const reviewDocs = [
        { user_id: users[0]._id, product_id: products[0]._id, review_text: "Great headphones! Excellent noise cancellation and comfortable for long listening sessions.", sentiment_score: 0.82, sentiment_label: "positive", fake_probability: 0.08, is_fake: false, confidence: 0.92, rating: 5 },
        { user_id: users[1]._id, product_id: products[0]._id, review_text: "BEST HEADPHONES EVER!! MUST BUY!! AMAZING!!", sentiment_score: 0.95, sentiment_label: "positive", fake_probability: 0.91, is_fake: true, confidence: 0.91, rating: 5 },
        { user_id: users[2]._id, product_id: products[1]._id, review_text: "Comfortable shoes, true to size. Good for walking. Sole wears out faster than expected.", sentiment_score: 0.58, sentiment_label: "positive", fake_probability: 0.11, is_fake: false, confidence: 0.89, rating: 4 },
        { user_id: users[3]._id, product_id: products[1]._id, review_text: "PERFECT SHOES!! MUST BUY!! EVERYONE NEEDS THESE NOW!!", sentiment_score: 0.97, sentiment_label: "positive", fake_probability: 0.94, is_fake: true, confidence: 0.94, rating: 5 },
        { user_id: users[3]._id, product_id: products[2]._id, review_text: "INCREDIBLE INSTANT POT!! LIFE CHANGING!! BUY NOW!!", sentiment_score: 0.96, sentiment_label: "positive", fake_probability: 0.93, is_fake: true, confidence: 0.93, rating: 5 },
        { user_id: users[3]._id, product_id: products[3]._id, review_text: "BEST PROTEIN EVER!! AMAZING RESULTS!! BUY IMMEDIATELY!!", sentiment_score: 0.97, sentiment_label: "positive", fake_probability: 0.95, is_fake: true, confidence: 0.95, rating: 5 },
        { user_id: users[4]._id, product_id: products[0]._id, review_text: "WORST PRODUCT!! TOTAL SCAM!! AVOID!! DO NOT BUY!!", sentiment_score: 0.04, sentiment_label: "negative", fake_probability: 0.88, is_fake: true, confidence: 0.88, rating: 1 },
        { user_id: users[0]._id, product_id: products[4]._id, review_text: "Nice lamp for reading. Adjustable brightness. USB port is handy. A bit wobbly at the base.", sentiment_score: 0.64, sentiment_label: "positive", fake_probability: 0.07, is_fake: false, confidence: 0.93, rating: 4 },
    ];
    const reviews = await Review.insertMany(reviewDocs);
    console.log(`✅ Seeded ${reviews.length} reviews`);

    // Update user counts
    await User.findByIdAndUpdate(users[0]._id, { review_count: 2, fake_count: 0 });
    await User.findByIdAndUpdate(users[1]._id, { review_count: 1, fake_count: 1 });
    await User.findByIdAndUpdate(users[2]._id, { review_count: 1, fake_count: 0 });
    await User.findByIdAndUpdate(users[3]._id, { review_count: 4, fake_count: 4 });
    await User.findByIdAndUpdate(users[4]._id, { review_count: 1, fake_count: 1 });

    // Seed alerts
    const alerts = [
        { product_id: products[0]._id, alert_type: "review_burst", severity: "high", description: "12 reviews submitted in the last 1h — coordinated attack suspected", meta: { review_count: 12 } },
        { product_id: products[1]._id, alert_type: "rating_spike", severity: "critical", description: "94% of recent reviews are 5-star — manipulation suspected", meta: { five_star_ratio: 0.94 } },
        { product_id: products[2]._id, alert_type: "high_similarity", severity: "medium", description: "8 highly similar fake reviews detected in 24h", meta: { fake_count: 8 } },
        { user_id: users[3]._id, alert_type: "bot_detected", severity: "high", description: "User posted 4 reviews across 4 products within 60 seconds", meta: { burst_seconds: 47 } },
    ];
    await Alert.insertMany(alerts);
    console.log(`✅ Seeded ${alerts.length} alerts`);

    await mongoose.disconnect();
    console.log("\n🎉 Seed complete! Run: node server.js to start.");
}

seed().catch((err) => { console.error(err); process.exit(1); });
