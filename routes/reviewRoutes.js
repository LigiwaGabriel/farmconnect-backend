const express = require("express");
const { getProductReviews, saveReview } = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.get("/product/:productId", asyncHandler(getProductReviews));
router.post("/product/:productId", authMiddleware, roleMiddleware("buyer"), asyncHandler(saveReview));

module.exports = router;