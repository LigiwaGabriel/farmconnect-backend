USE farmconnect;

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  buyer_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (buyer_id, product_id),
  CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);