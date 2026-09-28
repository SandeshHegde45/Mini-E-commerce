import { useEffect } from "react";
import { Route, Routes } from "react-router";
import { useDispatch } from "react-redux";

import { authApi } from "@/api/authApi";
import { bootstrapFailed, setCredentials } from "@/features/auth/authSlice";
import { RootLayout } from "@/components/layout/RootLayout";
import { GuestRoute, ProtectedRoute, SellerRoute } from "@/components/layout/RouteGuards";

import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import SellerDashboard from "@/pages/SellerDashboard";
import NotFound from "@/pages/NotFound";

export default function App() {
  const dispatch = useDispatch();

  // Restore the session on load using the httpOnly refresh-token cookie.
  useEffect(() => {
    const request = dispatch(authApi.endpoints.refreshToken.initiate());
    request
      .unwrap()
      .then((res) => dispatch(setCredentials(res.data)))
      .catch(() => dispatch(bootstrapFailed()));
    return () => request.abort?.();
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="products/:id" element={<ProductDetail />} />

        <Route element={<ProtectedRoute redirectTo="/register" />}>
          <Route index element={<Home />} />
        </Route>

        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
        </Route>

        <Route element={<SellerRoute />}>
          <Route path="seller" element={<SellerDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
