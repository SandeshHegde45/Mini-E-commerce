import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  selectAuthStatus,
  selectIsAuthenticated,
  selectIsSeller,
} from "@/features/auth/authSlice";
import { Spinner } from "@/components/ui/spinner";

function PageSpinner({ label }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" aria-label={label} />
    </div>
  );
}

// Requires a signed-in user.
export function ProtectedRoute({ redirectTo = "/login" }) {
  const status = useSelector(selectAuthStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (status === "loading") return <PageSpinner label="Checking your session" />;
  if (!isAuthenticated) return <Navigate to={redirectTo} state={{ from: location }} replace />;
  return <Outlet />;
}

// Requires a signed-in user with the seller role.
export function SellerRoute() {
  const status = useSelector(selectAuthStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isSeller = useSelector(selectIsSeller);
  const location = useLocation();

  if (status === "loading") return <PageSpinner label="Checking your session" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isSeller) return <Navigate to="/" replace />;
  return <Outlet />;
}

// Login/register are only for signed-out visitors.
export function GuestRoute() {
  const status = useSelector(selectAuthStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (status === "loading") return <PageSpinner label="Checking your session" />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
