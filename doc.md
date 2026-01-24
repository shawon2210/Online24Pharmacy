# Online24 Pharmacy - Project Documentation

## Overview

Online24 Pharmacy is a full-stack e-commerce application built with Node.js/Express backend and React frontend, providing online pharmacy services including prescription management, product ordering, and delivery tracking.

## Table of Contents

1. [Project State Management](#project-state-management)
2. [Event Management](#event-management)
3. [Backend Working Principle](#backend-working-principle)
4. [Frontend Order Handling & Status Codes](#frontend-order-handling--status-codes)
5. [Packages Used](#packages-used)
6. [JWT Authentication](#jwt-authentication)
7. [Review System](#review-system)
8. [Service Provision](#service-provision)

## Project State Management

### Frontend State Management

The application uses multiple state management approaches:

#### 1. React Context API

- **AuthContext**: Manages user authentication state using `useReducer`
  - State includes: `user`, `accessToken`, `isAuthenticated`, `loading`
  - Persists authentication data in `sessionStorage` (user) and `localStorage` (token)
  - Handles token refresh and automatic axios interceptor setup

- **ThemeContext**: Manages application theming
  - Supports `light`, `dark`, and `system` themes
  - Persists theme preference in localStorage
  - Automatically detects system preference changes

#### 2. Zustand Stores

- **Cart Store**: Client-side cart management with persistence
  - Uses `zustand/middleware/persist` for localStorage persistence
  - Manages cart items, quantities, and totals
  - Provides methods: `addItem`, `removeItem`, `updateQuantity`, `clearCart`

- **Auth Store**: Alternative authentication state management
  - Complements the Context API approach

#### 3. React Query (@tanstack/react-query)

- Used for server state management
- Handles API data fetching, caching, and synchronization
- Provides optimistic updates and background refetching

### Backend State Management

- **Database**: PostgreSQL with Prisma ORM
- **Session Management**: JWT tokens with refresh token rotation
- **Event-driven Architecture**: Custom event emitter for business logic

## Event Management

### Commerce Event Emitter

Located in `server/events/commerceEventEmitter.js`, this is a centralized event system for e-commerce operations:

#### Key Events:

- `product:stock_updated`: Triggers when product stock changes
  - Logs stock movements via audit logger
  - Handles out-of-stock scenarios (invalidates carts)
  - Triggers back-in-stock notifications

- `product:out_of_stock`: Removes items from all carts when stock reaches zero

- `product:back_in_stock`: Notifies waitlisted users when products become available

- `cart:invalidated`: Emitted when cart contents become invalid due to stock changes

- `order:status_changed`: Handles order status transitions
  - Updates order tracking
  - Sends notifications to users
  - Triggers delivery partner assignments

- `notification:send`: Centralized notification dispatch system

#### Event Flow Example:

```
Stock Update → Audit Log → Cart Invalidation → Notifications
```

## Backend Working Principle

### Architecture Overview

- **Framework**: Express.js with ES6 modules
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer for handling file uploads
- **Rate Limiting**: Express-rate-limit for API protection
- **Validation**: Express-validator and Zod schemas

### Server Structure (`server/index.js`)

```javascript
// Middleware stack:
- CORS configuration
- Cookie parser
- JSON/URL-encoded body parsing
- Rate limiting (API and auth specific)
- Static file serving for uploads

// Route mounting:
- /api/auth - Authentication routes
- /api/admin - Admin management
- /api/products - Product management
- /api/orders - Order processing
- /api/cart - Shopping cart
- /api/payments - Payment processing
- /api/reviews - Product reviews
- /api/delivery - Delivery management
- /api/notifications - Notification system
```

### Key Backend Components:

#### Controllers

- **authController.js**: Handles login, registration, password reset
- **orderController.js**: Manages order lifecycle (create, update, cancel)
- **productController.js**: Product CRUD operations
- **paymentController.js**: Payment processing and webhooks

#### Middleware

- **auth.js**: JWT token verification and user extraction
- **roleAuth.js**: Role-based access control (USER, ADMIN, PHARMACIST, DELIVERY_PARTNER)
- **rateLimiter.js**: API rate limiting with different tiers
- **validation.js**: Request validation using express-validator
- **security.js**: Security headers and CSRF protection

#### Database Layer

- **Prisma Client**: Type-safe database operations
- **Connection Pooling**: Efficient database connections
- **Migrations**: Version-controlled schema changes

## Frontend Order Handling & Status Codes

### Order Status Constants

Defined in `src/utils/constants.js`:

```javascript
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};
```

### Status Code Implementation

Located in `src/hooks/useOrderStatus.js`:

#### Status Configuration:

```javascript
export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: {
    icon: ClockIcon,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700",
  },
  [ORDER_STATUS.CONFIRMED]: {
    icon: CheckCircleIcon,
    color: "text-emerald-600 dark:text-emerald-400",
    // ... more styling
  },
  // ... other statuses
};
```

### Order Flow Implementation:

#### Frontend Components:

- **Order Tracking**: Real-time status updates via WebSocket/polling
- **Status Display**: Visual status indicators with icons and colors
- **Order History**: Paginated order list with filtering
- **Order Details**: Comprehensive order information display

#### Backend Order Processing:

- **Status Transitions**: Controlled state machine in order controller
- **Validation**: Ensures valid status transitions
- **Notifications**: Automatic user notifications on status changes
- **Audit Logging**: All status changes are logged

### HTTP Status Codes Used:

- `200`: Successful operations
- `201`: Resource created (new orders)
- `400`: Bad request (validation errors)
- `401`: Unauthorized (missing/invalid JWT)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `409`: Conflict (order already processed)
- `422`: Unprocessable entity (validation failed)
- `500`: Internal server error

## Packages Used

### Frontend Dependencies:

```json
{
  "@dnd-kit/core": "^6.3.1", // Drag & drop functionality
  "@heroicons/react": "^2.2.0", // Icon library
  "@tanstack/react-query": "^5.90.16", // Server state management
  "axios": "^1.13.2", // HTTP client
  "framer-motion": "^12.24.0", // Animations
  "react": "^19.2.3", // UI framework
  "react-dom": "^19.2.3", // React DOM rendering
  "react-hook-form": "^7.70.0", // Form management
  "react-router-dom": "^7.11.0", // Client-side routing
  "socket.io-client": "^4.8.3", // Real-time communication
  "zustand": "^5.0.9" // State management
}
```

### Backend Dependencies:

```json
{
  "express": "^5.2.1", // Web framework
  "@prisma/client": "^6.19.1", // Database ORM
  "jsonwebtoken": "^9.0.3", // JWT authentication
  "bcryptjs": "^3.0.3", // Password hashing
  "cors": "^2.8.5", // Cross-origin requests
  "express-rate-limit": "^8.2.1", // Rate limiting
  "multer": "^2.0.2", // File uploads
  "socket.io": "^4.8.3", // Real-time communication
  "nodemailer": "^7.0.12", // Email sending
  "twilio": "^5.11.1" // SMS services
}
```

### Development Tools:

```json
{
  "@vitejs/plugin-react": "^5.1.2", // Vite React plugin
  "vitest": "^4.0.16", // Testing framework
  "tailwindcss": "^4.1.18", // CSS framework
  "eslint": "^9.39.2" // Code linting
}
```

## JWT Authentication

### JWT Implementation Details

#### Token Generation (`server/middleware/auth.js`):

```javascript
const generateTokens = (userId, role, email) => {
  const payload = {
    id: userId,
    userId,
    role: role || "USER",
    email,
    type: "access",
    iat: Math.floor(Date.now() / 1000),
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: role === "ADMIN" ? "12h" : "24h",
  });

  const refreshToken = jwt.sign(
    { ...payload, type: "refresh" },
    JWT_REFRESH_SECRET,
    { expiresIn: role === "ADMIN" ? "7d" : "30d" },
  );

  return { accessToken, refreshToken };
};
```

#### Token Types:

- **Access Token**: Short-lived (24h for users, 12h for admins)
- **Refresh Token**: Long-lived (30d for users, 7d for admins)

#### Authentication Middleware:

- **authenticateToken**: Verifies JWT and extracts user information
- **requireAdmin**: Role-based access control for admin routes
- **Role-based Guards**: Different permission levels for various operations

#### Security Features:

- **Token Rotation**: Refresh tokens are rotated on use
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Secure Storage**: Access tokens in memory, refresh tokens in httpOnly cookies
- **Automatic Refresh**: Axios interceptors handle token refresh transparently

## Review System

### Review Implementation

#### Database Schema:

```prisma
model Review {
  id          String   @id @default(cuid())
  userId      String   @db.Uuid
  productId   String
  rating      Int      // 1-5 stars
  comment     String?
  isVerified  Boolean  @default(false)  // Purchased product
  status      String   @default("pending")  // pending, approved, rejected
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
  product     Product  @relation(fields: [productId], references: [id])
}
```

#### Review Workflow:

1. **Submission**: Users can review products they've purchased
2. **Verification**: System checks if user has purchased the product
3. **Moderation**: Reviews go through pending → approved/rejected flow
4. **Display**: Only approved reviews are shown publicly

#### API Endpoints:

- `GET /api/reviews/product/:productId` - Fetch product reviews
- `POST /api/reviews` - Submit new review (authenticated users only)
- `PUT /api/reviews/:id` - Update review (admin moderation)
- `DELETE /api/reviews/:id` - Delete review (admin only)

#### Review Features:

- **Rating Aggregation**: Calculates average rating per product
- **Verified Purchases**: Flags reviews from verified buyers
- **Moderation Queue**: Admin approval system for reviews
- **Spam Prevention**: Rate limiting on review submissions

## Service Provision

### Service Architecture

#### API Service Layer (`src/hooks/useApi.js`):

- Centralized API client using Axios
- Automatic error handling and retry logic
- Request/response interceptors for authentication
- Type-safe API calls with TypeScript support

#### Key Services:

#### 1. Authentication Service

- **Login/Registration**: User account management
- **Password Reset**: Secure password recovery flow
- **Profile Management**: User data updates
- **Session Management**: Token refresh and logout

#### 2. Product Service

- **Catalog Management**: Product listing and search
- **Inventory Tracking**: Real-time stock monitoring
- **Category Management**: Product organization
- **Image Management**: Product photo handling

#### 3. Order Service

- **Order Creation**: Multi-step checkout process
- **Order Tracking**: Real-time status updates
- **Order History**: Past order management
- **Order Cancellation**: Cancellation workflow

#### 4. Payment Service

- **Payment Processing**: Integration with payment gateways
- **Webhook Handling**: Asynchronous payment confirmations
- **Refund Processing**: Refund management
- **Invoice Generation**: Order invoicing

#### 5. Notification Service

- **Email Notifications**: Order updates, promotions
- **SMS Notifications**: Critical alerts
- **In-app Notifications**: Real-time updates
- **Push Notifications**: Mobile app integration

#### 6. Delivery Service

- **Route Optimization**: Delivery path calculation
- **Partner Assignment**: Delivery personnel management
- **Tracking Updates**: GPS-based tracking
- **Zone Management**: Delivery area configuration

#### 7. Prescription Service

- **Upload Processing**: Prescription image handling
- **Verification Workflow**: Pharmacist review process
- **Digital Records**: Prescription history
- **Compliance Tracking**: Regulatory compliance

### Service Communication:

- **RESTful APIs**: Standard HTTP methods for CRUD operations
- **WebSocket Integration**: Real-time updates for orders and notifications
- **Event-driven Updates**: Internal event system for cross-service communication
- **Webhook Endpoints**: External service integrations (payments, SMS)

### Code Implementation:

- **Controllers**: Business logic implementation
- **Routes**: API endpoint definitions
- **Middleware**: Cross-cutting concerns (auth, validation, logging)
- **Utils**: Shared utility functions and helpers
- **Events**: Asynchronous event handling and notifications

This comprehensive architecture ensures scalable, maintainable, and secure service provision across all application domains.</content>
<parameter name="filePath">/home/kingshuk/Online24-Pharmacy/doc.md
