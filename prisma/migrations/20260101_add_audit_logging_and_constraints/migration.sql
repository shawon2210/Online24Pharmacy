-- Add detailed admin audit logging with change tracking
-- This migration enhances the admin_logs table for full DGDA compliance

-- Enhance admin_logs with comprehensive change tracking
ALTER TABLE admin_logs
ADD COLUMN old_value JSONB,
ADD COLUMN new_value JSONB,
ADD COLUMN change_reason VARCHAR(255),
ADD COLUMN ip_address VARCHAR(45);

-- Create product_audit_logs for detailed product changes
CREATE TABLE IF NOT EXISTS product_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    admin_id UUID NOT NULL REFERENCES users (id) ON DELETE NO ACTION,
    product_id VARCHAR(255) NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- UPDATE, DELETE_SOFT, PRICE_CHANGE, STOCK_CHANGE
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP
    WITH
        TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC+06'
);

CREATE INDEX idx_product_audit_logs_admin_id ON product_audit_logs (admin_id);

CREATE INDEX idx_product_audit_logs_product_id ON product_audit_logs (product_id);

CREATE INDEX idx_product_audit_logs_timestamp ON product_audit_logs (timestamp);

CREATE INDEX idx_product_audit_logs_action ON product_audit_logs (action);

-- Create prescription_audit_logs for detailed Rx changes (retain 2 years)
CREATE TABLE IF NOT EXISTS prescription_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    admin_id UUID REFERENCES users (id) ON DELETE NO ACTION,
    prescription_id VARCHAR(255) NOT NULL REFERENCES prescriptions (id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- APPROVE, REJECT, EXPIRE, VIEW, DELETE_SOFT
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    admin_notes TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP
    WITH
        TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC+06'
);

CREATE INDEX idx_prescription_audit_logs_prescription_id ON prescription_audit_logs (prescription_id);

CREATE INDEX idx_prescription_audit_logs_admin_id ON prescription_audit_logs (admin_id);

CREATE INDEX idx_prescription_audit_logs_timestamp ON prescription_audit_logs (timestamp);

CREATE INDEX idx_prescription_audit_logs_action ON prescription_audit_logs (action);

-- Create order_audit_logs for detailed order status changes
CREATE TABLE IF NOT EXISTS order_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    admin_id UUID REFERENCES users (id) ON DELETE NO ACTION,
    order_id VARCHAR(255) NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- STATUS_CHANGE, EDIT, CANCEL, NOTES
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP
    WITH
        TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC+06'
);

CREATE INDEX idx_order_audit_logs_order_id ON order_audit_logs (order_id);

CREATE INDEX idx_order_audit_logs_admin_id ON order_audit_logs (admin_id);

CREATE INDEX idx_order_audit_logs_timestamp ON order_audit_logs (timestamp);

-- Create stock_movement_logs for inventory tracking
CREATE TABLE IF NOT EXISTS stock_movement_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    product_id VARCHAR(255) NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- PURCHASE, SALE, ADJUSTMENT, RETURN, EXPIRY
    quantity_change INT NOT NULL,
    reason TEXT,
    admin_id UUID REFERENCES users (id) ON DELETE NO ACTION,
    order_id VARCHAR(255),
    timestamp TIMESTAMP
    WITH
        TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC+06'
);

CREATE INDEX idx_stock_movement_logs_product_id ON stock_movement_logs (product_id);

CREATE INDEX idx_stock_movement_logs_timestamp ON stock_movement_logs (timestamp);

CREATE INDEX idx_stock_movement_logs_movement_type ON stock_movement_logs (movement_type);

-- Create cart_invalidation_logs to track stock-related cart clears
CREATE TABLE IF NOT EXISTS cart_invalidation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    product_id VARCHAR(255) NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL, -- OUT_OF_STOCK, CATEGORY_INACTIVE, DELETED
    affected_cart_count INT DEFAULT 0,
    timestamp TIMESTAMP
    WITH
        TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP AT TIME ZONE 'UTC+06'
);

CREATE INDEX idx_cart_invalidation_logs_product_id ON cart_invalidation_logs (product_id);

CREATE INDEX idx_cart_invalidation_logs_timestamp ON cart_invalidation_logs (timestamp);

-- Add check constraints for data integrity
ALTER TABLE products
ADD CONSTRAINT check_price_positive CHECK (price > 0),
ADD CONSTRAINT check_stock_non_negative CHECK (stock_quantity >= 0),
ADD CONSTRAINT check_max_order_positive CHECK (max_order_quantity > 0),
ADD CONSTRAINT check_discount_valid CHECK (
    discount_price IS NULL
    OR (
        discount_price > 0
        AND discount_price < price
    )
);

-- Add check constraint for order amounts
ALTER TABLE orders
ADD CONSTRAINT check_total_amount_positive CHECK (total_amount > 0);

-- Add check constraint for prescription expiry
ALTER TABLE prescriptions
ADD CONSTRAINT check_expiry_valid CHECK (
    expires_at IS NULL
    OR expires_at > created_at
);

-- Create view for active products with category info
CREATE OR REPLACE VIEW v_active_products_with_category AS
SELECT
    p.id,
    p.name,
    p.slug,
    p.price,
    p.discount_price,
    p.stock_quantity,
    p.requires_prescription,
    p.category_id,
    c.name as category_name,
    c.slug as category_slug,
    p.updated_at
FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
WHERE
    p.is_active = true
    AND c.is_active = true;

-- Create view for stock alert products
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT p.id, p.name, p.stock_quantity, p.min_stock_level, c.name as category_name
FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
WHERE
    p.is_active = true
    AND p.stock_quantity <= p.min_stock_level
ORDER BY p.stock_quantity ASC;

-- Add function to log admin actions automatically
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_audit_logs (admin_id, product_id, action, old_value, new_value, timestamp)
  VALUES (NEW.id, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), CURRENT_TIMESTAMP);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create cleanup job for old prescription logs (GDPR compliance - keep 2 years)
-- Run this periodically: SELECT cleanup_old_prescription_logs();
CREATE OR REPLACE FUNCTION cleanup_old_prescription_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM prescription_audit_logs
  WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Add user profile view for admin access (read-only)
CREATE OR REPLACE VIEW v_user_profiles AS
SELECT
    u.id,
    u.email,
    u.phone,
    u.first_name,
    u.last_name,
    u.is_verified,
    u.created_at,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT p.id) as total_prescriptions,
    MAX(u.last_login_at) as last_login
FROM
    users u
    LEFT JOIN orders o ON u.id = o.user_id
    LEFT JOIN prescriptions p ON u.id = p.user_id
WHERE
    u.role = 'USER'
GROUP BY
    u.id;