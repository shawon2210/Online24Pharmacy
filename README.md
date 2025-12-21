# Online24Pharmacy

IUBAT - Practicum Project

## Project Overview

Online24Pharmacy is a modern, full-featured online pharmacy platform. It provides a seamless experience for users to browse, order, and manage pharmacy products and prescriptions online. The project includes both frontend (React) and backend (Node.js/Express, Prisma) components.

---

## Project Flow

1. **User Browsing**: Users can browse products, categories, and promotions on the homepage and product pages.
2. **Authentication**: Users can register, log in, and manage their accounts securely.
3. **Cart & Checkout**: Add products to cart, upload prescriptions, and proceed to checkout.
4. **Order Management**: Users can view order history, track orders, and manage prescriptions.
5. **Admin Panel**: Admins can manage products, categories, orders, users, and view analytics.
6. **Chatbot & Support**: Integrated chatbot for instant support and FAQs.
7. **Notifications**: Users receive notifications for order status, promotions, and reminders.

---

## Running the Project

### Prerequisites

- Node.js (v18+ recommended)
- npm (comes with Node.js)
- (Optional) PostgreSQL or SQLite for database (configured in `prisma/schema.prisma`)

### 1. Clone the Repository

```bash
git clone https://github.com/shawon2210/Online24Pharmacy.git
cd Online24Pharmacy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up the Database

- Edit `prisma/schema.prisma` if needed for your DB setup.
- Run migrations and seed data:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or as shown in the terminal).

### 5. Build for Production

```bash
npm run build
```

### 6. Run Tests

```bash
npm test
```

---

## Folder Structure

- `src/` - Frontend React code (components, pages, hooks, contexts)
- `server/` - Backend Node.js/Express code (routes, controllers, middleware)
- `prisma/` - Prisma schema and seed scripts
- `public/` - Static assets (images, manifest, service worker)
- `data/` - Sample data

---

## Contribution & Support

- Pull requests are welcome.
- For major changes, open an issue first to discuss what you would like to change.
- For help, see the issues section or contact the maintainer.

---

## License

MIT
