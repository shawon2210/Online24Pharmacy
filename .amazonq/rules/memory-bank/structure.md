# Online24 Pharmacy - Project Structure

## Directory Organization

### Root Level Configuration
```
/home/kingshuk/Online24-Pharmacy/
├── package.json              # Project dependencies and scripts
├── vite.config.js           # Vite build configuration
├── vitest.config.js         # Vitest testing configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML entry point
├── .env                     # Environment variables
└── .env.example             # Environment template
```

### Frontend Structure (`/src`)
```
src/
├── main.jsx                 # React entry point
├── App.jsx                  # Root component
├── index.css               # Global styles
├── i18n.js                 # i18next configuration
├── setupTests.js           # Test setup
│
├── assets/                 # Static assets (images, icons)
│
├── components/             # Reusable React components
│   ├── admin/             # Admin dashboard components
│   ├── auth/              # Authentication components (login, register)
│   ├── cart/              # Shopping cart components
│   ├── chatbot/           # AI chatbot interface
│   ├── checkout/          # Checkout flow components
│   ├── common/            # Shared UI components (buttons, modals, etc.)
│   ├── examples/          # Example/demo components
│   ├── layout/            # Layout components (header, footer, sidebar)
│   ├── marketing/         # Marketing/promotional components
│   ├── notifications/     # Notification display components
│   ├── order/             # Order-related components
│   ├── prescription/      # Prescription management components
│   ├── product/           # Product display components
│   └── support/           # Support/help components
│
├── contexts/              # React Context providers
│   ├── AuthContext.jsx    # Authentication context
│   ├── ThemeProvider.jsx  # Theme provider wrapper
│   └── theme.js           # Theme configuration
│
├── hooks/                 # Custom React hooks
│   ├── useApi.js          # API call hook
│   ├── useAuth.js         # Authentication hook
│   ├── useDebounce.js     # Debounce hook
│   ├── useForm.js         # Form handling hook
│   ├── useHeaderOffset.js # Header offset calculation
│   ├── useLocalStorage.js # Local storage hook
│   ├── useMeta.js         # Meta tags hook
│   ├── usePagination.js   # Pagination hook
│   ├── useTheme.js        # Theme hook
│   ├── useThemeContext.js # Theme context hook
│   ├── useThemeMode.js    # Theme mode hook
│   ├── useTitle.js        # Page title hook
│   ├── useToggle.js       # Toggle state hook
│   └── useTranslation.js  # Translation hook
│
├── locales/               # Internationalization files
│   ├── en.json           # English translations
│   ├── bn.json           # Bengali translations
│   ├── en/               # English locale folder
│   └── bn/               # Bengali locale folder
│
├── pages/                # Page components (route-level)
│   ├── admin/            # Admin pages
│   ├── auth/             # Auth pages (login, register)
│   ├── HomePage.jsx
│   ├── ProductDisplayPage.jsx
│   ├── CategoryPage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── OrdersPage.jsx
│   ├── OrderTrackingPage.jsx
│   ├── PrescriptionsPage.jsx
│   ├── MyPrescriptionsPage.jsx
│   ├── ProfilePage.jsx
│   ├── AccountPage.jsx
│   ├── AboutPage.jsx
│   ├── PickupMapPage.jsx
│   ├── CustomSurgicalKitBuilder.jsx
│   ├── SmartPrescriptionRecorderPage.jsx
│   └── OrderConfirmationPage.jsx
│
├── stores/               # State management (Zustand)
│   ├── authStore.js      # Authentication state
│   └── cartStore.js      # Shopping cart state
│
├── tests/                # Test files
│   ├── responsive/       # Responsive design tests
│   ├── utils/            # Utility function tests
│   ├── validation/       # Validation tests
│   ├── setup.js          # Test setup
│   ├── setupRouterFutureFlags.js
│   └── singleton.js
│
├── uploads/              # User uploads directory
│   ├── prescriptions/    # Prescription images
│   └── products/         # Product images
│
├── utils/                # Utility functions
│   ├── api.js            # API utilities
│   ├── apiClient.js      # API client setup
│   ├── apiClientImproved.js
│   ├── analytics.js      # Analytics tracking
│   ├── constants.js      # Application constants
│   ├── dateHelpers.js    # Date formatting utilities
│   ├── errorHandler.js   # Error handling
│   ├── formatters.js     # Data formatting
│   ├── i18n.js           # i18n utilities
│   ├── i18n-new.js       # New i18n implementation
│   ├── imageOptimization.js
│   ├── normalizeProduct.js
│   ├── orderHelpers.js   # Order-related utilities
│   ├── performance.js    # Performance monitoring
│   ├── performanceOptimization.js
│   ├── pharmacyAI.js     # AI/ML utilities
│   ├── pwa.js            # PWA utilities
│   ├── security.js       # Security utilities
│   ├── validation.js     # Form validation
│   └── validators.js     # Validator functions
│
└── data/                 # Static data
    └── pharmacyKnowledge.js
```

### Backend Structure (`/server`)
```
server/
├── index.js              # Express server entry point
│
├── controllers/          # Request handlers
│   ├── adminController.js
│   ├── authController.js
│   └── savedKitController.js
│
├── routes/              # API route definitions
│   ├── admin/           # Admin routes
│   ├── admin.js
│   ├── adminRoutes.js
│   ├── analytics.js
│   ├── auth.js
│   ├── authRoutes.js
│   ├── cart.js
│   ├── chatbot.js
│   ├── coupons.js
│   ├── delivery.js
│   ├── notifications.js
│   ├── orders.js
│   ├── payments.js
│   ├── pickup.js
│   ├── prescriptions.js
│   ├── products.js
│   ├── reports.js
│   ├── reviews.js
│   ├── savedKits.js
│   ├── users.js
│   └── wishlist.js
│
├── middleware/          # Express middleware
│   ├── auth.js          # Authentication middleware
│   ├── chatbotSafety.js # Chatbot safety checks
│   ├── isAdmin.js       # Admin role check
│   ├── rateLimiter.js   # Rate limiting
│   ├── roleAuth.js      # Role-based authorization
│   ├── security.js      # Security headers
│   └── validation.js    # Request validation
│
├── db/                  # Database utilities
│   ├── client.js        # Database client
│   ├── integrityMiddleware.js
│   ├── prisma.js        # Prisma client setup
│   └── utilities.js     # DB utilities
│
├── utils/               # Utility functions
│   ├── auditLogger.js   # Audit logging
│   ├── chatbotCorpus.js # Chatbot knowledge base
│   ├── geocoding.js     # Geolocation services
│   ├── geocoding.test.js
│   ├── notificationEmitter.js
│   ├── notificationEventHandlers.js
│   ├── notificationManager.js
│   ├── notifications.js
│   ├── prismaHelpers.js
│   ├── socketioSetup.js # Socket.io configuration
│   ├── vectorClient.js  # Vector DB client
│   └── vectorClientScalable.js
│
├── cron/                # Scheduled tasks
│   ├── geocode.js
│   ├── geocodeManager.js
│   ├── notificationCleanup.js
│   └── reminders.js
│
├── events/              # Event emitters
│   └── commerceEventEmitter.js
│
├── data/                # Static data files
│   ├── categories.json
│   ├── dgda-faqs.json
│   ├── dgda-guidelines.json
│   ├── orders.json
│   ├── prescription-reminders.json
│   ├── prescriptions.json
│   ├── products.json
│   ├── promotions.json
│   ├── subcategories.json
│   ├── system-faqs.json
│   ├── system-features.json
│   └── users.json
│
├── tests/               # Backend tests
│   ├── api.test.js
│   └── integrityValidation.test.js
│
├── uploads/             # User uploads
│   └── (prescription and product images)
│
├── scripts/             # Utility scripts
│   └── check-prisma.mjs
│
└── GEOCODING.md         # Geocoding documentation
```

### Database Structure (`/prisma`)
```
prisma/
├── schema.prisma        # Prisma schema definition
├── seed.js              # Database seeding script
├── seed-category.js     # Category seeding
├── seed-pickup.js       # Pickup location seeding
└── migrations/          # Database migrations
    ├── 20251229104644_add_pickup_locations/
    ├── 20260101_add_audit_logging_and_constraints/
    ├── 20260101075350_add_admin_logs/
    ├── 20260101092000_add_pickup_location_indexes/
    └── migration_lock.toml
```

### Public Assets (`/public`)
```
public/
├── category-images/     # Category images
├── manifest.json        # PWA manifest
├── sw.js               # Service worker
├── icon-192x192.png    # PWA icons
├── icon-512x512.png
├── online24pharmacy-logo.png
├── hero.mp4            # Hero video
├── hero.svg            # Hero SVG
├── delivery-zones-dhaka.geojson  # Delivery zone map data
└── (product images)
```

## Core Components & Relationships

### Authentication Flow
```
User Registration/Login
    ↓
AuthController (server/controllers/authController.js)
    ↓
JWT Token Generation
    ↓
AuthContext (src/contexts/AuthContext.jsx)
    ↓
useAuth Hook (src/hooks/useAuth.js)
    ↓
Protected Routes & Components
```

### Product Management Flow
```
Product Display
    ↓
Product Component (src/components/product/)
    ↓
useApi Hook (src/hooks/useApi.js)
    ↓
API Routes (server/routes/products.js)
    ↓
Prisma Client
    ↓
PostgreSQL Database
```

### Order Processing Flow
```
Shopping Cart
    ↓
cartStore (src/stores/cartStore.js)
    ↓
Checkout Page
    ↓
Order Creation (server/routes/orders.js)
    ↓
Payment Processing (server/routes/payments.js)
    ↓
Order Tracking (server/routes/orders.js)
    ↓
Notifications (Socket.io)
```

### Prescription Verification Flow
```
Prescription Upload
    ↓
PrescriptionsPage (src/pages/PrescriptionsPage.jsx)
    ↓
API Upload (server/routes/prescriptions.js)
    ↓
Admin Verification (Admin Dashboard)
    ↓
Prescription Status Update
    ↓
User Notification
```

## Architectural Patterns

### Frontend Architecture
- **Component-Based**: Modular React components organized by feature
- **Context API**: Global state management for auth and theme
- **Custom Hooks**: Reusable logic extraction
- **Zustand Stores**: Lightweight state management for cart and auth
- **React Query**: Server state management and caching
- **Responsive Design**: Tailwind CSS with mobile-first approach

### Backend Architecture
- **Express.js**: RESTful API server
- **Middleware Stack**: Authentication, validation, rate limiting, security
- **Prisma ORM**: Type-safe database queries
- **Service Layer**: Business logic separation
- **Event-Driven**: Socket.io for real-time features
- **Scheduled Tasks**: Node-cron for background jobs

### Database Architecture
- **PostgreSQL**: Primary relational database
- **Prisma Schema**: Type-safe ORM with migrations
- **Relationships**: Foreign keys for data integrity
- **Indexes**: Performance optimization on frequently queried fields
- **Enums**: Type safety for status fields

## Technology Stack Integration

### Frontend Stack
- React 19.2.3 with Vite bundler
- Tailwind CSS for styling
- React Router for navigation
- React Hook Form for form management
- Axios for HTTP requests
- Socket.io-client for real-time updates
- i18next for internationalization
- Zustand for state management
- React Query for server state

### Backend Stack
- Node.js with Express 5.2.1
- Prisma 7.2.0 ORM
- PostgreSQL database
- JWT for authentication
- bcryptjs for password hashing
- Socket.io for real-time communication
- Multer for file uploads
- Node-cron for scheduled tasks
- Nodemailer for email notifications

### Development Tools
- Vite for fast development and building
- Vitest for unit testing
- ESLint for code quality
- PostCSS for CSS processing
- Tailwind CSS for utility-first styling
