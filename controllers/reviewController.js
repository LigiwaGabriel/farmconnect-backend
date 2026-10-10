const pool = require("../config/db");

async function getProductReviews(req, res) {
  const [reviews] = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, r.buyer_id, u.full_name AS buyer_name
     FROM reviews r
     JOIN users u ON r.buyer_id = u.id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC`,
    [req.params.productId]
  );

  const count = reviews.length;
  const average = count
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
    : 0;

  res.json({ reviews, summary: { count, average: Number(average.toFixed(1)) } });
}

async function saveReview(req, res) {
  const rating = Number(req.body.rating);
  const comment = (req.body.comment || "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
  }

  const [products] = await pool.query("SELECT id FROM products WHERE id = ?", [req.params.productId]);
  if (!products[0]) {
    return res.status(404).json({ message: "Product not found." });
  }

  await pool.query(
    `INSERT INTO reviews (product_id, buyer_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
    [req.params.productId, req.user.id, rating, comment || null]
  );

  res.status(201).json({ message: "Review saved." });
}

module.exports = { getProductReviews, saveReview };