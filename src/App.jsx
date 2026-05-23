import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { selectIsAuthenticated, selectCurrentUser } from "./store/authSlice";
import { fetchCart } from "./services/cartService";
import { setCartItems } from "./store/cartSlice";
import { requestNotificationPermission, onMessageListener } from "./services/firebase";
import { ChatProvider } from "./context/ChatContext";

import "./App.css";

// ── Regular pages ──────────────────────────────────────────────────────────────
import Navbar        from "./components/navbar";
import Footer        from "./components/footer";
import Chatbot       from "./components/Chatbot";
import AuthLayout    from "./pages/register";
import Hero          from "./pages/hero";
import CartPage      from "./pages/cart";
import ProductListing from "./pages/products";
import ProductDetail  from "./pages/ProductDetail";
import ProfilePage    from "./pages/profile";
import CheckoutPage   from "./pages/checkout";
import ManageProducts from "./pages/manageProducts";
import OwnerDashboard from "./pages/OwnerDashboard";
import ChatRequests   from "./pages/ChatRequests";
import WishlistPage   from "./pages/wishlist";
import PaymentSuccess from "./pages/PaymentSuccess";
import Room3D         from "./pages/Room3D";
import ChatPage       from "./pages/ChatPage";

// ── Guard & Admin pages ────────────────────────────────────────────────────────
import ProtectedRoute      from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout         from "./pages/admin/AdminLayout";
import AdminHome           from "./pages/admin/AdminHome";
import StaffDashboard      from "./pages/StaffDashboard";
import AdminProducts       from "./pages/admin/AdminProducts";
import AdminUsers          from "./pages/admin/AdminUsers";
import ComingSoon          from "./pages/admin/ComingSoon";

function App() {
  const dispatch        = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser     = useSelector(selectCurrentUser);
  const location        = useLocation();

  // Hide user Navbar / Footer on all /admin routes
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Initialise cart on load — skip for blocked users
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn:  fetchCart,
    enabled:  isAuthenticated && currentUser?.is_live !== false,
  });

  useEffect(() => {
    if (cartData) dispatch(setCartItems(cartData));
  }, [cartData, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      requestNotificationPermission();
      onMessageListener();
    }
  }, [isAuthenticated]);

  return (
    <>
      <ChatProvider>
        <Toaster position="top-center" reverseOrder={false} />

        {/* Main user navbar – hidden inside admin */}
        {!isAdminRoute && <Navbar />}

        <Routes>
          {/* ── Public / user routes ────────────────────────────── */}
          <Route path="/auth"             element={<AuthLayout />} />
          <Route path="/"                 element={<Hero />} />
          <Route path="/cart"             element={<CartPage />} />
          <Route path="/products"         element={<ProductListing />} />
          <Route path="/products/:id"     element={<ProductDetail />} />
          <Route path="/profile"          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/checkout"         element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/owner/products"   element={<ProtectedRoute><ManageProducts /></ProtectedRoute>} />
          <Route path="/owner/dashboard"  element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/chat-requests" element={<ProtectedRoute><ChatRequests /></ProtectedRoute>} />
          <Route path="/my-chats"         element={<ProtectedRoute><ChatRequests /></ProtectedRoute>} />
          <Route path="/chat/:roomId"     element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/wishlist"         element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/payment-success"  element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/room"             element={<Room3D />} />

          {/* ── Admin routes (staff only) ────────────────────────── */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            {/* /admin  →  Admin welcome home */}
            <Route index      element={<AdminHome />} />
            {/* /admin/kyc  →  KYC requests list */}
            <Route path="kyc" element={<StaffDashboard />} />
            {/* /admin/products  →  Admin Products list & toggle */}
            <Route path="products" element={<AdminProducts />} />
            {/* /admin/users  →  Admin Users list & toggle */}
            <Route path="users" element={<AdminUsers />} />
            {/* /admin/owners  →  Coming Soon */}
            <Route path="owners" element={<ComingSoon section="Owners" />} />
          </Route>
        </Routes>

        {/* Main user footer – hidden inside admin */}
        {!isAdminRoute && <Footer />}

        {!isAdminRoute && <Chatbot />}
      </ChatProvider>
    </>
  );
}

export default App;
