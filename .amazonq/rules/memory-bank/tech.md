# Online24 Pharmacy - Technology Stack & Development

## Programming Languages & Versions

### JavaScript/Node.js
- **Node.js**: v18+ recommended
- **npm**: Latest version (comes with Node.js)
- **Module System**: ES Modules (type: "module" in package.json)

### Frontend
- **React**: 19.2.3
- **React DOM**: 19.2.3
- **React Router**: 7.11.0
- **TypeScript**: Not used (JavaScript project)

### Backend
- **Express.js**: 5.2.1
- **Node.js Runtime**: ES Modules

### Database
- **PostgreSQL**: Recommended (configured in prisma/schema.prisma)
- **Prisma Client**: 7.2.0
- **Prisma Adapter**: @prisma/adapter-pg 7.2.0

## Build Systems & Tools

### Frontend Build
- **Vite**: 7.3.0 (bundler and dev server)
- **@vitejs/plugin-react**: 5.1.2 (React plugin)
- **PostCSS**: 8.5.6 (CSS processing)
- **Autoprefixer**: 10.4.23 (vendor prefixes)
- **Tailwind CSS**: 4.1.18 (utility-first CSS)

### Backend Build
- **Node.js**: Native ES Modules support
- **No build step required** for backend (runs directly)

### Testing
- **Vitest**: 4.0.16 (unit testing framework)
- **jsdom**: 27.4.0 (DOM simulation)
- **@testing-library/react**: 16.3.1 (React testing utilities)
- **@testing-library/jest-dom**: 6.9.1 (DOM matchers)

### Code Quality
- **ESLint**: 9.39.2 (@eslint/js)
- **eslint-plugin-react-hooks**: 7.0.1
- **eslint-plugin-react-refresh**: 0.4.26

## Core Dependencies

### Frontend Libraries
```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "react-router-dom": "^7.11.0",
  "react-hook-form": "^7.69.0",
  "@hookform/resolvers": "^5.2.2",
  "@tanstack/react-query": "^5.90.16",
  "zustand": "^5.0.9",
  "axios": "^1.13.2",
  "socket.io-client": "^4.8.3",
  "i18next": "^25.7.3",
  "react-i18next": "^16.5.1",
  "i18next-browser-languagedetector": "^8.2.0",
  "framer-motion": "^12.23.26",
  "react-hot-toast": "^2.6.0",
  "maplibre-gl": "^5.15.0",
  "lucide-react": "^0.562.0",
  "@heroicons/react": "^2.2.0",
  "@headlessui/react": "^2.2.9",
  "react-intersection-observer": "^10.0.0",
  "zod": "^4.3.4",
  "flowbite": "^4.0.1"
}
```

### Backend Libraries
```json
{
  "express": "^5.2.1",
  "@prisma/client": "^7.2.0",
  "@prisma/adapter-pg": "^7.2.0",
  "pg": "^8.16.3",
  "jsonwebtoken": "^9.0.3",
  "bcryptjs": "^3.0.3",
  "dotenv": "^17.2.3",
  "cors": "^2.8.5",
  "cookie-parser": "^1.4.7",
  "express-validator": "^7.3.1",
  "express-rate-limit": "^8.2.1",
  "multer": "^2.0.2",
  "socket.io": "^4.8.3",
  "node-cron": "^4.2.1",
  "nodemailer": "^7.0.12",
  "twilio": "^5.11.1"
}
```

### Styling
- **Tailwind CSS**: 4.1.18 (utility-first CSS framework)
- **@tailwindcss/forms**: 0.5.11 (form styling)
- **@tailwindcss/typography**: 0.5.19 (prose styling)
- **@tailwindcss/aspect-ratio**: 0.4.2 (aspect ratio utilities)

### UI Components & Icons
- **@headlessui/react**: 2.2.9 (unstyled accessible components)
- **@heroicons/react**: 2.2.0 (icon library)
- **lucide-react**: 0.562.0 (additional icons)
- **flowbite**: 4.0.1 (component library)

### Drag & Drop
- **@dnd-kit/core**: 6.3.1 (drag and drop library)
- **@dnd-kit/utilities**: 3.2.2 (utilities)

## Development Commands

### Installation & Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma migrate dev --name init
npx prisma db seed
```

### Development
```bash
# Start development server (frontend on port 5173)
npm run dev

# Start backend server (port 3000)
npm run server

# Run both concurrently (requires setup)
npm run dev & npm run server
```

### Building
```bash
# Build frontend for production
npm run build

# Preview production build
npm run serve
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run API tests
npm test:api
```

### Database
```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio
```

### Production
```bash
# Start production server
npm start
```

## Environment Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/online24pharmacy

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Server
PORT=3000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3000/api

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Geolocation
GEOCODING_API_KEY=your_api_key

# Vector DB (if using)
VECTOR_DB_URL=your_vector_db_url
```

## Build Configuration Details

### Vite Configuration
- **Dev Server**: Proxy to http://localhost:3000 for API calls
- **Build Output**: Optimized chunks with code splitting
- **Chunk Strategy**: Vendor chunks for React, TanStack, Framer Motion, Icons, Axios, Router
- **Minification**: esbuild
- **Source Maps**: Disabled in production
- **Chunk Size Warning**: 1500KB limit

### Tailwind Configuration
- **Content**: Scans src/ for class names
- **Theme**: Extended with custom colors and spacing
- **Plugins**: Forms, Typography, Aspect Ratio
- **Dark Mode**: Class-based dark mode support

### PostCSS Configuration
- **Plugins**: Tailwind CSS, Autoprefixer
- **Processing**: CSS-in-JS and standard CSS files

### Prisma Configuration
- **Provider**: PostgreSQL
- **Preview Features**: Full-text search
- **Binary Targets**: Native and linux-musl

## Performance Optimizations

### Frontend
- Code splitting with Vite
- Lazy loading of routes
- Image optimization utilities
- React Query caching
- Intersection Observer for lazy rendering
- Service Worker for PWA capabilities

### Backend
- Database query optimization with Prisma
- Rate limiting on API endpoints
- Caching strategies
- Scheduled cleanup tasks
- Connection pooling with PostgreSQL

### Build
- Minification and compression
- Tree shaking of unused code
- Vendor bundle separation
- Reduced sourcemap generation
- Optimized dependency pre-bundling

## Deployment Considerations

### Frontend Deployment
- Build output: `dist/` directory
- Requires Node.js runtime or static hosting
- Environment variables via `.env` file
- Service Worker for offline support

### Backend Deployment
- Node.js v18+ required
- PostgreSQL database required
- Environment variables for secrets
- Port configuration (default 3000)
- File upload directory setup

### Database Deployment
- PostgreSQL 12+ recommended
- Prisma migrations for schema management
- Connection pooling recommended
- Backup strategy required

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies: `npm install`
3. Configure `.env` file
4. Set up database: `npx prisma migrate dev`
5. Seed data: `npx prisma db seed`
6. Start dev server: `npm run dev`
7. Start backend: `npm run server`

### Testing Workflow
1. Write tests in `src/tests/` or `server/tests/`
2. Run tests: `npm test`
3. Check coverage: `npm test:coverage`
4. Fix issues and re-run

### Deployment Workflow
1. Build frontend: `npm run build`
2. Run tests: `npm test`
3. Deploy `dist/` to hosting
4. Deploy backend to server
5. Run migrations: `npx prisma migrate deploy`
6. Start production server: `npm start`
