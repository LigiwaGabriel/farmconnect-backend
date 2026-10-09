const pool = require("../config/db");

async function getMyFavorites(req, res) {
  const [favorites] = await pool.query(
    `SELECT f.id, f.product_id, f.created_at, p.product_name, p.price_per_unit,
            p.unit, p.district, p.image, p.availability_status, c.name AS category_name
     FROM favorites f
     JOIN products p ON f.product_id = p.id
     LEFT JOIN product_categories c ON p.category_id = c.id
     WHERE f.buyer_id = ?
     ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  res.json({ favorites });
}

async function addFavorite(req, res) {
  const [products] = await pool.query("SELECT id FROM products WHERE id = ?", [req.params.productId]);
  if (!products[0]) {
    return res.status(404).json({ message: "Product not found." });
  }
  await pool.query(
    "INSERT IGNORE INTO favorites (buyer_id, product_id) VALUES (?, ?)",
    [req.user.id, req.params.productId]
  );
  res.status(201).json({ message: "Product saved to favorites." });
}

async function removeFavorite(req, res) {
  await pool.query(
    "DELETE FROM favorites WHERE buyer_id = ? AND product_id = ?",
    [req.user.id, req.params.productId]
  );
  res.json({ message: "Product removed from favorites." });
}

module.exports = { getMyFavorites, addFavorite, removeFavorite };