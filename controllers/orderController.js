const pool = require("../config/db");

const allowedStatuses = ["pending", "accepted", "rejected", "completed", "cancelled"];

async function createOrder(req, res) {
  const { product_id, quantity_requested, delivery_option, buyer_message } = req.body;

  if (!product_id || !quantity_requested || !delivery_option) {
    return res.status(400).json({ message: "Product, quantity, and delivery option are required." });
  }

  const [products] = await pool.query("SELECT * FROM products WHERE id = ?", [product_id]);
  const product = products[0];

  if (!product || product.availability_status !== "available") {
    return res.status(404).json({ message: "This product is not available." });
  }

  if (product.farmer_id === req.user.id) {
    return res.status(400).json({ message: "Farmers cannot order their own products." });
  }

  if (Number(quantity_requested) > Number(product.quantity)) {
    return res.status(400).json({ message: "Requested quantity is higher than available quantity." });
  }

  const totalEstimatedPrice = Number(quantity_requested) * Number(product.price_per_unit);
  const [result] = await pool.query(
    `INSERT INTO orders
      (buyer_id, farmer_id, product_id, quantity_requested, total_estimated_price, delivery_option, buyer_message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, product.farmer_id, product_id, quantity_requested, totalEstimatedPrice, delivery_option, buyer_message || null]
  );

  res.status(201).json({ message: "Order request sent.", id: result.insertId });
}

async function getMyOrders(req, res) {
  const [orders] = await pool.query(
    `SELECT o.*, p.product_name, p.unit, u.full_name AS farmer_name
     FROM orders o
     JOIN products p ON o.product_id = p.id
     JOIN users u ON o.farmer_id = u.id
     WHERE o.buyer_id = ?
     ORDER BY o.created_at DESC`,
    [req.user.id]
  );

  res.json({ orders });
}

async function getFarmerOrders(req, res) {
  const [orders] = await pool.query(
    `SELECT o.*, p.product_name, p.unit, u.full_name AS buyer_name, u.phone AS buyer_phone
     FROM orders o
     JOIN products p ON o.product_id = p.id
     JOIN users u ON o.buyer_id = u.id
     WHERE o.farmer_id = ?
     ORDER BY o.created_at DESC`,
    [req.user.id]
  );

  res.json({ orders });
}

async function updateOrderStatus(req, res) {
  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status." });
  }

  const [orders] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  const order = orders[0];

  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  if (req.user.role !== "admin" && order.farmer_id !== req.user.id) {
    return res.status(403).json({ message: "You can only update orders for your own products." });
  }

  await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
  res.json({ message: "Order status updated." });
}

async function cancelOrder(req, res) {
  const [orders] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  const order = orders[0];

  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  if (order.buyer_id !== req.user.id) {
    return res.status(403).json({ message: "You can only cancel your own orders." });
  }

  if (order.status !== "pending") {
    return res.status(400).json({ message: "Only pending orders can be cancelled." });
  }

  await pool.query(
    "UPDATE orders SET status = 'cancelled' WHERE id = ? AND status = 'pending'",
    [req.params.id]
  );
  res.json({ message: "Order cancelled." });
}
module.exports = { createOrder, getMyOrders, getFarmerOrders, updateOrderStatus, cancelOrder };
