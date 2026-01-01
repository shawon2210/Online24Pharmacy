# 🔔 Notification System Documentation

## Overview

This document describes the **professional, role-aware notification system** for **Online24-Pharmacy**. The system delivers **contextual, actionable alerts** to both customers and admins through:

- **Real-time WebSocket delivery** via Socket.IO
- **Fallback polling** (30-second intervals)
- **Database persistence** with 30-day retention
- **Role-based filtering** (customers vs. admins)
- **Event-driven triggers** from order, prescription, and inventory workflows

---

## 🎯 Core Features

### 1. **Real-Time Delivery**

- ✅ WebSocket connections for instant notifications
- ✅ Automatic reconnection with fallback to polling
- ✅ Badge counter in header (unread count)
- ✅ Visual indicators (color-coded by type)

### 2. **Workflow-Integrated Triggers**

- ✅ **Orders**: Confirmed, shipped, delivered, cancelled
- ✅ **Prescriptions**: Approved, rejected, uploaded
- ✅ **Inventory**: Back in stock, low stock alerts
- ✅ **Payments**: Received, failed, pending
- ✅ **Reviews**: New reviews submitted

### 3. **Role-Based Notifications**

- ✅ **Customers**: Personal orders, prescriptions, stock alerts
- ✅ **Admins**: New prescriptions, low stock, pending orders, reviews
- ✅ **No cross-role leakage**: Admins never see customer data

### 4. **Persistence & Cleanup**

- ✅ All notifications stored in PostgreSQL
- ✅ Auto-delete after 30 days (runs daily via cron)
- ✅ GDPR-compliant retention policy

---

## 📊 Database Schema

### `notifications` Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,           -- e.g., 'ORDER_CONFIRMED'
  title TEXT NOT NULL,          -- Display title
  message TEXT NOT NULL,        -- User-friendly message
  is_read BOOLEAN DEFAULT false,
  metadata TEXT,                -- JSON with actionUrl, context
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast unread queries
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

**Example Row:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "type": "ORDER_CONFIRMED",
  "title": "✅ Order Confirmed",
  "message": "Your order #LP123 is confirmed! Expected delivery: Jan 5, 2026",
  "is_read": false,
  "metadata": {
    "orderId": "order-123",
    "orderNumber": "LP123",
    "actionUrl": "/orders/order-123",
    "createdAt": "2026-01-01T10:30:00+06:00"
  },
  "created_at": "2026-01-01T10:30:00+00:00"
}
```

---

## 🔗 Notification Types

### Customer Notifications

| Type                    | Trigger                  | Message                                 | Action URL             |
| ----------------------- | ------------------------ | --------------------------------------- | ---------------------- |
| `ORDER_CONFIRMED`       | Order status = CONFIRMED | ✅ Your order #LP123 is confirmed!      | `/orders/LP123`        |
| `ORDER_SHIPPED`         | Order status = SHIPPED   | 🚚 Your order #LP123 has been shipped   | `/orders/LP123`        |
| `ORDER_DELIVERED`       | Order status = DELIVERED | 📦 Your order #LP123 has been delivered | `/orders/LP123`        |
| `ORDER_CANCELLED`       | Order status = CANCELLED | ❌ Your order #LP123 has been cancelled | `/orders/LP123`        |
| `PRESCRIPTION_APPROVED` | Prescription approved    | 📋 Your prescription has been approved! | `/orders/{orderId}`    |
| `PRESCRIPTION_REJECTED` | Prescription rejected    | ⚠️ Your prescription was rejected       | `/upload-prescription` |
| `PRODUCT_BACK_IN_STOCK` | Product stock > 0        | 🔔 Surgical Gloves are back in stock!   | `/product/{productId}` |
| `PAYMENT_RECEIVED`      | Payment received         | ✅ Payment of ৳{amount} received        | `/orders/{orderId}`    |
| `PAYMENT_FAILED`        | Payment failed           | ❌ Payment for order #LP123 failed      | `/orders/{orderId}`    |
| `PRESCRIPTION_EXPIRING` | 7 days before expiry     | ⏰ Your prescription expires soon       | `/upload-prescription` |

### Admin Notifications

| Type                        | Trigger               | Message                              | Action URL                  |
| --------------------------- | --------------------- | ------------------------------------ | --------------------------- |
| `NEW_PRESCRIPTION_UPLOADED` | Prescription uploaded | 📄 New prescription from Rahim Ahmed | `/admin/prescriptions/{id}` |
| `LOW_STOCK_ALERT`           | Stock ≤ minStockLevel | ⚠️ Surgical Gloves stock < 10 units  | `/admin/products/{id}`      |
| `NEW_ORDER_PLACED`          | Order created         | 📦 New order #LP125 from +8801234567 | `/admin/orders/{id}`        |
| `NEW_REVIEW_SUBMITTED`      | Review submitted      | ⭐ Rahim gave 5⭐ to Surgical Gloves | `/admin/products/{id}`      |
| `PAYMENT_PENDING`           | Payment not received  | 💳 Order #LP125 awaiting payment     | `/admin/orders/{id}`        |
| `INVENTORY_ISSUE`           | Stock = 0 or error    | 🚨 Surgical Gloves is out of stock   | `/admin/products`           |

---

## 🛠️ API Reference

### REST Endpoints

All endpoints require authentication (`Authorization: Bearer {token}`).

#### **GET `/api/notifications`**

Fetch paginated user notifications.

**Query Parameters:**

```
limit: 20    // Items per page
offset: 0    // Pagination offset
unreadOnly: false  // Only unread notifications
type: null   // Filter by type (e.g., 'ORDER_CONFIRMED')
```

**Response:**

```json
{
  "notifications": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "ORDER_CONFIRMED",
      "title": "✅ Order Confirmed",
      "message": "Your order #LP123 is confirmed! Expected delivery: Jan 5, 2026",
      "isRead": false,
      "metadata": {
        "orderId": "order-123",
        "actionUrl": "/orders/order-123"
      },
      "createdAt": "2026-01-01T10:30:00Z"
    }
  ],
  "unreadCount": 3,
  "totalCount": 42,
  "hasMore": true
}
```

#### **GET `/api/notifications/unread-count`**

Get unread notification count.

**Response:**

```json
{ "count": 3 }
```

#### **GET `/api/notifications/unread-by-type`**

Get unread count breakdown by type.

**Response:**

```json
{
  "ORDER_CONFIRMED": 1,
  "PRESCRIPTION_APPROVED": 1,
  "LOW_STOCK_ALERT": 1
}
```

#### **GET `/api/notifications/search?q=order`**

Search notifications by title/message.

**Response:**

```json
{
  "notifications": [...],
  "total": 5,
  "hasMore": false
}
```

#### **POST `/api/notifications/{id}/read`**

Mark single notification as read.

**Response:**

```json
{ "success": true, "message": "Notification marked as read" }
```

#### **POST `/api/notifications/mark-all-read`**

Mark all user notifications as read.

**Response:**

```json
{
  "success": true,
  "count": 3,
  "message": "3 notifications marked as read"
}
```

#### **DELETE `/api/notifications/{id}`**

Delete a notification.

**Response:**

```json
{ "success": true, "message": "Notification deleted" }
```

#### **GET `/api/notifications/admin/unread`** (Admin only)

Get unread admin notifications.

**Query Parameters:**

```
limit: 10        // Max notifications
types: NEW_PRESCRIPTION_UPLOADED,LOW_STOCK_ALERT  // Comma-separated
```

**Response:**

```json
{
  "notifications": [...]
}
```

#### **GET `/api/notifications/admin/stats`** (Admin only)

Get notification statistics for dashboard.

**Response:**

```json
{
  "totalUnread": 12,
  "total": 250,
  "byType": {
    "NEW_PRESCRIPTION_UPLOADED": 3,
    "LOW_STOCK_ALERT": 7,
    "NEW_ORDER_PLACED": 2
  },
  "readRate": "95.20"
}
```

---

## 🔌 WebSocket Events

### Client → Server

#### **`user:login`**

Register user connection after authentication.

**Emit:**

```javascript
socket.emit("user:login", {
  userId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
});
```

#### **`notification:read`**

Mark notification as read.

**Emit:**

```javascript
socket.emit("notification:read", {
  notificationId: "550e8400-e29b-41d4-a716-446655440000",
  userId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
});
```

#### **`notifications:read-all`**

Mark all notifications as read.

**Emit:**

```javascript
socket.emit("notifications:read-all", {
  userId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
});
```

#### **`notification:delete`**

Delete notification.

**Emit:**

```javascript
socket.emit("notification:delete", {
  notificationId: "550e8400-e29b-41d4-a716-446655440000",
  userId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
});
```

#### **`ping`**

Health check.

**Emit:**

```javascript
socket.emit("ping");
```

### Server → Client

#### **`notification`**

New notification received.

**Listen:**

```javascript
socket.on("notification", (data) => {
  console.log(data);
  // {
  //   type: 'ORDER_CONFIRMED',
  //   title: '✅ Order Confirmed',
  //   message: '...',
  //   metadata: {...},
  //   receivedAt: '2026-01-01T10:30:00Z'
  // }
});
```

#### **`unread-count-updated`**

Unread count changed.

**Listen:**

```javascript
socket.on("unread-count-updated", (data) => {
  console.log(`Unread: ${data.unreadCount}`);
  // { unreadCount: 3, updatedAt: '...' }
});
```

#### **`unread-by-type-updated`**

Unread count by type changed.

**Listen:**

```javascript
socket.on("unread-by-type-updated", (data) => {
  console.log(data.counts);
  // { ORDER_CONFIRMED: 1, PRESCRIPTION_APPROVED: 1 }
});
```

#### **`initial-load`**

Initial data after login.

**Listen:**

```javascript
socket.on("initial-load", (data) => {
  console.log(`Initial unread count: ${data.unreadCount}`);
});
```

#### **`error`**

Socket error.

**Listen:**

```javascript
socket.on("error", (data) => {
  console.error(data.message);
});
```

#### **`pong`**

Response to ping.

**Listen:**

```javascript
socket.on("pong", () => {
  console.log("Connection alive");
});
```

---

## 📱 React Component Usage

### **NotificationBell** (Header)

```jsx
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Header() {
  return (
    <header className="flex items-center justify-between">
      {/* ... */}
      <NotificationBell />
    </header>
  );
}
```

**Features:**

- ✅ Displays unread count badge
- ✅ Opens dropdown on click
- ✅ Real-time updates via WebSocket
- ✅ Fallback to polling if WebSocket unavailable

### **NotificationPanel** (Dropdown)

```jsx
import { NotificationPanel } from "@/components/notifications/NotificationPanel";

function NotificationsPage() {
  return <NotificationPanel onClose={() => {}} />;
}
```

**Features:**

- ✅ Scrollable list of notifications
- ✅ Color-coded by type
- ✅ Mark as read / Delete actions
- ✅ Click to navigate (auto-closes dropdown)
- ✅ Pagination support

### **Socket.IO Integration**

```javascript
// src/hooks/useNotifications.js
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Assuming socket initialized in App.jsx
    if (!window.socket) return;

    // Listen for new notifications
    window.socket.on("notification", (notification) => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries(["notifications"]);
    });

    // Listen for unread count updates
    window.socket.on("unread-count-updated", (data) => {
      // Update badge in real-time
      queryClient.setQueryData(["unread-count"], data.unreadCount);
    });

    return () => {
      window.socket.off("notification");
      window.socket.off("unread-count-updated");
    };
  }, [queryClient]);
}
```

---

## 🚀 Server Integration

### **1. Add to server/index.js**

```javascript
import http from "http";
import app from "./app.js";
import { initializeSocketIO } from "./utils/socketioSetup.js";
import { setupAllNotificationListeners } from "./utils/notificationEventHandlers.js";

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(server);

// Setup event handlers
setupAllNotificationListeners();

// Store io instance globally
global.io = io;

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### **2. Import Cron Jobs**

```javascript
// In server/index.js (after other imports)
import "./cron/notificationCleanup.js";
```

### **3. Register Routes**

```javascript
import notificationRoutes from "./routes/notifications.js";

app.use("/api/notifications", notificationRoutes);
```

---

## 📊 Workflow Integration Examples

### **Order Confirmation Flow**

```
1. Customer places order
   ↓
2. eCommerceEventEmitter.emit('order:created', {...})
   ↓
3. setupOrderNotifications() listener triggers
   ↓
4. createNotification(customerId, ORDER_CONFIRMED, {...})
   ↓
5. Notification created in DB
   ↓
6. WebSocket broadcasts to customer: socket.on('notification', {...})
   ↓
7. NotificationBell updates unread count badge
   ↓
8. NotificationPanel shows new notification with link to order
```

### **Prescription Approval Flow**

```
1. Admin approves prescription
   ↓
2. eCommerceEventEmitter.emit('prescription:approved', {...})
   ↓
3. setupPrescriptionNotifications() listener triggers
   ↓
4. createNotification(customerId, PRESCRIPTION_APPROVED, {...})
   ↓
5. Notification stored + broadcast via WebSocket
   ↓
6. Customer sees notification & can proceed with order
```

### **Low Stock Alert Flow**

```
1. Admin updates product stock
   ↓
2. eCommerceEventEmitter.emit('product:low_stock', {...})
   ↓
3. setupInventoryNotifications() listener triggers
   ↓
4. createBulkNotifications([adminIds...], LOW_STOCK_ALERT, {...})
   ↓
5. All admins get notification in admin room
   ↓
6. Admin dashboard updates in real-time
```

---

## 🔐 Security & Compliance

### **Role-Based Access Control**

- ✅ Customers can only access their own notifications
- ✅ Admins can only access operational alerts (not customer data)
- ✅ Verified via `user.id` check in API routes

### **GDPR Compliance**

- ✅ Notifications deleted after 30 days (cron job)
- ✅ Customers can delete their notifications
- ✅ No sensitive data in messages (e.g., full prescription image)

### **Data Validation**

- ✅ All inputs validated before processing
- ✅ SQL injection protection via Prisma ORM
- ✅ Rate limiting on API endpoints

### **WebSocket Security**

- ✅ JWT authentication required
- ✅ User ID verified before broadcasting
- ✅ Room-based isolation (`user:{userId}`, `admin-room`)

---

## 📈 Performance Tuning

### **Database Indexes**

```sql
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

### **Query Optimization**

- ✅ Limit notification list to 20 items per page
- ✅ Use offset/limit for pagination
- ✅ Index on (user_id, is_read) for fast unread queries

### **WebSocket Optimization**

- ✅ 100 max listeners per user
- ✅ Rooms for targeted broadcasting (vs. emitting to all)
- ✅ Graceful disconnect handling

### **Memory Management**

- ✅ Auto-cleanup of old notifications (30-day retention)
- ✅ Connection pooling for database
- ✅ Event listener cleanup on disconnect

---

## 🧪 Testing

### **Unit Tests**

```javascript
// test: createNotification
import { createNotification, NotificationType } from "../notificationManager";

describe("createNotification", () => {
  it("should create a notification with correct template", async () => {
    const notif = await createNotification(
      "user-123",
      NotificationType.ORDER_CONFIRMED,
      { orderId: "order-456", orderNumber: "LP123" }
    );

    expect(notif.title).toBe("✅ Order Confirmed");
    expect(notif.message).toContain("LP123");
  });
});
```

### **Integration Tests**

```javascript
// Test: Order confirmation flow
describe("Order notification flow", () => {
  it("should notify customer when order is confirmed", async () => {
    // 1. Create order
    // 2. Emit event
    // 3. Assert notification created
  });
});
```

### **WebSocket Tests**

```javascript
// Test: Real-time delivery
describe("WebSocket delivery", () => {
  it("should broadcast notification to user in real-time", (done) => {
    socket.on("notification", (data) => {
      expect(data.type).toBe("ORDER_CONFIRMED");
      done();
    });

    // Trigger notification
  });
});
```

---

## 📋 Deployment Checklist

- [ ] Install dependencies: `npm install socket.io socket.io-client`
- [ ] Create `notifications` table via migration
- [ ] Add notification routes to `server/index.js`
- [ ] Setup Socket.IO in `server/index.js`
- [ ] Import cron job: `./cron/notificationCleanup.js`
- [ ] Initialize event handlers: `setupAllNotificationListeners()`
- [ ] Add `NotificationBell` to header layout
- [ ] Test WebSocket connection in browser dev tools
- [ ] Monitor Socket.IO stats: `/api/notifications/admin/stats`
- [ ] Verify cron job runs daily
- [ ] Test end-to-end flow (order → notification)

---

## 🚨 Troubleshooting

### **WebSocket not connecting**

- ✅ Check CORS origin in `socketioSetup.js`
- ✅ Verify `socket.io` port matches server
- ✅ Check browser console for connection errors

### **Notifications not appearing**

- ✅ Verify user is authenticated (JWT token valid)
- ✅ Check if event emitter is firing (`console.log` in handler)
- ✅ Verify notification created in DB: `SELECT * FROM notifications WHERE user_id = '...'`

### **Unread count not updating**

- ✅ Verify WebSocket `unread-count-updated` event fires
- ✅ Check localStorage for auth token (might be stale)
- ✅ Try manual refresh: `fetch('/api/notifications/unread-count')`

### **Old notifications not deleted**

- ✅ Check cron job runs: `ps aux | grep node`
- ✅ Verify job scheduled: `cron.schedule('0 0 * * *', ...)`
- ✅ Check logs for errors in cleanup function

---

## 📞 Support

For issues or feature requests:

1. Check this documentation
2. Review error logs: `docker logs online24-pharmacy`
3. Test in isolated environment
4. Report with: timestamp, notification type, user ID

---

**Last Updated:** January 1, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
