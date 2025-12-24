# Admin Login Credentials

## ✅ Admin Account Created

### Login Details:
```
Email:    admin@online24pharmacy.com
Password: admin123
Role:     ADMIN
```

## How to Login:

1. **Start the server:**
   ```bash
   npm run server
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Navigate to login:**
   - Go to: `http://localhost:5173/login`
   - Or: `http://localhost:5173/auth/login`

4. **Enter credentials:**
   - Email: `admin@online24pharmacy.com`
   - Password: `admin123`

5. **Access admin panel:**
   - After login, go to: `http://localhost:5173/admin/dashboard`

## Admin Routes:
- `/admin/dashboard` - Dashboard overview
- `/admin/products` - Product management
- `/admin/categories` - Category management
- `/admin/orders` - Order management
- `/admin/prescriptions` - Prescription verification
- `/admin/customers` - Customer management
- `/admin/analytics` - Analytics & reports

## Troubleshooting:

### If login fails:
1. Check server is running on port 3000
2. Check browser console for errors
3. Verify credentials are correct
4. Clear browser cache/cookies

### If admin routes don't work:
1. Ensure you're logged in
2. Check user role is "ADMIN"
3. Check browser localStorage for token

## Security Notes:
- ⚠️ Change the default password in production
- ⚠️ Use strong passwords
- ⚠️ Enable 2FA for admin accounts
- ⚠️ Regularly rotate admin credentials

## Additional Admin Users:

To create more admin users, run:
```bash
node -e "const bcrypt = require('bcryptjs'); const fs = require('fs'); const users = JSON.parse(fs.readFileSync('data/users.json')); users.push({id: 'admin-002', email: 'admin2@example.com', password: bcrypt.hashSync('password123', 10), firstName: 'Admin', lastName: 'Two', role: 'ADMIN', phone: '+8801700000001', isVerified: true, isActive: true, createdAt: new Date().toISOString()}); fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2)); console.log('Admin user created');"
```

## Status: ✅ READY TO USE
