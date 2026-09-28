import { Link, NavLink } from "react-router";
import { useSelector } from "react-redux";
import { ShoppingBag, Store } from "lucide-react";

import { selectIsAuthenticated, selectIsSeller } from "@/features/auth/authSlice";
import { useGetCartQuery } from "@/api/cartApi";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { TooltipHint } from "@/components/TooltipHint";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function CartLink() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const count = data?.data?.cart?.totalItems ?? 0;

  return (
    <TooltipHint content="Your cart">
      <Link
        to={isAuthenticated ? "/cart" : "/login"}
        aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
        className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "relative hidden sm:inline-flex")}
      >
        <ShoppingBag />
        {count > 0 && (
          <Badge data-tabular className="absolute -top-2 -right-2 h-5 min-w-5 justify-center px-1">
            {count > 99 ? "99+" : count}
          </Badge>
        )}
      </Link>
    </TooltipHint>
  );
}

const navClass = ({ isActive }) =>
  cn(
    buttonVariants({ variant: "ghost" }),
    isActive ? "text-primary" : "text-foreground/80",
  );

export function Navbar() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isSeller = useSelector(selectIsSeller);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            B
          </span>
          <span className="text-lg font-semibold tracking-tight">Basket</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navClass}>
            Shop
          </NavLink>
          {isSeller && (
            <NavLink to="/seller" className={navClass}>
              <Store /> Sell
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <CartLink />
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="hidden sm:block">
              <UserMenu />
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className={buttonVariants({ variant: "ghost" })}>
                Log in
              </Link>
              <Link to="/register" className={buttonVariants()}>
                Sign up
              </Link>
            </div>
          )}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
