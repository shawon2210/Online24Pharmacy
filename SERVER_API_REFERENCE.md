# Server API Quick Reference

## Base URL: `http://localhost:3000/api`

---

## 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/refresh` | Refresh access token | ❌ |
| POST | `/auth/logout` | User logout | ❌ |
| GET | `/auth/me` | Get current user | ✅ |

---

## 🛍️ Product Routes (`/api/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | List all products | ❌ |
| GET | `/products/categories` | List categories | ❌ |
| GET | `/products/subcategories` | List subcategories | ❌ |
| GET | `/products/:slug` | Get product by slug | ❌ |
| POST | `/products` | Create product | ✅ Admin |
| PUT | `/products/:id` | Update product | ✅ Admin |
| DELETE | `/products/:id` | Delete product | ✅ Admin |
| POST | `/products/upload` | Upload product image | ✅ Admin |

---

## 🛒 Cart Routes (`/api/cart`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cart` | Get user cart | ✅ |
| POST | `/cart` | Add to cart | ✅ |
| PATCH | `/cart` | Update cart item | ✅ |
| DELETE | `/cart/:itemId` | Remove from cart | ✅ |

---

## 📦 Order Routes (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/orders` | Get user orders | ✅ |
| GET | `/orders/:orderId` | Get order details | ✅ |
| POST | `/orders` | Create order | ✅ |

---

## 💊 Prescription Routes (`/api/prescriptions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/prescriptions` | Get user prescriptions | ✅ |
| POST | `/prescriptions` | Submit prescription | ✅ |
| POST | `/prescriptions/upload` | Upload prescription file | ✅ |
| POST | `/prescriptions/:id/reorder` | Reorder from prescription | ✅ |
| POST | `/prescriptions/:id/reminder` | Set expiry reminder | ✅ |

---

## 💳 Payment Routes (`/api/payments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/bkash/create` | Create bKash payment | ✅ |
| POST | `/payments/nagad/create` | Create Nagad payment | ✅ |
| POST | `/payments/verify` | Verify payment | ✅ |

---

## ❤️ Wishlist Routes (`/api/wishlist`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/wishlist` | Get user wishlist | ✅ |
| POST | `/wishlist/add` | Add to wishlist | ✅ |
| DELETE | `/wishlist/remove/:productId` | Remove from wishlist | ✅ |

---

## ⭐ Review Routes (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reviews/product/:productId` | Get product reviews | ❌ |
| POST | `/reviews` | Add review | ✅ |
| GET | `/reviews/pending` | Get pending reviews | ✅ Admin |
| PATCH | `/reviews/:id/status` | Update review status | ✅ Admin |
| GET | `/reviews/stats` | Get review statistics | ✅ Admin |

---

## 🎟️ Coupon Routes (`/api/coupons`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/coupons/apply` | Apply coupon code | ❌ |

---

## 📊 Analytics Routes (`/api/analytics`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics/dashboard` | Get dashboard analytics | ✅ Admin |
| POST | `/analytics/track` | Track event | ❌ |

---

## 📈 Report Routes (`/api/reports`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reports/sales` | Sales report | ✅ Admin |
| GET | `/reports/inventory` | Inventory report | ✅ Admin |

---

## 🚚 Delivery Routes (`/api/delivery`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/delivery/coverage?area=dhanmondi` | Check delivery coverage | ❌ |

---

## 👤 User Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get user profile | ✅ |
| PATCH | `/users/me` | Update user profile | ✅ |
| GET | `/users/me/orders` | Get user orders | ✅ |

---

## 🤖 Chatbot Routes (`/api/chatbot`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chatbot` | Ask chatbot question | ❌ |

**Request Body:**
```json
{
  "message": "What medicines do you have for fever?",
  "language": "en"
}
```

---

## 🏥 Saved Kits Routes (`/api/kits`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/kits` | Get saved kits | ✅ |
| POST | `/kits` | Create saved kit | ✅ |
| GET | `/kits/:id` | Get kit details | ✅ |
| DELETE | `/kits/:id` | Delete kit | ✅ |

---

## 📍 Pickup Location Routes (`/api/pickup-locations`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/pickup-locations` | Get all pickup locations | ❌ |
| GET | `/pickup-locations?productId=xxx` | Get locations with product | ❌ |

---

## 🔔 Notification Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get user notifications | ✅ |
| GET | `/notifications/unread-count` | Get unread count | ✅ |
| GET | `/notifications/unread-by-type` | Get unread by type | ✅ |
| GET | `/notifications/search?q=order` | Search notifications | ✅ |
| GET | `/notifications/:id` | Get notification details | ✅ |
| POST | `/notifications/:id/read` | Mark as read | ✅ |
| POST | `/notifications/mark-all-read` | Mark all as read | ✅ |
| DELETE | `/notifications/:id` | Delete notification | ✅ |
| GET | `/notifications/admin/unread` | Get admin notifications | ✅ Admin |
| GET | `/notifications/admin/stats` | Get notification stats | ✅ Admin |

---

## 🔧 Admin Routes (`/api/admin`)

### Products (`/api/admin/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/products` | List all products |
| GET | `/admin/products/:id` | Get product details |
| POST | `/admin/products` | Create product |
| PUT | `/admin/products/:id` | Update product |
| PUT | `/admin/products/:id/stock` | Update stock |
| DELETE | `/admin/products/:id` | Soft-delete product |
| GET | `/admin/products/alerts/low-stock` | Low stock alerts |

### Categories (`/api/admin/categories`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/categories` | List categories |
| POST | `/admin/categories` | Create category |
| PUT | `/admin/categories/:id` | Update category |
| DELETE | `/admin/categories/:id` | Delete category |

### Orders (`/api/admin/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/orders` | List all orders |
| GET | `/admin/orders/:id` | Get order details |
| PATCH | `/admin/orders/:id/status` | Update order status |

### Customers (`/api/admin/customers`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/customers` | List customers |
| GET | `/admin/customers/:id` | Get customer details |
| PATCH | `/admin/customers/:id` | Update customer |

### Prescriptions (`/api/admin/prescriptions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/prescriptions` | List prescriptions |
| GET | `/admin/prescriptions/:id` | Get prescription details |
| PATCH | `/admin/prescriptions/:id/status` | Approve/reject prescription |

---

## 🏥 Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | ❌ |

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

## 📝 Request Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "01712345678"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

### Get Products
```bash
curl http://localhost:3000/api/products
```

### Add to Cart (with auth token)
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "productId": "product-id",
    "quantity": 2
  }'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "items": [
      {"productId": "prod-1", "quantity": 2}
    ],
    "shippingAddress": "123 Main St, Dhaka",
    "paymentMethod": "cod"
  }'
```

---

## 🔒 Authentication

All protected routes require an `Authorization` header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Get access token from `/api/auth/login` or `/api/auth/signup` response.

---

## ⚠️ Error Responses

All errors follow this format:
```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Rate Limits

- **General API:** 100 requests per 15 minutes
- **Auth endpoints:** 5 requests per 15 minutes

---

**All endpoints are now fully functional and tested!** ✅
