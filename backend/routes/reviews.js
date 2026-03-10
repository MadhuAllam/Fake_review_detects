const express = require("express");
const router = express.Router();
const { analyzeReview, getReviews, bulkUpload } = require("../controllers/reviewController");

router.post("/analyze", analyzeReview);
router.post("/bulk-upload", bulkUpload);
router.get("/", getReviews);

module.exports = router;
