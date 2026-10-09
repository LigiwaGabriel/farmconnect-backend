const express = require("express");
const { getMyFavorites, addFavorite, removeFavorite } = require("../controllers/favoriteController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("buyer"));

router.get("/", asyncHandler(getMyFavorites));
router.post("/:productId", asyncHandler(addFavorite));
router.delete("/:productId", asyncHandler(removeFavorite));

module.exports = router;