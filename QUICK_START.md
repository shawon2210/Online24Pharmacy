# 🚀 Quick Start Guide - Online24 Pharmacy Server

## ⚡ Get Started in 5 Minutes

---

## 📋 Prerequisites

- Node.js v18+ installed
- npm installed
- PostgreSQL installed (optional - file-based fallback available)

---

## 🔧 Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Minimum required in `.env`:**
```env
JWT_SECRET="your-secret-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-change-this"
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

### 3. Set Up Database (Optional)

**If using PostgreSQL:**
```bash
# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/online24_pharmacy"

# Run migrations
npx prisma migrate dev

# Seed data
npx prisma db seed
```

**If using file-based storage:**
- No setup needed! Server will auto-create JSON files in `server/data/`

### 4. Start Server
```bash
npm run server
```

Server will start at: `http://localhost:3000`

---

## ✅ Verify Installation

### Check Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### Run Verification Script
```bash
node verify-server.mjs
```

---

## 🎯 Quick Test

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User",
    "phone": "01712345678"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

Save the `accessToken` from response!

### 3. Get Products
```bash
curl http://localhost:3000/api/products
```

### 4. Get Notifications (with token)
```bash
curl http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📁 Project Structure

```
Online24-Pharmacy/
├── server/
│   ├── index.js              # Main server file
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── notifications.js  # ✅ FIXED
│   │   └── ...
│   ├── controllers/          # Business logic
│   ├── middleware/           # Auth, validation, etc.
│   ├── db/                   # Database layer
│   ├── utils/                # Utilities
│   ├── events/               # Event emitters
│   └── data/                 # JSON file storage
├── prisma/
│   └── schema.prisma         # Database schema
├── .env                      # Environment variables
└── package.json
```

---

## 🔑 Default Admin Account

If you seed the database, a default admin account is created:

```
Email: admin@online24pharmacy.com
Password: Admin123!
```

**⚠️ Change this password immediately in production!**

---

## 📚 Available Scripts

```bash
# Start server
npm run server

# Start development (with Vite)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Verify server
node verify-server.mjs
```

---

## 🌐 API Endpoints

### Public Endpoints (No Auth Required)
- `GET /health` - Health check
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/products` - List products
- `GET /api/products/:slug` - Product details
- `POST /api/chatbot` - Ask chatbot
- `GET /api/delivery/coverage` - Check delivery

### Protected Endpoints (Auth Required)
- `GET /api/auth/me` - Current user
- `GET /api/cart` - User cart
- `POST /api/orders` - Create order
- `GET /api/notifications` - User notifications ✅
- `GET /api/prescriptions` - User prescriptions
- `PATCH /api/users/me` - Update profile

### Admin Endpoints (Admin Auth Required)
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/prescriptions` - Approve prescriptions
- `GET /api/analytics/dashboard` - Analytics

**Full API reference:** See `SERVER_API_REFERENCE.md`

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Or use different port
PORT=3001 npm run server
```

### Database connection error
```bash
# Check PostgreSQL is running
pg_isready

# Or use file-based storage (no setup needed)
# Server will automatically fall back
```

### Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Permission errors on uploads
```bash
# Create upload directories
mkdir -p uploads/prescriptions uploads/products
chmod 755 uploads
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change JWT secrets in `.env`
- [ ] Change default admin password
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set `NODE_ENV=production`
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Configure secure cookies
- [ ] Review and update `.env` variables

---

## 📊 Monitoring

### View Logs
```bash
# Server logs
tail -f server.log

# Or use console output
npm run server
```

### Check Performance
```bash
# Monitor slow queries (development mode)
# Queries >100ms are logged automatically
```

---

## 🆘 Need Help?

1. **Check Documentation:**
   - `SERVER_API_REFERENCE.md` - API endpoints
   - `SERVER_FIXES_APPLIED.md` - Recent fixes
   - `SERVER_COMPLETE_SUMMARY.md` - Full overview

2. **Run Verification:**
   ```bash
   node verify-server.mjs
   ```

3. **Check Logs:**
   - Console output
   - `server.log` file

4. **Common Issues:**
   - Port already in use → Change PORT in `.env`
   - Database error → Use file-based fallback
   - Module errors → Run `npm install`
   - Permission errors → Check file permissions

---

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Server starts without errors
- ✅ Health check returns `{"status": "OK"}`
- ✅ You can register and login
- ✅ Products endpoint returns data
- ✅ Notifications endpoint works
- ✅ Verification script passes all checks

---

## 🎉 You're Ready!

Your Online24 Pharmacy server is now running with:
- ✅ 18+ route groups
- ✅ 100+ API endpoints
- ✅ Full authentication system
- ✅ Notification system (newly fixed)
- ✅ Admin panel
- ✅ Payment integration
- ✅ Prescription management
- ✅ AI chatbot
- ✅ And much more!

**Start building amazing features! 🚀**

---

## 📞 Quick Reference

| What | Command |
|------|---------|
| Start server | `npm run server` |
| Check health | `curl http://localhost:3000/health` |
| Verify setup | `node verify-server.mjs` |
| View API docs | Open `SERVER_API_REFERENCE.md` |
| Check logs | `tail -f server.log` |

---

**Happy Coding! 💻**
