# Authentication & Authorization System

## ✅ Implementation Complete

### User Roles
- **USER** - Regular customers
- **ADMIN** - System administrators
- **PHARMACIST** - Pharmacy staff
- **DELIVERY_PARTNER** - Delivery personnel

### Authentication Flow

#### 1. Login Process
```
User enters credentials → Backend validates → JWT token issued → Token stored in localStorage → User redirected
```

#### 2. Protected Routes
- **RequireAuth** - Any authenticated user
- **RequireAdmin** - Admin users only
- **RequireGuest** - Unauthenticated users only

### Frontend Protection

#### AuthContext Features
- ✅ JWT token management
- ✅ User state persistence (localStorage)
- ✅ Automatic token injection (axios interceptor)
- ✅ Role-based access control
- ✅ Login/Logout functionality

#### Protected Route Components
```jsx
<RequireAuth>
  <CartPage />
</RequireAuth>

<RequireAdmin>
  <AdminDashboard />
</RequireAdmin>

<RequireGuest>
  <LoginPage />
</RequireGuest>
```

### Backend Protection

#### Middleware
- **authenticateToken** - Verifies JWT token
- **adminAuth** - Checks ADMIN role
- **roleAuth** - Checks specific roles

#### Protected Endpoints
```
/api/admin/*        - Admin only
/api/cart/*         - Authenticated users
/api/orders/*       - Authenticated users
/api/prescriptions/* - Authenticated users
```

### Login Credentials

#### Admin Account
```
Email:    admin@online24pharmacy.com
Password: admin123
Role:     ADMIN
```

#### Test User Account
Create via signup form or add to data/users.json

### Security Features

#### Implemented ✅
- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ HTTP-only cookies (optional)
- ✅ Token expiration (12h admin, 24h user)
- ✅ Refresh token support
- ✅ Role-based access control
- ✅ Protected routes (frontend & backend)
- ✅ Automatic token injection
- ✅ Session persistence

#### Access Control Matrix

| Route | Guest | User | Admin |
|-------|-------|------|-------|
| / (Home) | ✅ | ✅ | ✅ |
| /login | ✅ | ❌ | ❌ |
| /signup | ✅ | ❌ | ❌ |
| /cart | ❌ | ✅ | ✅ |
| /checkout | ❌ | ✅ | ✅ |
| /orders | ❌ | ✅ | ✅ |
| /prescriptions | ❌ | ✅ | ✅ |
| /admin/* | ❌ | ❌ | ✅ |

### Authorization Checks

#### Frontend
```javascript
// Check if user is authenticated
const { isAuthenticated } = useAuth();

// Check if user is admin
const { isAdmin } = useAuth();

// Get current user
const { user } = useAuth();

// Check specific role
if (user?.role === 'ADMIN') {
  // Admin-only code
}
```

#### Backend
```javascript
// Require authentication
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains authenticated user
});

// Require admin role
router.get('/admin', authenticateToken, adminAuth, (req, res) => {
  // Admin-only endpoint
});
```

### Token Management

#### Storage
- **Access Token**: localStorage (`auth_token`)
- **User Data**: localStorage (`auth_user`)
- **Refresh Token**: HTTP-only cookie (optional)

#### Expiration
- Admin tokens: 12 hours
- User tokens: 24 hours
- Refresh tokens: 7 days (admin), 30 days (user)

### Error Handling

#### Unauthorized Access (401)
- User not authenticated
- Token expired
- Invalid token

#### Forbidden Access (403)
- User authenticated but lacks permissions
- Wrong role for resource

#### Frontend Behavior
- Redirect to `/login` if not authenticated
- Show "Access Denied" page if wrong role
- Preserve intended destination for post-login redirect

### Testing Authentication

#### Test Admin Login
1. Start server: `npm run server`
2. Start frontend: `npm run dev`
3. Go to: `http://localhost:5173/login`
4. Enter admin credentials
5. Should redirect to `/admin/dashboard`

#### Test User Login
1. Create user via signup
2. Login with user credentials
3. Should redirect to `/`
4. Try accessing `/admin/dashboard`
5. Should see "Access Denied"

#### Test Protected Routes
1. Logout
2. Try accessing `/cart`
3. Should redirect to `/login`
4. Login
5. Should redirect back to `/cart`

### Common Issues & Solutions

#### Issue: Login button not working
**Solution**: Routes fixed from `/auth/login` to `/login`

#### Issue: Admin can't access admin panel
**Solution**: Check user role is exactly "ADMIN" (case-sensitive)

#### Issue: Token not persisting
**Solution**: Check localStorage is enabled in browser

#### Issue: Unauthorized after refresh
**Solution**: Token loaded from localStorage on app init

### Security Best Practices

#### Implemented ✅
- ✅ Passwords never stored in plain text
- ✅ Tokens expire automatically
- ✅ Role checks on both frontend and backend
- ✅ Sensitive routes protected
- ✅ CORS configured properly

#### Recommended for Production
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Add 2FA for admin accounts
- [ ] Use secure HTTP-only cookies
- [ ] Implement token rotation
- [ ] Add IP-based restrictions
- [ ] Enable audit logging
- [ ] Implement session timeout

## Status: ✅ FULLY FUNCTIONAL

Authentication and authorization system is complete and working end-to-end.
