import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import {
  RequireAuth,
  RequireGuest,
  RequireAdmin,
} from "./components/auth/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import Layout from "./components/layout/Layout";
import AIChatbot from "./components/chatbot/AIChatbot";
import ScrollToTop from "./components/common/ScrollToTop";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import CategoriesListPage from "./pages/CategoriesListPage";
import ProductDisplayPage from "./pages/ProductDisplayPage";
import AdminProductsPage from "./pages/admin/ProductsPage";
import AdminCategories from "./pages/admin/AdminCategories";
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
import AdminDashboard from "./pages/admin/AdminDashboard";

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
import CustomSurgicalKitBuilder from "./pages/CustomSurgicalKitBuilder";
import AdminPickupLocations from "./pages/admin/AdminPickupLocations";

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
        <Router>
          <ScrollToTop />
          <Toaster position="top-center" reverseOrder={false} />
          <AIChatbot />
          <Routes>
            <Route
              path="/login"
              element={
                <RequireGuest>
                  <Layout>
                    <LoginPage />
                  </Layout>
                </RequireGuest>
              }
            />
            <Route
              path="/signup"
              element={
                <RequireGuest>
                  <Layout>
                    <SignupPage />
                  </Layout>
                </RequireGuest>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/products"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminProductsPage />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminCategories />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminOrders />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminInventory />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminAnalytics />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/prescriptions"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminPrescriptions />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/suppliers"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminSuppliers />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/promotions"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminPromotions />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminReviews />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminCustomers />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/audit-log"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminAuditLog />
                  </AdminLayout>
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/test"
              element={
                <RequireAdmin>
                  <AdminTest />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/pickup-locations"
              element={
                <RequireAdmin>
                  <AdminLayout>
                    <AdminPickupLocations />
                  </AdminLayout>
                </RequireAdmin>
              }
            />

            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductDisplayPage />} />
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
