import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeliveryPanel from "./pages/DeliveryPanel";
import SupplierPanel from "./pages/SupplierPanel";
import PharmacistPanel from "./pages/PharmacistPanel";
// Role-based route guards
function RequireRole({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } =
    require("./hooks/useAuth").useAuth();
  const location = require("react-router-dom").useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center max-w-md p-8 bg-background rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6">
            You do not have permission to access this page.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-emerald-600 text-background rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }
  return children;
}
{
  /* Deliveryman Panel */
}
<Route
  path="/delivery-panel"
  element={
    <RequireRole allowedRoles={["DELIVERY_PARTNER"]}>
      <DeliveryPanel />
    </RequireRole>
  }
/>;
{
  /* Supplier Panel */
}
<Route
  path="/supplier-panel"
  element={
    <RequireRole allowedRoles={["SUPPLIER"]}>
      <SupplierPanel />
    </RequireRole>
  }
/>;
{
  /* Pharmacist Panel (redirects to admin prescriptions) */
}
<Route
  path="/pharmacist-panel"
  element={
    <RequireRole allowedRoles={["PHARMACIST"]}>
      <PharmacistPanel />
    </RequireRole>
  }
/>;
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import {
  RequireAuth,
  RequireGuest,
  RequireAdmin,
} from "./components/auth/ProtectedRoute";

// Common Components
// ThemeProvider is provided at app root (main.jsx); do not re-wrap here
// ThemeInitializer is executed at root (ThemeInit) so skip duplicate import

import AIChatbot from "./components/chatbot/AIChatbot";
import ScrollToTop from "./components/common/ScrollToTop";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";

// Page Components (Public)
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import CategoriesListPage from "./pages/CategoriesListPage";
import ProductDisplayPage from "./pages/ProductDisplayPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import AccountPage from "./pages/AccountPage";
import OrdersPage from "./pages/OrdersPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import MyPrescriptionsPage from "./pages/MyPrescriptionsPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import PickupMapPage from "./pages/PickupMapPage";
import AboutPage from "./pages/AboutPage";
import CustomSurgicalKitBuilder from "./pages/CustomSurgicalKitBuilder";
import WishlistPage from "./pages/WishlistPage";

// Page Components (Admin)
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductsPage from "./pages/admin/ProductsPage";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminPrescriptions from "./pages/admin/AdminPrescriptions";
import AdminSuppliers from "./pages/admin/AdminSuppliers";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminTest from "./pages/admin/AdminTest";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import AdminPickupLocations from "./pages/admin/AdminPickupLocations";
import AdminShopsPage from "./pages/admin/AdminShopsPage";
import AdminNotifications from "./pages/admin/AdminNotifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <Router>
            <ScrollToTop />
            <Toaster position="top-center" reverseOrder={false} />
            <AIChatbot />
            <Routes>
              {/* Guest Routes */}
              <Route
                path="/login"
                element={
                  <RequireGuest>
                    <LoginPage />
                  </RequireGuest>
                }
              />
              <Route
                path="/signup"
                element={
                  <RequireGuest>
                    <SignupPage />
                  </RequireGuest>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="prescriptions" element={<AdminPrescriptions />} />
                <Route path="suppliers" element={<AdminSuppliers />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="shops" element={<AdminShopsPage />} />
                <Route path="audit-log" element={<AdminAuditLog />} />
                <Route path="notifications" element={<AdminNotifications />} />
                {/* Pickup Locations route removed */}
                <Route path="test" element={<AdminTest />} />
              </Route>

              {/* Public Routes */}
              <Route
                path="/*"
                element={
                  <Layout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route
                        path="/products"
                        element={<ProductDisplayPage />}
                      />
                      <Route
                        path="/products/:slug"
                        element={<ProductDisplayPage />}
                      />
                      <Route
                        path="/categories"
                        element={<CategoriesListPage />}
                      />
                      <Route
                        path="/categories/:slug"
                        element={<CategoryPage />}
                      />
                      <Route
                        path="/product/:slug"
                        element={<ProductDisplayPage />}
                      />
                      <Route path="/about" element={<AboutPage />} />
                      <Route
                        path="/build-kit"
                        element={<CustomSurgicalKitBuilder />}
                      />
                      <Route path="/pickup-map" element={<PickupMapPage />} />
                      <Route path="/track-order" element={<TrackOrderPage />} />

                      {/* Authenticated Routes */}
                      <Route
                        path="/cart"
                        element={
                          <RequireAuth>
                            <CartPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/prescription"
                        element={
                          <RequireAuth>
                            <PrescriptionsPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/my-prescriptions"
                        element={
                          <RequireAuth>
                            <MyPrescriptionsPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/account/orders"
                        element={
                          <RequireAuth>
                            <OrdersPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/my-orders"
                        element={
                          <RequireAuth>
                            <OrdersPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/account"
                        element={
                          <RequireAuth>
                            <AccountPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <RequireAuth>
                            <ProfilePage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/wishlist"
                        element={
                          <RequireAuth>
                            <WishlistPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <RequireAuth>
                            <CheckoutPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/orders/:orderId"
                        element={
                          <RequireAuth>
                            <OrderTrackingPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/order/confirmation/:orderId"
                        element={
                          <RequireAuth>
                            <OrderConfirmationPage />
                          </RequireAuth>
                        }
                      />
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
          </Router>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
