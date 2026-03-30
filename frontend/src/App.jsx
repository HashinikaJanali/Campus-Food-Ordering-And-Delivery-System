import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import UserLayout from './components/UserLayout';
import FeedbackPage from './pages/FeedbackPage';
import AboutPage from './pages/AboutPage';
import OrderManagementPage from './pages/OrderManagementPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import DeliveryStaffPage from './pages/DeliveryStaffPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import UserHomePage from './pages/UserHomePage';
import AdminDashboard from './pages/AdminDashboard';

import AdminLayout from './components/AdminLayout';
import AdminSubLayout from './components/AdminSubLayout';
import AdminLogin from './pages/inventory/AdminLoginPage';
import DashboardPage from './pages/inventory/DashboardPage';
import FoodItemsPage from './pages/inventory/FoodItemsPage';
import InventoryPage from './pages/inventory/InventoryPage';
import CategoriesPage from './pages/inventory/CategoriesPage';
import AlertsPage from './pages/inventory/AlertsPage';
import MenuPreviewPage from './pages/inventory/MenuPreviewPage';
import StudentMenuPage from './pages/inventory/StudentMenuPage';
import AnalyticsPage from './pages/inventory/AnalyticsPage';
import CanteensPage from './pages/inventory/CanteensPage';

import AdminPromotionsPage from './pages/AdminPromotionsPage';
import AdminPanelUsers from './pages/AdminPanelUsers';
import AdminPanelPayments from './pages/AdminPanelPayments';
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import UserProfilePage from "./pages/UserProfilePage";
import MyOrdersPage from "./pages/MyOrdersPage";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return admin ? children : <Navigate to="/admin/login" replace />;
};

// User Protected Route
const UserProtectedRoute = ({ children }) => {
  const { user, loading, setLoginRedirect } = useUserAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLoginRedirect(location.pathname);
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <UserAuthProvider>
        <AppProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                {/* Student routes */}
                <Route path="/signup" element={<UserLayout><SignupPage /></UserLayout>} />
                <Route path="/login" element={<UserLayout><LoginPage /></UserLayout>} />
                <Route path="/cart" element={<UserLayout><CartPage /></UserLayout>} />
                <Route path="/checkout" element={<UserLayout><UserProtectedRoute><CheckoutPage /></UserProtectedRoute></UserLayout>} />
                <Route path="/order-success" element={<UserLayout><OrderSuccessPage /></UserLayout>} />
                <Route path="/profile" element={<UserLayout showHeader={false} showFooter={false}><UserProtectedRoute><UserProfilePage /></UserProtectedRoute></UserLayout>} />
                <Route path="/about" element={<UserLayout><AboutPage /></UserLayout>} />
                <Route path="/feedback" element={<Layout><FeedbackPage /></Layout>} />
                <Route path="/orders" element={<AdminSubLayout showFooter={false}><OrderManagementPage /></AdminSubLayout>} />
                <Route path="/order/:orderId" element={<AdminSubLayout showFooter={false}><OrderDetailsPage /></AdminSubLayout>} />
                <Route path="/track" element={<UserLayout showHeader={false} showFooter={false}><OrderTrackingPage /></UserLayout>} />
                <Route path="/my-orders" element={<UserLayout showHeader={false} showFooter={false}><UserProtectedRoute><MyOrdersPage /></UserProtectedRoute></UserLayout>} />
                <Route path="/tracking" element={<AdminSubLayout showFooter={false}><OrderTrackingPage /></AdminSubLayout>} />
                <Route path="/history" element={<AdminSubLayout showFooter={false}><OrderHistoryPage /></AdminSubLayout>} />
                <Route path="/menu" element={<UserLayout><StudentMenuPage /></UserLayout>} />
                <Route path="/home" element={<UserLayout><UserHomePage /></UserLayout>} />
                <Route path="/" element={<UserLayout><UserHomePage /></UserLayout>} />
                
                <Route path="/delivery-staff" element={<DeliveryStaffPage />} />

                {/* Admin routes */}
                <Route path="/admin/management" element={<ProtectedRoute><AdminSubLayout showFooter={false}><AdminDashboard /></AdminSubLayout></ProtectedRoute>} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="food-items" element={<FoodItemsPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="alerts" element={<AlertsPage />} />
                  <Route path="menu-preview" element={<MenuPreviewPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="canteens" element={<CanteensPage />} />
                  <Route path="promotions" element={<AdminPromotionsPage />} />
                  <Route path="users" element={<AdminPanelUsers />} />
                  <Route path="payments" element={<AdminPanelPayments />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: '#fff',
                    color: '#111827',
                    fontFamily: 'DM Sans, Plus Jakarta Sans, sans-serif',
                    fontSize: '14px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#f97316',
                      secondary: '#fff',
                    },
                    style: {
                      borderLeft: '4px solid #f97316',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                    style: {
                      borderLeft: '4px solid #ef4444',
                    },
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </AppProvider>
      </UserAuthProvider>
    </Router>
  );
}

export default App;
