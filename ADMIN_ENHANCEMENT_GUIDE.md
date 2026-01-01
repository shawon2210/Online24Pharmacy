# Online24-Pharmacy Admin Panel Enhancement Guide

## DGDA-Compliant, Integrity-Enforced Architecture

---

## 🎯 Overview

This document outlines the complete enhancement of the Online24-Pharmacy admin panel with **bulletproof data integrity**, **dependency enforcement**, and **DGDA compliance**. Every action validates relations, cascades safely, and prevents orphans, oversells, and unauthorized edits.

---

## 📋 Core Integrity Constraints

### 1. **Products Require Active Categories**

- **Rule**: Products cannot be assigned to inactive categories
- **Implementation**:
  ```javascript
  await validateProductIntegrity(data); // Checks category.isActive
  ```
- **Guard**: API rejects assignment to inactive category with 400 error
- **Audit**: Logged as `PRODUCT_UPDATE` with before/after values

### 2. **Stock Must Be Non-Negative**

- **Rule**: stockQuantity >= 0 always
- **Database Constraint**: `CHECK (stock_quantity >= 0)`
- **Implementation**: `updateProductStock()` validates before update
- **Cascade**: Zero stock → invalidate carts → notify users

### 3. **Prices Must Be Positive**

- **Rule**: price > 0, discountPrice < price
- **Database Constraint**: `CHECK (price > 0)`
- **Implementation**: Validation middleware on all price updates
- **Event**: Low price alert emitted for admin dashboard

### 4. **Rx-Required Orders Need Approved Prescriptions**

- **Rule**: Products with `requiresPrescription = true` require order.prescriptionId
- **Guard**: Cannot transition order to CONFIRMED without approved Rx
- **Audit**: Logged as `ORDER_STATUS_CHANGE` with guard reason
- **Event**: Prescription approval/rejection blocks/unlocks checkout

### 5. **Soft-Delete Enforcement**

- **Rule**: No hard deletes. Always `isActive = false`
- **Implementation**: `softDeleteProduct()`, `softDeleteCategory()`
- **Cascade**: Deactivate category → deactivate all products
- **Audit**: Logged with reason, timestamp (Dhaka +06)

### 6. **Cart Invalidation on Stock Changes**

- **Rule**: Stock = 0 → remove from all carts
- **Implementation**: `invalidateProductCarts()` on stock events
- **Event**: `carts:invalidated` broadcasts to WebSocket clients
- **Audit**: Tracked in `cart_invalidation_logs` table

---

## 🗄️ Database Schema Enhancements

### New Tables (DDL in Migration 20260101)

#### `product_audit_logs`

```sql
CREATE TABLE product_audit_logs (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES users(id),
  product_id VARCHAR(255) REFERENCES products(id) CASCADE,
  action VARCHAR(50), -- UPDATE, DELETE_SOFT, PRICE_CHANGE, STOCK_CHANGE
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP WITH TIME ZONE -- UTC+06
);
```

#### `prescription_audit_logs` (2-year retention)

```sql
CREATE TABLE prescription_audit_logs (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES users(id),
  prescription_id VARCHAR(255) REFERENCES prescriptions(id) CASCADE,
  action VARCHAR(50), -- APPROVE, REJECT, EXPIRE, VIEW
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  admin_notes TEXT,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP WITH TIME ZONE -- UTC+06
);
-- Cleanup: DELETE WHERE timestamp < NOW() - INTERVAL '2 years'
```

#### `order_audit_logs`

```sql
CREATE TABLE order_audit_logs (
  id UUID PRIMARY KEY,
  admin_id UUID,
  order_id VARCHAR(255),
  action VARCHAR(50), -- STATUS_CHANGE, EDIT, CANCEL, NOTES
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP WITH TIME ZONE -- UTC+06
);
```

#### `stock_movement_logs`

```sql
CREATE TABLE stock_movement_logs (
  id UUID PRIMARY KEY,
  product_id VARCHAR(255) REFERENCES products(id) CASCADE,
  movement_type VARCHAR(50), -- PURCHASE, SALE, ADJUSTMENT, RETURN, EXPIRY
  quantity_change INT,
  reason TEXT,
  admin_id UUID REFERENCES users(id),
  order_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE -- UTC+06
);
```

#### `cart_invalidation_logs`

```sql
CREATE TABLE cart_invalidation_logs (
  id UUID PRIMARY KEY,
  product_id VARCHAR(255),
  reason VARCHAR(100), -- OUT_OF_STOCK, CATEGORY_INACTIVE, DELETED
  affected_cart_count INT,
  timestamp TIMESTAMP WITH TIME ZONE -- UTC+06
);
```

### Check Constraints (Data Integrity)

```sql
ALTER TABLE products
  ADD CONSTRAINT check_price_positive CHECK (price > 0),
  ADD CONSTRAINT check_stock_non_negative CHECK (stock_quantity >= 0),
  ADD CONSTRAINT check_discount_valid CHECK (discount_price IS NULL OR discount_price > 0);

ALTER TABLE orders
  ADD CONSTRAINT check_total_amount_positive CHECK (total_amount > 0);
```

---

## 🛠️ Core Modules

### 1. **Integrity Middleware** (`server/db/integrityMiddleware.js`)

#### Key Functions

**`validateProductIntegrity(data)`**

- Checks price > 0
- Checks stock >= 0
- Validates category.isActive
- Validates subcategory.isActive
- Throws detailed error if validation fails

**`updateProductStock(productId, newStockQuantity, reason, adminId)`**

- Atomically updates product stock
- Logs movement to `stock_movement_logs`
- Emits `product:stock_updated` event
- Returns updated product

**`validateOrderPrescriptionRequirement(orderItems, prescriptionId)`**

- Checks if order contains Rx-required products
- If yes, validates prescription exists and is APPROVED
- Checks prescription hasn't expired
- Throws error if validation fails

**`softDeleteProduct(productId, adminId)`**

- Sets `isActive = false`
- Invalidates carts
- Logs to `product_audit_logs`
- Emits `product:deactivated` event

**`transitionOrderStatus(orderId, newStatus, adminId)`**

- Validates status transition (PENDING → CONFIRMED → ...)
- Guards: If CONFIRMED, checks Rx requirement and stock
- Updates order.status
- Logs to `order_audit_logs`
- Emits `order:status_changed` event

**`setupIntegrityEventListeners()`**

- Registers event handlers for stock/order/cart events
- Logs all integrity checks

---

### 2. **Audit Logger** (`server/utils/auditLogger.js`)

#### Key Functions

**`logProductAudit(adminId, productId, action, oldValue, newValue, ipAddress)`**

- Inserts into `product_audit_logs`
- Also logs to `admin_logs` for general trail
- Timestamp in UTC+06 (Dhaka)

**`logStockMovement(data)`**

- Tracks stock changes: PURCHASE, SALE, ADJUSTMENT, RETURN, EXPIRY
- Links to admin ID and order ID if applicable
- Timezone: UTC+06

**`logPrescriptionAudit(adminId, prescriptionId, action, oldStatus, newStatus, notes, ip)`**

- APPROVE, REJECT, EXPIRE actions
- Retained for 2 years (GDPR/DGDA compliance)
- Timestamp in UTC+06

**`getProductAuditHistory(productId, limit = 50)`**

- Returns change history with admin email, timestamps
- Used to populate product detail audit trail

**`getPrescriptionAuditHistory(prescriptionId, limit = 50)`**

- Returns Rx approval/rejection history
- Shows notes and admin who approved/rejected

**`getOrderAuditHistory(orderId, limit = 50)`**

- Returns status changes, edits, cancellations
- Shows before/after values for all changes

**`cleanupOldPrescriptionLogs()`**

- Deletes prescription logs older than 2 years
- Run monthly via cron job: `0 0 1 * * cleanupOldPrescriptionLogs`

---

### 3. **Commerce Event Emitter** (`server/events/commerceEventEmitter.js`)

#### Event System

**`product:stock_updated`**

- Emitted when stock changes
- Triggers low-stock alert, out-of-stock invalidation
- Notifies admin dashboard via WebSocket

**`product:out_of_stock`**

- Auto-emitted when newStock = 0
- Removes product from all carts
- Notifies affected users

**`product:back_in_stock`**

- Auto-emitted when oldStock = 0, newStock > 0
- Notifies users with product in wishlist

**`prescription:approved`**

- Emitted by admin approval
- Unlocks pending orders with Rx requirement
- Notifies customer

**`prescription:rejected`**

- Emitted by admin rejection
- Blocks checkout with reason
- Suggests re-upload

**`order:status_changed`**

- Emitted on any status transition
- Updates related entities (reserve/release stock)
- Notifies customer and delivery partner

**`carts:invalidated`**

- Emitted after cart items removed
- Broadcasts via WebSocket to affected users
- Triggers client-side cart refresh

**`notifications:queue`**

- Batches email/SMS/in-app notifications
- Dispatches to notification service queue

---

## 🛡️ API Endpoints (Guards & Validations)

### Products Management

#### `GET /api/admin/products`

**Features:**

- Filterable by category, search term, status (active/inactive/low-stock)
- Sortable by any field (createdAt, price, stockQuantity, etc.)
- Returns indicators: `lowStock`, `outOfStock`, `inCarts`, `ordersCount`
- **Guard**: None (read-only)

**Response:**

```json
{
  "data": [
    {
      "id": "prod_123",
      "name": "Paracetamol 500mg",
      "price": 10,
      "stockQuantity": 5,
      "minStockLevel": 10,
      "lowStock": true,
      "outOfStock": false,
      "inCarts": 3,
      "ordersCount": 45,
      "category": { "id": "cat_1", "name": "Pain Relief", "isActive": true }
    }
  ],
  "pagination": { "total": 250, "skip": 0, "take": 50 }
}
```

#### `POST /api/admin/products`

**Guards:**

- ✓ Price > 0
- ✓ Stock >= 0
- ✓ Category must exist and be active
- ✓ Subcategory must be active

**Validation:**

```javascript
body("price").isFloat({ min: 0.01 }).withMessage("Price must be positive");
body("categoryId").notEmpty(); // Validated against DB
```

**Audit:**

- Logs to `product_audit_logs`: action='CREATE'
- Logs to `admin_logs`: action='PRODUCT_CREATE'

#### `PUT /api/admin/products/:id`

**Guards:**

- ✓ Category (if changed) must be active
- ✓ Price > 0
- ✓ Stock >= 0

**Events:**

- If stock changed: `product:stock_updated`
- If stock → 0: `product:out_of_stock`

#### `PUT /api/admin/products/:id/stock`

**Strict Stock Update with Audit**

```
Request: { "quantity": 100, "reason": "MANUAL_ADJUSTMENT" }
```

**Validations:**

- quantity >= 0
- Logs to `stock_movement_logs`
- Emits stock events
- Returns updated product with timestamp

#### `DELETE /api/admin/products/:id`

**Soft-Delete Only**

```
Response: {
  "success": true,
  "message": "Product deactivated and removed from 42 carts"
}
```

**Side Effects:**

- Sets `isActive = false`
- Removes from all carts
- Logs to `product_audit_logs`: action='PRODUCT_DEACTIVATE'
- Emits `product:deactivated` event

#### `GET /api/admin/products/:id`

**Returns:**

- Product details
- Audit history (last 20 changes)
- Indicators (lowStock, outOfStock, hasDiscount)

```json
{
  "product": { ... },
  "auditHistory": [
    {
      "id": "log_1",
      "admin_email": "admin@example.com",
      "action": "UPDATE",
      "old_value": { "price": 15 },
      "new_value": { "price": 12 },
      "timestamp": "2026-01-01T10:30:00+06:00"
    }
  ]
}
```

---

## 📱 Enhanced Admin Pages (React Components)

### ProductsPage.jsx

**Features:**

- ✓ Inline editable table (click to edit name, price, stock)
- ✓ Bulk stock update (upload CSV or manual)
- ✓ Product preview with images and details
- ✓ Low-stock indicators with badges
- ✓ Audit trail panel (last 10 changes)
- ✓ Category selector (only active categories shown)
- ✓ Search and filters (status, category, price range)
- ✓ Stock change history chart

**Guards Implemented:**

- Disabled category dropdown if category is inactive
- Show warning if product requires Rx
- Prevent price <= 0 (client-side validation)
- Prevent stock < 0 (client-side validation)
- Show "Out of Stock" badge with red styling

**UI Elements:**

- Color scheme: Emerald (#10B981) for actions
- Gap spacing: gap-6 throughout
- Button style: "Save" = "Add to Cart" style (emerald, rounded)
- Sortable columns: Click header to sort
- Filterable dropdowns: Category, Status, Stock Level

### CategoriesPage.jsx

**Features:**

- ✓ Drag-drop tree reordering (categories → subcategories)
- ✓ Product count badge (e.g., "5 products")
- ✓ Inline editing (category name, description)
- ✓ Hierarchical view with nesting
- ✓ Delete guard: Cannot delete category with active products
- ✓ Real-time slug generation (for SEO)
- ✓ Toggle active/inactive
- ✓ Cascade deactivation alert

**Guards:**

- Disabled "Delete" button if category has active products
- Show tooltip: "Cannot delete category with 5 active products"
- Confirm dialog before soft-delete
- Show affected products count

### OrdersPage.jsx

**Features:**

- ✓ Kanban board: Pending | Confirmed | Processing | Shipped | Delivered
- ✓ Order cards with customer, total, status
- ✓ Drag to change status (with confirmation)
- ✓ Notes panel (admin can add order notes)
- ✓ Prescription indicator (✓ approved, ✗ rejected, ⏳ pending)
- ✓ Stock availability check before confirming
- ✓ Track delivery with location breadcrumb

**Guards:**

- Disabled "Confirm" button if:
  - Rx required but missing/rejected/expired
  - Stock insufficient for any item
- Show warning: "Out of stock: Paracetamol (need 5, have 2)"
- Locked "Delivered" → cannot edit completed orders
- Read-only mode for archived orders (> 30 days old)

**Events:**

- Order status change → emit `order:status_changed`
- Confirm → emit `stock:reserve`
- Cancel → emit `stock:release`
- Delivered → emit `notifications:queue` for feedback request

### PrescriptionsPage.jsx

**Features:**

- ✓ Inbox with product thumbnail, doctor name, date
- ✓ Image viewer (lightbox for Rx image)
- ✓ Approve/Reject buttons with reason field
- ✓ Expiry date countdown
- ✓ Auto-link to customer orders
- ✓ Reorderable flag toggle
- ✓ Search by patient name, doctor, date range

**Guards:**

- Disabled "Approve" if expiry < today
- Require rejection reason (min 20 chars)
- Show warning if approving conflicting Rx (e.g., duplicate)
- Read-only after approval (append-only notes)

**Events:**

- Approve → emit `prescription:approved` → unlock orders
- Reject → emit `prescription:rejected` → block orders

### CustomersPage.jsx

**Features:**

- ✓ Read-only view (profile, order history, prescriptions)
- ✓ Searchable table (by name, email, phone)
- ✓ View order history (link to order details)
- ✓ View prescription history
- ✓ Account status (verified, active, last login)
- ✓ Audit log: All admin views logged (GDPR)

**Guards:**

- No edit capability (read-only enforced at API level)
- No delete capability (soft-delete not allowed)
- All accesses logged with admin ID, timestamp, IP
- GDPR compliance: Can export user's data on request

---

## 🔐 Compliance & Audit Trail

### Timestamp Standard

- **All timestamps in UTC+06 (Dhaka timezone)**
- Function: `getDhakaTimestamp()`
- Database: `CURRENT_TIMESTAMP AT TIME ZONE 'UTC+06'`

### GDPR Compliance

- **Customers**: Read-only access only
- **Data Export**: API endpoint to export user's data
- **Deletion**: Soft-delete only, retained for compliance
- **Access Logging**: All customer views logged

### DGDA Compliance

- **Prescriptions**: Retained for 2 years minimum
- **Verification**: Admin notes on approval/rejection
- **Doctor License**: Stored and validated
- **Expiry Enforcement**: Cannot use expired Rx for orders

### Audit Log Schema

```javascript
{
  id: UUID,
  admin_id: UUID,
  action: "PRODUCT_UPDATE" | "ORDER_STATUS_CHANGE" | "PRESCRIPTION_APPROVE" | ...,
  target_type: "Product" | "Order" | "Prescription" | "Customer",
  target_id: UUID,
  old_value: { ... },  // Before state (JSONB)
  new_value: { ... },  // After state (JSONB)
  ip_address: "192.168.1.1",
  timestamp: "2026-01-01T10:30:00+06:00"
}
```

---

## 🧪 Validation Tests

Run tests: `npm run test:integrity`

### Test Cases

1. ✓ **No Orphan Products**: All products have active categories
2. ✓ **No Negative Stock**: All stock >= 0
3. ✓ **Positive Prices**: All prices > 0
4. ✓ **Valid Discounts**: discountPrice < price
5. ✓ **Rx-Required Orders**: Orders with Rx products have approved prescriptions
6. ✓ **Order Amount Consistency**: Total = sum of items
7. ✓ **Customer Data Read-Only**: No recent customer edits by admins
8. ✓ **Soft-Delete Enforcement**: No hard-deleted records
9. ✓ **Audit Logging Completeness**: All changes logged
10. ✓ **Prescription Retention**: Logs older than 2 years cleaned up

**Run All Tests:**

```javascript
import { runAllValidationTests } from "./server/tests/integrityValidation.test.js";
await runAllValidationTests();
```

---

## 🚀 Initialization & Setup

### 1. Database Migration

```bash
npx prisma migrate deploy
# Runs migration 20260101_add_audit_logging_and_constraints
```

### 2. Server Initialization

```javascript
// In server/index.js
import { setupIntegrityEventListeners } from "./db/integrityMiddleware.js";
import { setupEventListeners } from "./events/commerceEventEmitter.js";

// On server startup
setupIntegrityEventListeners();
setupEventListeners();
console.log("[INIT] Integrity middleware loaded");
console.log("[INIT] Commerce events configured");
```

### 3. Cron Jobs (for data maintenance)

```javascript
// Monthly cleanup of old prescription logs
schedule.scheduleJob("0 0 1 * *", async () => {
  const deleted = await cleanupOldPrescriptionLogs();
  console.log(`[CRON] Cleaned up ${deleted} old prescription logs`);
});
```

---

## 📊 Metrics & Monitoring

### Key Metrics to Track

- **Low Stock Alerts**: Count of products below min level
- **Out of Stock**: Count of zero-inventory products
- **Cart Invalidations**: Count and reason (product deleted, stock, etc.)
- **Order Conversion**: % orders progressing through status pipeline
- **Prescription Approval Rate**: % prescriptions approved vs rejected
- **Audit Log Volume**: Entries per day by action type

### Dashboard Queries

```sql
-- Daily audit summary
SELECT action, COUNT(*) as count, DATE(timestamp) as date
FROM admin_logs
GROUP BY action, DATE(timestamp)
ORDER BY date DESC;

-- Stock movement trends
SELECT movement_type, SUM(quantity_change) as total,
  DATE(timestamp) as date
FROM stock_movement_logs
GROUP BY movement_type, DATE(timestamp)
ORDER BY date DESC;

-- Low stock products
SELECT * FROM v_low_stock_products
ORDER BY stock_quantity ASC
LIMIT 20;
```

---

## 🔗 API Summary Table

| Endpoint                               | Method | Guards                                 | Events                  | Audit                |
| -------------------------------------- | ------ | -------------------------------------- | ----------------------- | -------------------- |
| `/api/admin/products`                  | GET    | None                                   | None                    | None                 |
| `/api/admin/products`                  | POST   | Category active, Price > 0, Stock >= 0 | `product:created`       | PRODUCT_CREATE       |
| `/api/admin/products/:id`              | PUT    | Category active                        | `product:stock_updated` | PRODUCT_UPDATE       |
| `/api/admin/products/:id/stock`        | PUT    | Stock >= 0                             | `product:stock_updated` | STOCK_CHANGE         |
| `/api/admin/products/:id`              | DELETE | None                                   | `product:out_of_stock`  | PRODUCT_DEACTIVATE   |
| `/api/admin/categories`                | GET    | None                                   | None                    | None                 |
| `/api/admin/categories`                | POST   | Name unique                            | `category:created`      | CATEGORY_CREATE      |
| `/api/admin/categories/:id`            | PUT    | Has active products?                   | `category:updated`      | CATEGORY_UPDATE      |
| `/api/admin/categories/:id`            | DELETE | No active products                     | `category:deactivated`  | CATEGORY_DEACTIVATE  |
| `/api/admin/orders/:id/status`         | PUT    | Check Rx, Stock                        | `order:status_changed`  | ORDER_STATUS_CHANGE  |
| `/api/admin/prescriptions/:id/approve` | POST   | Not expired                            | `prescription:approved` | PRESCRIPTION_APPROVE |
| `/api/admin/prescriptions/:id/reject`  | POST   | Require notes                          | `prescription:rejected` | PRESCRIPTION_REJECT  |
| `/api/admin/customers/:id`             | GET    | None                                   | None                    | CUSTOMER_VIEW        |
| `/api/admin/audit-logs`                | GET    | None                                   | None                    | None                 |

---

## 📚 File Structure

```
server/
├── db/
│   ├── integrityMiddleware.js      # Guards & constraints
│   └── auditLogger.js               # Audit logging (expanded)
├── events/
│   └── commerceEventEmitter.js      # Event system
├── routes/admin/
│   ├── products.js                  # Products with guards
│   ├── categories.js                # Categories with guards
│   ├── orders.js                    # Orders with status guards
│   └── prescriptions.js             # Prescriptions with validation
├── tests/
│   └── integrityValidation.test.js  # Validation tests
└── utils/
    └── auditLogger.js               # (shared)

src/pages/admin/
├── ProductsPage.jsx                 # Inline editing, bulk actions
├── CategoriesPage.jsx               # Drag-drop tree
├── OrdersPage.jsx                   # Kanban board
├── PrescriptionsPage.jsx            # Image inbox
└── CustomersPage.jsx                # Read-only profiles

prisma/
├── schema.prisma                    # (existing, no changes needed)
└── migrations/
    └── 20260101_add_audit_logging_and_constraints/
        └── migration.sql            # NEW: Audit tables, constraints
```

---

## ✅ Deployment Checklist

- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Run validation tests: `npm run test:integrity`
- [ ] Initialize event listeners in server startup
- [ ] Enable audit logging middleware
- [ ] Deploy updated admin pages
- [ ] Set up cron job for prescription log cleanup
- [ ] Configure WebSocket for real-time updates
- [ ] Test inventory constraints with sample data
- [ ] Test Rx requirement blocking orders
- [ ] Test cart invalidation on stock = 0
- [ ] Verify all timestamps in UTC+06
- [ ] Monitor audit log volume and set alerts

---

## 🎓 Examples

### Example 1: Updating Product Stock

```javascript
// Admin updates stock for low-stock product
const product = await updateProductStock(
  "prod_123", // Product ID
  50, // New stock quantity
  "MANUAL_ADJUSTMENT", // Reason
  "admin_user_id" // Who made the change
);

// Result:
// 1. product.stockQuantity = 50
// 2. Logged to stock_movement_logs (quantity_change: +30)
// 3. Logged to admin_logs (PRODUCT_STOCK_CHANGE)
// 4. Event emitted: product:stock_updated
// 5. If stock rises from 0 → notify wishlist users
```

### Example 2: Rejecting a Prescription

```javascript
// Admin rejects prescription with reason
await logPrescriptionAudit(
  "admin_id",
  "rx_123",
  "REJECT",
  "PENDING",
  "REJECTED",
  "Expired prescription - license not valid",
  "192.168.1.1"
);

// Result:
// 1. Logged to prescription_audit_logs
// 2. Logged to admin_logs
// 3. Event emitted: prescription:rejected
// 4. Customer notified: "Please upload new prescription"
// 5. Related pending orders blocked from checkout
```

### Example 3: Deleting a Product

```javascript
// Admin deactivates product
const product = await softDeleteProduct("prod_123", "admin_id");

// Result:
// 1. product.isActive = false
// 2. All 42 cart items removed
// 3. Logged to product_audit_logs (action='PRODUCT_DEACTIVATE')
// 4. Event emitted: product:deactivated
// 5. Response: "Product deactivated and removed from 42 carts"
```

---

## 🆘 Troubleshooting

### Issue: "Category is inactive. Cannot assign product"

**Cause**: Trying to assign product to inactive category
**Fix**: Activate category first via Categories admin page

### Issue: "Insufficient stock for Paracetamol"

**Cause**: Cannot confirm order - stock < quantity needed
**Fix**: Increase stock via inventory admin or cancel order items

### Issue: "Prescription is pending"

**Cause**: Cannot checkout with unapproved prescription
**Fix**: Wait for admin approval or upload new prescription

### Issue: "Cannot deactivate category with 5 active products"

**Cause**: Trying to delete category with products still in it
**Fix**: Deactivate products first or move to different category

---

## 📖 References

- **DGDA Compliance**: Prescription retention 2 years, doctor license validation
- **GDPR Compliance**: Customer data read-only, access logging, data export
- **Database Integrity**: Foreign keys, check constraints, triggers
- **Event-Driven Architecture**: Real-time cache invalidation, notifications
- **Audit Trail**: Full change history, immutable logs, GDPR retention

---

**Generated**: 2026-01-01  
**Version**: 1.0 (Production Ready)  
**Last Updated**: Implements comprehensive integrity constraints, DGDA/GDPR compliance, event-driven architecture
