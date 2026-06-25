# Online24 Pharmacy — Issues Found

## 🔴 Critical Issues

### 1. `console.log` statements in production code
- `src/main.jsx`: `console.log("🚀 Starting app...")`, `console.log("✅ Root found:", !!rootElement)`, `console.log("✅ App mounted")`
- `src/pages/HomePage.jsx`: Multiple `console.log` for debugging
- `src/pages/admin/AdminDashboard.jsx`: Console logs
- Fix: Remove all console.log statements

### 2. Hardcoded API URLs in frontend
- Multiple files use `import.meta.env.VITE_API_URL || "http://localhost:3000"` inline
- Should be centralized in a single API client
- Files: HomePage, ProductDisplayPage, CartPage, CheckoutPage, etc.

### 3. No Vercel deployment config
- No `vercel.json` exists
- Need to configure for SPA routing

### 4. `react-router-dom` SPA routing won't work on Vercel without config
- Need `vercel.json` with rewrite rules

## 🟡 High-Priority Issues

### 5. Unused imports across files
- `src/pages/CartPage.jsx`: `_getTotalPrice` is unused
- `src/pages/CheckoutPage.jsx`: Multiple unused imports
- Various unused imports across admin pages

### 6. Commented-out code throughout
- `src/App.jsx`: Commented ThemeProvider, ThemeInitializer imports
- `src/pages/admin/AdminDashboard.jsx`: Commented code blocks
- Multiple files have dead code

### 7. TODO/FIXME comments
- Various TODO comments in admin pages

### 8. Inconsistent error handling
- Some pages use try/catch, others don't
- No global error boundary in App (only in main.jsx as class component)

### 9. Missing responsive images
- No `srcset` or responsive image sizes
- Large images served to mobile

### 10. No loading skeletons on key pages
- Product list has no skeleton loader
- Cart page has no loading state

## 🟢 Medium-Priority Issues

### 11. CSS inconsistency
- Some inline styles mixed with Tailwind
- `style={{}}` used alongside Tailwind classes

### 12. Accessibility issues
- Missing alt text on some images
- Missing aria-labels on interactive elements
- Color-only status indicators

### 13. No SEO on many pages
- Only HomePage and CartPage have SEOHead
- Missing meta descriptions

### 14. No PWA support
- No service worker
- No manifest.json for installability

### 15. Missing 404 page
- No catch-all route for unknown paths

### 16. Admin panel security
- Admin routes check role client-side only
- No server-side admin verification beyond JWT role
