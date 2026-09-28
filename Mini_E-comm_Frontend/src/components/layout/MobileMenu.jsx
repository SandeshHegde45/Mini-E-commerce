import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { LogIn, LogOut, Menu, ShoppingBag, Store, UserPlus } from "lucide-react";

import {
  clearCredentials,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsSeller,
} from "@/features/auth/authSlice";
import { useLogoutMutation } from "@/api/authApi";
import { apiSlice } from "@/api/apiSlice";
import { initials } from "@/utils/format";
import { toast } from "@/lib/toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const linkClass = buttonVariants({ variant: "ghost", size: "lg", className: "justify-start" });

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isSeller = useSelector(selectIsSeller);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  async function handleLogout() {
    try {
      await logout().unwrap();
    } catch {
      // ignore — clearing local state regardless
    } finally {
      dispatch(clearCredentials());
      dispatch(apiSlice.util.resetApiState());
      toast.success("Signed out", "Come back soon.");
      setOpen(false);
      navigate("/");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="outline" size="icon-lg" className="md:hidden" aria-label="Open menu" />}
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="right" className="w-[86vw] max-w-sm gap-0 p-0">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          {isAuthenticated && (
            <div className="mb-3 flex items-center gap-3 rounded-lg border p-3">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                  {initials(user?.name) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          )}

          <SheetClose render={<Link to="/" />} className={linkClass}>
            Shop
          </SheetClose>
          {isAuthenticated && (
            <SheetClose render={<Link to="/cart" />} className={linkClass}>
              <ShoppingBag /> My cart
            </SheetClose>
          )}
          {isSeller && (
            <SheetClose render={<Link to="/seller" />} className={linkClass}>
              <Store /> Seller dashboard
            </SheetClose>
          )}

          <Separator className="my-3" />

          {isAuthenticated ? (
            <Button variant="destructive" size="lg" onClick={handleLogout}>
              <LogOut /> Log out
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <SheetClose
                render={<Link to="/login" />}
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                <LogIn /> Log in
              </SheetClose>
              <SheetClose render={<Link to="/register" />} className={buttonVariants({ size: "lg" })}>
                <UserPlus /> Create account
              </SheetClose>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
