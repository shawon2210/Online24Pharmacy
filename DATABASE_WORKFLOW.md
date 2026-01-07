# Online24 Pharmacy - Database Workflow: PostgreSQL + Prisma Client

## Overview
This document explains the end-to-end database flow for the Online24 Pharmacy project, covering how data flows from the frontend through the backend to PostgreSQL and back.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  Components → Hooks (useApi) → Axios → API Calls           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────┐
│                  BACKEND (Express.js)                       │
│  Routes → Controllers → Middleware → Business Logic        │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma Client
┌────────────────────────▼────────────────────────────────────┐
│              PRISMA ORM (Type-Safe Layer)                   │
│  Query Builder → SQL Generation → Connection Pooling       │
└────────────────────────┬────────────────────────────────────┘
                         │ PostgreSQL Protocol
┌────────────────────────▼────────────────────────────────────┐
│           PostgreSQL Database (Relational)                  │
│  Tables → Indexes → Constraints → Data Storage             │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration Flow

### 1. Environment Setup
```
.env (Environment Variables)
  ├── DATABASE_URL: Connection string to PostgreSQL
  ├── JWT_SECRET: Authentication token secret
  └── NODE_ENV: development/production
         ↓
prisma.config.ts (Prisma Configuration)
  ├── datasources.db.url: Reads DATABASE_URL
  └── Configures connection pooling
         ↓
prisma/schema.prisma (Database Schema)
  ├── Defines all models (User, Product, Order, etc.)
  ├── Relationships between models
  └── Indexes and constraints
```

### 2. Prisma Client Initialization
```javascript
// server/db/prisma.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

export default prisma;
```

**What happens:**
- Prisma reads `prisma.config.ts` for database URL
- Establishes connection pool to PostgreSQL
- Generates type-safe query methods based on schema
- Ready to execute queries

---

## Data Flow: Complete Example (Product Browsing)

### Scenario: User browses products on homepage

#### Step 1: Frontend Request
```javascript
// src/pages/HomePage.jsx
const { data: products, loading, error } = useApi(() => 
  fetch('/api/products?category=pain-relief')
);
```

**What happens:**
- React component calls custom hook `useApi`
- Hook makes HTTP GET request to backend
- Request includes query parameters

#### Step 2: Backend Route Handler
```javascript
// server/routes/products.js
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    // Query Prisma
    const products = await prisma.product.findMany({
      where: {
        category: { slug: category },
        isActive: true
      },
      include: {
        category: true,
        reviews: { take: 5 }
      },
      take: 20
    });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});
```

**What happens:**
- Express route receives request
- Extracts query parameters
- Calls Prisma query method

#### Step 3: Prisma Query Execution
```
Prisma Client receives: findMany({
  where: { category: { slug: 'pain-relief' }, isActive: true },
  include: { category: true, reviews: { take: 5 } },
  take: 20
})
         ↓
Prisma generates SQL:
SELECT p.*, c.*, r.* FROM products p
LEFT JOIN categories c ON p.categoryId = c.id
LEFT JOIN reviews r ON p.id = r.productId
WHERE c.slug = 'pain-relief' AND p.isActive = true
LIMIT 20
         ↓
Sends to PostgreSQL via connection pool
         ↓
PostgreSQL executes query
         ↓
Returns result set
         ↓
Prisma transforms to JavaScript objects
         ↓
Returns to Express controller
```

#### Step 4: Response to Frontend
```javascript
// Backend sends JSON response
res.json(products);
// Response: [{ id: '1', name: 'Aspirin', price: 50, ... }, ...]

// Frontend receives and updates state
const { data: products } = useApi(...);
// products = [{ id: '1', name: 'Aspirin', ... }, ...]

// Component re-renders with data
{products.map(p => <ProductCard key={p.id} product={p} />)}
```

---

## Data Flow: Complex Example (Order Creation)

### Scenario: User completes checkout and creates order

#### Step 1: Frontend Collects Data
```javascript
// src/pages/CheckoutPage.jsx
const handleSubmit = async (formData) => {
  const orderData = {
    items: cart.map(item => ({
      productId: item.id,
      quantity: item.quantity
    })),
    shippingAddress: formData.address,
    paymentMethod: formData.paymentMethod,
    prescriptionId: formData.prescriptionId
  };
  
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
};
```

#### Step 2: Backend Receives & Validates
```javascript
// server/routes/orders.js
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, prescriptionId } = req.body;
    const userId = req.user.id;
    
    // Validate prescription if required
    if (prescriptionId) {
      const prescription = await prisma.prescription.findUnique({
        where: { id: prescriptionId }
      });
      if (!prescription || prescription.status !== 'APPROVED') {
        return res.status(400).json({ error: 'Invalid prescription' });
      }
    }
    
    // Validate stock for each item
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
    }
```

#### Step 3: Prisma Transaction (Atomic Operation)
```javascript
    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber: `ORD-${Date.now()}`,
          status: 'PENDING',
          totalAmount: calculateTotal(items),
          paymentMethod,
          shippingAddress: JSON.stringify(shippingAddress),
          prescriptionId,
          paymentStatus: 'PENDING'
        }
      });
      
      // 2. Create order items
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.price,
            totalPrice: product.price * item.quantity
          }
        });
        
        // 3. Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }
      
      // 4. Create order tracking
      await tx.orderTracking.create({
        data: {
          orderId: newOrder.id,
          status: 'CONFIRMED',
          description: 'Order confirmed'
        }
      });
      
      return newOrder;
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});
```

**What happens in transaction:**
```
BEGIN TRANSACTION
  ├─ INSERT INTO orders (...)
  ├─ INSERT INTO order_items (...) [multiple]
  ├─ UPDATE products SET stockQuantity = stockQuantity - quantity
  ├─ INSERT INTO order_tracking (...)
COMMIT TRANSACTION
```

If any step fails, entire transaction rolls back (ACID compliance).

---

## Key Prisma Operations

### 1. Create (INSERT)
```javascript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    phone: '01712345678',
    passwordHash: hashedPassword,
    firstName: 'John',
    lastName: 'Doe'
  }
});
// SQL: INSERT INTO users (...) VALUES (...)
```

### 2. Read (SELECT)
```javascript
// Find one
const product = await prisma.product.findUnique({
  where: { id: 'prod-123' }
});

// Find many
const products = await prisma.product.findMany({
  where: { isActive: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0
});

// Find with relations
const order = await prisma.order.findUnique({
  where: { id: 'ord-123' },
  include: {
    user: true,
    orderItems: {
      include: { product: true }
    }
  }
});
```

### 3. Update (UPDATE)
```javascript
const updatedProduct = await prisma.product.update({
  where: { id: 'prod-123' },
  data: {
    price: 150,
    stockQuantity: { decrement: 5 }
  }
});
// SQL: UPDATE products SET price = 150, stockQuantity = stockQuantity - 5 WHERE id = 'prod-123'
```

### 4. Delete (DELETE)
```javascript
const deletedProduct = await prisma.product.delete({
  where: { id: 'prod-123' }
});
// SQL: DELETE FROM products WHERE id = 'prod-123'
```

### 5. Transactions (Multiple operations atomically)
```javascript
const result = await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: {...} });
  await tx.orderItem.create({ data: {...} });
  await tx.product.update({ data: {...} });
  return order;
});
```

---

## Database Schema Relationships

### User-Related Models
```
User (1) ──────────────── (Many) Order
  │                          │
  ├─ (1) ──────────── (Many) CartItem
  │
  ├─ (1) ──────────── (Many) WishlistItem
  │
  ├─ (1) ──────────── (Many) Address
  │
  ├─ (1) ──────────── (Many) Prescription
  │
  └─ (1) ──────────── (Many) Review
```

### Order-Related Models
```
Order (1) ──────────────── (Many) OrderItem
  │                           │
  ├─ (1) ──────────── (Many) OrderTracking
  │
  └─ (1) ──────────── (1) Prescription
```

### Product-Related Models
```
Product (1) ──────────────── (Many) OrderItem
  │                             │
  ├─ (1) ──────────── (Many) CartItem
  │
  ├─ (1) ──────────── (Many) WishlistItem
  │
  ├─ (1) ──────────── (Many) Review
  │
  ├─ (Many) ──────────── (1) Category
  │
  └─ (Many) ──────────── (1) Subcategory
```

---

## Connection Pooling

### How it works:
```
┌─────────────────────────────────────────┐
│   Prisma Client (Node.js Process)       │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │ Connection Pool │
        │  (5 connections)│
        └────────┬────────┘
                 │
    ┌────┬────┬────┬────┬────┐
    │ C1 │ C2 │ C3 │ C4 │ C5 │
    └────┴────┴────┴────┴────┘
         │
    ┌────▼─────────────────┐
    │  PostgreSQL Server   │
    │  (Accepts queries)   │
    └──────────────────────┘
```

**Benefits:**
- Reuses connections instead of creating new ones
- Reduces overhead
- Improves performance
- Configured in `DATABASE_URL` with `connection_limit=5`

---

## Error Handling Flow

### Example: Product not found
```javascript
// Frontend
try {
  const product = await fetch('/api/products/invalid-id');
  if (!product.ok) throw new Error('Product not found');
} catch (error) {
  setError(error.message);
  // Display error to user
}

// Backend
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});
```

---

## Performance Optimization

### 1. Indexing
```prisma
model Product {
  id String @id @default(cuid())
  slug String? @unique  // Index for fast lookups
  categoryId String
  isActive Boolean @default(true)
  
  @@index([slug])
  @@index([categoryId])
  @@index([isActive])
}
```

### 2. Selective Queries
```javascript
// ❌ Bad: Fetches all fields
const products = await prisma.product.findMany();

// ✅ Good: Fetch only needed fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true
  }
});
```

### 3. Pagination
```javascript
// ✅ Good: Limit results
const products = await prisma.product.findMany({
  take: 20,
  skip: (page - 1) * 20
});
```

### 4. Eager Loading (Include)
```javascript
// ✅ Good: Load relations in one query
const order = await prisma.order.findUnique({
  where: { id: 'ord-123' },
  include: {
    orderItems: { include: { product: true } }
  }
});
```

---

## Migration Flow

### Creating a new table/field:
```bash
# 1. Update prisma/schema.prisma
# Add new model or field

# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Prisma generates SQL migration file
# 4. Applies migration to database
# 5. Updates Prisma Client types

# 4. Deploy to production
npx prisma migrate deploy
```

---

## Debugging & Monitoring

### Enable Query Logging
```javascript
// server/db/prisma.js
const prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' }
  ]
});
```

### View Database with Prisma Studio
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

---

## Summary

**Data Flow Path:**
```
User Action (Frontend)
  ↓
React Component/Hook
  ↓
HTTP Request (Axios)
  ↓
Express Route Handler
  ↓
Middleware (Auth, Validation)
  ↓
Prisma Query Builder
  ↓
SQL Generation
  ↓
Connection Pool
  ↓
PostgreSQL Execution
  ↓
Result Set
  ↓
Prisma Transformation
  ↓
Express Response
  ↓
HTTP Response
  ↓
Frontend State Update
  ↓
UI Re-render
```

This ensures type-safe, efficient, and reliable database operations throughout the application.
