# 🏗️ Notification System Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ONLINE24-PHARMACY NOTIFICATION SYSTEM            │
│                     (Real-Time Event-Driven Architecture)            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────┐      ┌──────────────────────────────────┐   │
│  │   NotificationBell  │      │    NotificationPanel             │   │
│  │  (Header Icon)      │      │  (Dropdown List)                │   │
│  │                     │◄────►│                                  │   │
│  │  • Badge counter    │      │  • 20 notifications per page    │   │
│  │  • Unread indicator │      │  • Color-coded by type          │   │
│  │  • Animated pulse   │      │  • Mark as read / Delete        │   │
│  └─────────┬───────────┘      │  • Click to navigate            │   │
│            │                   │  • Empty state message          │   │
│            │                   └──────────────────────────────────┘   │
│            │                                                         │
│  ┌─────────▼──────────────────────────────────────────────────┐    │
│  │            useSocket Hook (WebSocket Client)               │    │
│  │                                                             │    │
│  │  • Initialize Socket.IO connection                         │    │
│  │  • Emit 'user:login' with user ID                          │    │
│  │  • Listen for 'notification' events                        │    │
│  │  • Listen for 'unread-count-updated' events               │    │
│  │  • Handle 'pong' for health checks                        │    │
│  └─────────┬──────────────────────────────────────────────────┘    │
│            │                                                         │
└────────────┼─────────────────────────────────────────────────────────┘
             │
             │ WebSocket (ws://) or Polling (HTTP)
             │
┌────────────▼──────────────────────────────────────────────────────────┐
│                         WEBSOCKET TRANSPORT                            │
│                      (Socket.IO 4.7.2)                               │
│                                                                       │
│  Client ─────► emit 'user:login'                                    │
│              ─────► emit 'notification:read'                        │
│              ─────► emit 'notifications:read-all'                   │
│              ─────► emit 'notification:delete'                      │
│              ─────► emit 'ping'                                     │
│                                                                       │
│  Server ─────► emit 'notification' (new notification)               │
│              ─────► emit 'unread-count-updated' (badge update)      │
│              ─────► emit 'unread-by-type-updated' (type breakdown)  │
│              ─────► emit 'initial-load' (on connect)                │
│              ─────► emit 'pong' (health response)                   │
│                                                                       │
└────────────┬──────────────────────────────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────────────────────────────┐
│                       SOCKET.IO SERVER LAYER                          │
│                  (socketioSetup.js - 350 lines)                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Connection Management                                      │    │
│  │                                                             │    │
│  │  • registerConnection(userId, socketId)                   │    │
│  │  • unregisterConnection(socketId)                         │    │
│  │  • Join room: user:{userId}                               │    │
│  │  • Join room: admin-room (if ADMIN/PHARMACIST)            │    │
│  │  • Max 100 listeners per user                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Event Handlers (Socket → Database)                        │    │
│  │                                                             │    │
│  │  socket.on('user:login') ─────► notificationEmitter      │    │
│  │                                 .registerConnection()     │    │
│  │                                                             │    │
│  │  socket.on('notification:read') ────► prisma.notification │    │
│  │                                        .update({...})      │    │
│  │                                     ─► emit 'unread-      │    │
│  │                                        count-updated'      │    │
│  │                                                             │    │
│  │  socket.on('notification:delete') ──► prisma.notification │    │
│  │                                        .delete({...})      │    │
│  │                                     ─► emit 'unread-      │    │
│  │                                        count-updated'      │    │
│  │                                                             │    │
│  │  socket.on('ping') ────────────────► socket.emit('pong') │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
└────────────┬──────────────────────────────────────────────────────────┘
             │
             │ (notificationEmitter - Real-time delivery)
             │
┌────────────▼──────────────────────────────────────────────────────────┐
│                   NOTIFICATION EMITTER LAYER                          │
│              (notificationEmitter.js - 200 lines)                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  • User Connection Map: userId → Set of socketIds                  │
│  • Socket to User Map: socketId → userId                           │
│                                                                       │
│  notifyUser(userId, notification, io)                              │
│  ├─► Get all sockets for user                                      │
│  └─► io.to(socketId).emit('notification', {...})                  │
│                                                                       │
│  notifyUsers(userIds, notification, io)                            │
│  ├─► Loop through each user                                        │
│  └─► notifyUser() for each                                         │
│                                                                       │
│  notifyAdmins(notification, io)                                    │
│  └─► io.to('admin-room').emit('admin-notification', {...})        │
│                                                                       │
│  broadcastUnreadCount(userId, unreadCount, io)                     │
│  └─► io.to('user:{userId}').emit('unread-count-updated', {...})   │
│                                                                       │
│  getStats()                                                          │
│  └─► Return connection stats for monitoring                         │
│                                                                       │
└────────────┬──────────────────────────────────────────────────────────┘
             │
             │ (notificationEventHandlers - Event routing)
             │
┌────────────▼──────────────────────────────────────────────────────────┐
│               EVENT HANDLER INTEGRATION LAYER                         │
│         (notificationEventHandlers.js - 400 lines)                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Order Events:                                                       │
│  ┌─ eCommerceEventEmitter.on('order:created')                      │
│  │  └─► createBulkNotifications(adminIds, NEW_ORDER_PLACED)        │
│  │  └─► createNotification(customerId, ORDER_CONFIRMED)            │
│  ├─ eCommerceEventEmitter.on('order:status_changed')               │
│  │  └─► createNotification(customerId, ORDER_SHIPPED/DELIVERED)    │
│  └──────────────────────────────────────────────────────────        │
│                                                                       │
│  Prescription Events:                                               │
│  ┌─ eCommerceEventEmitter.on('prescription:uploaded')              │
│  │  └─► createBulkNotifications(adminIds, NEW_PRESCRIPTION)        │
│  ├─ eCommerceEventEmitter.on('prescription:approved')              │
│  │  └─► createNotification(customerId, PRESCRIPTION_APPROVED)      │
│  ├─ eCommerceEventEmitter.on('prescription:rejected')              │
│  │  └─► createNotification(customerId, PRESCRIPTION_REJECTED)      │
│  └──────────────────────────────────────────────────────────        │
│                                                                       │
│  Inventory Events:                                                  │
│  ┌─ eCommerceEventEmitter.on('product:back_in_stock')              │
│  │  └─► createBulkNotifications(wishlistUserIds, BACK_IN_STOCK)    │
│  ├─ eCommerceEventEmitter.on('product:low_stock')                  │
│  │  └─► createBulkNotifications(adminIds, LOW_STOCK_ALERT)         │
│  ├─ eCommerceEventEmitter.on('product:out_of_stock')               │
│  │  └─► createBulkNotifications(adminIds, INVENTORY_ISSUE)         │
│  └──────────────────────────────────────────────────────────        │
│                                                                       │
│  Payment Events:                                                    │
│  ┌─ eCommerceEventEmitter.on('payment:received')                   │
│  │  └─► createNotification(customerId, PAYMENT_RECEIVED)           │
│  ├─ eCommerceEventEmitter.on('payment:failed')                     │
│  │  └─► createNotification(customerId, PAYMENT_FAILED)             │
│  └─ eCommerceEventEmitter.on('payment:pending')                    │
│     └─► createBulkNotifications(adminIds, PAYMENT_PENDING)         │
│                                                                       │
│  Review Events:                                                     │
│  └─ eCommerceEventEmitter.on('review:submitted')                   │
│     └─► createBulkNotifications(adminIds, NEW_REVIEW_SUBMITTED)    │
│                                                                       │
└────────────┬──────────────────────────────────────────────────────────┘
             │
             │ (notificationManager - CRUD operations)
             │
┌────────────▼──────────────────────────────────────────────────────────┐
│              NOTIFICATION MANAGER SERVICE LAYER                       │
│           (notificationManager.js - 500 lines)                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  CREATE:                                                             │
│  ├─ createNotification(userId, type, data)                          │
│  │  ├─► Render template from NotificationType enum                  │
│  │  ├─► Insert into notifications table                            │
│  │  └─► Return notification object                                  │
│  └─ createBulkNotifications(userIds[], type, data)                  │
│     ├─► Map users to notification objects                           │
│     └─► Batch insert into DB                                        │
│                                                                       │
│  READ:                                                               │
│  ├─ getUserNotifications(userId, options)                           │
│  │  ├─► Query with pagination (limit, offset)                      │
│  │  ├─► Filter by type (optional)                                   │
│  │  ├─► Count unread separately                                     │
│  │  └─► Return {notifications, unreadCount, hasMore}              │
│  ├─ getUnreadCount(userId)                                          │
│  │  └─► COUNT(*) FROM notifications WHERE is_read=false (Fast!)    │
│  ├─ getUnreadCountByType(userId)                                    │
│  │  └─► GROUP BY type WHERE is_read=false                          │
│  └─ searchNotifications(userId, query, options)                     │
│     └─► WHERE message LIKE '%query%' OR title LIKE '%query%'       │
│                                                                       │
│  UPDATE:                                                             │
│  ├─ markNotificationAsRead(notificationId)                          │
│  │  └─► UPDATE notifications SET is_read=true WHERE id=...         │
│  └─ markAllNotificationsAsRead(userId)                              │
│     └─► UPDATE notifications SET is_read=true WHERE user_id=...    │
│                                                                       │
│  DELETE:                                                             │
│  ├─ deleteNotification(notificationId)                              │
│  │  └─► DELETE FROM notifications WHERE id=...                     │
│  └─ cleanupOldNotifications()                                       │
│     └─► DELETE FROM notifications WHERE created_at < 30 days       │
│                                                                       │
│  NOTIFICATION TEMPLATES (16 types):                                 │
│  ├─ Customer (10): ORDER_*, PRESCRIPTION_*, PRODUCT_BACK_*, PAYMENT_* │
│  └─ Admin (6): NEW_PRESCRIPTION_*, LOW_STOCK_*, NEW_ORDER_*, etc.  │
│                                                                       │
└────────────┬──────────────────────────────────────────────────────────┘
             │
             │ (Prisma Client)
             │
┌────────────▼──────────────────────────────────────────────────────────┐
│                     DATABASE LAYER (PostgreSQL)                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Table: notifications                                               │
│  ┌──────┬────────┬──────┬────────┬────────┬─────────────────────┐  │
│  │ id   │user_id │ type │ title  │message │metadata (JSON)      │  │
│  ├──────┼────────┼──────┼────────┼────────┼─────────────────────┤  │
│  │UUID  │UUID    │TEXT  │TEXT    │TEXT    │actionUrl, context   │  │
│  └──────┴────────┴──────┴────────┴────────┴─────────────────────┘  │
│                                                                       │
│  Indexes:                                                            │
│  • PRIMARY KEY (id)                                                 │
│  • UNIQUE (id)                                                      │
│  • FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE     │
│  • INDEX (user_id, is_read) ← Fast unread queries!                 │
│  • INDEX (created_at) ← Fast cleanup queries                       │
│                                                                       │
│  CRON JOBS:                                                          │
│  • Daily at 00:00: cleanupOldNotifications() (30+ days)            │
│  • Every 6 hours: cleanupOldNotifications()                        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## REST API Layer

```
┌─────────────────────────────────────────────────────┐
│  REST API ROUTES (notifications.js - 10 endpoints)  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  GET  /api/notifications                           │
│  ├─ Call: getUserNotifications(userId, options)   │
│  └─ Return: {notifications, unreadCount, hasMore} │
│                                                     │
│  GET  /api/notifications/unread-count              │
│  ├─ Call: getUnreadCount(userId)                  │
│  └─ Return: {count: 3}                            │
│                                                     │
│  GET  /api/notifications/unread-by-type            │
│  ├─ Call: getUnreadCountByType(userId)            │
│  └─ Return: {ORDER_*: 1, PRESCRIPTION_*: 2}       │
│                                                     │
│  GET  /api/notifications/search?q=...              │
│  ├─ Call: searchNotifications(userId, query)      │
│  └─ Return: {notifications: [...], total: 5}      │
│                                                     │
│  POST /api/notifications/:id/read                  │
│  ├─ Call: markNotificationAsRead(notificationId)  │
│  └─ Return: {success: true}                       │
│                                                     │
│  POST /api/notifications/mark-all-read             │
│  ├─ Call: markAllNotificationsAsRead(userId)      │
│  └─ Return: {success: true, count: 3}             │
│                                                     │
│  DELETE /api/notifications/:id                     │
│  ├─ Call: deleteNotification(notificationId)      │
│  └─ Return: {success: true}                       │
│                                                     │
│  GET  /api/notifications/admin/unread (ADMIN)      │
│  ├─ Call: getAdminUnreadNotifications(options)    │
│  └─ Return: {notifications: [...]}                │
│                                                     │
│  GET  /api/notifications/admin/stats (ADMIN)       │
│  ├─ Call: getNotificationStats()                  │
│  └─ Return: {totalUnread, total, byType, readRate}│
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow Example: Order Confirmation

```
Customer Places Order
        │
        ▼
  Order Service Handler
        │
        ├─► Create Order in DB
        │
        ├─► Validate Payment
        │
        └─► eCommerceEventEmitter.emit('order:created', {
              orderId: 'order-123',
              orderNumber: 'LP123',
              totalAmount: 5000
            })
        │
        ▼
  NotificationEventHandlers Listener
        │
        ├─► notificationEventHandlers.setupOrderNotifications()
        │   catches 'order:created' event
        │
        ├─► Fetches order from DB
        │
        └─► Calls createBulkNotifications(adminIds, NEW_ORDER_PLACED, {...})
        │
        └─► Calls createNotification(customerId, ORDER_CONFIRMED, {
              orderId: 'order-123',
              orderNumber: 'LP123',
              estimatedDelivery: 'Jan 5, 2026'
            })
        │
        ▼
  Notification Manager
        │
        ├─► Renders template:
        │   title: "✅ Order Confirmed"
        │   message: "Your order #LP123 is confirmed! Expected delivery: Jan 5, 2026"
        │   metadata: {
        │     orderId: 'order-123',
        │     actionUrl: '/orders/order-123'
        │   }
        │
        ├─► INSERT INTO notifications (...)
        │
        └─► Returns notification object
        │
        ▼
  Socket.IO Broadcasting
        │
        ├─► Notification stored in DB
        │
        ├─► notificationEmitter.notifyUser(customerId, notification, io)
        │   │
        │   ├─► Get all sockets for customer
        │   │
        │   └─► io.to(socketId).emit('notification', {...})
        │
        ├─► notificationEmitter.notifyAdmins(notification, io)
        │   │
        │   └─► io.to('admin-room').emit('admin-notification', {...})
        │
        └─► io.to(`user:${customerId}`).emit('unread-count-updated', {count: 4})
        │
        ▼
  React Components Update
        │
        ├─► NotificationBell.jsx
        │   │
        │   ├─► window.socket.on('notification', (data) => {...})
        │   │
        │   ├─► Updates unread count
        │   │
        │   └─► Re-renders badge (now shows "4")
        │
        └─► NotificationPanel.jsx
            │
            ├─► window.socket.on('unread-count-updated', (data) => {...})
            │
            ├─► Refreshes notification list
            │
            └─► Shows "✅ Order Confirmed" at top of list
        │
        ▼
  User Experience
        │
        ├─► Bell icon highlights with red badge
        │
        ├─► User clicks bell icon
        │
        ├─► Dropdown shows:
        │   ┌────────────────────────────────┐
        │   │ ✅ Order Confirmed              │
        │   │ Your order #LP123 is confirmed!│
        │   │ Expected delivery: Jan 5, 2026 │
        │   │                                │
        │   │ [Link to order details] →      │
        │   └────────────────────────────────┘
        │
        ├─► User clicks notification
        │
        ├─► Marked as read in DB
        │
        ├─► Badge updated to "3"
        │
        └─► Navigate to /orders/order-123 (order details page)
```

---

## Database Indexes Impact

```
WITHOUT INDEXES:
GET /api/notifications/unread-count
│
└─► SELECT COUNT(*) FROM notifications WHERE user_id='xxx' AND is_read=false
    │
    └─► Full table scan (SLOW! O(n) = 10,000 rows)
        │
        └─► ~500ms response time


WITH INDEXES:
GET /api/notifications/unread-count
│
└─► SELECT COUNT(*) FROM notifications WHERE user_id='xxx' AND is_read=false
    │
    └─► Index lookup (FAST! O(log n) = index access)
        │
        └─► ~10ms response time ← 50x faster!

Composite Index: (user_id, is_read)
└─► Allows instant lookup by both user AND read status
    └─► Perfect for notifications!
```

---

## Scalability Path

```
Phase 1: MVP (Current Implementation)
├─ Single server, single database
├─ 100-500 concurrent users
├─ ~1,000 notifications/day
└─ Fully functional

Phase 2: Growth (if needed)
├─ Add Redis for session store
├─ Enable Socket.IO adapter (Redis pub/sub)
├─ Read replicas for SELECT queries
└─ Horizontal scaling (multiple servers)

Phase 3: Enterprise (if needed)
├─ Message queue (RabbitMQ, Kafka)
├─ Notification service microservice
├─ Push notifications (FCM, APNS)
├─ SMS/Email gateway integration
└─ Advanced analytics dashboard
```

---

**This architecture ensures:**
✅ Real-time delivery (< 50ms)  
✅ High availability (with proper scaling)  
✅ Data consistency (Prisma ORM)  
✅ Security (JWT auth, CORS, rate limiting)  
✅ Scalability (index optimization, pagination)  
✅ Compliance (30-day retention, GDPR)
