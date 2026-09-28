import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, ShoppingBag, Store } from "lucide-react";

import { clearCredentials, selectCurrentUser, selectIsSeller } from "@/features/auth/authSlice";
import { useLogoutMutation } from "@/api/authApi";
import { apiSlice } from "@/api/apiSlice";
import { initials } from "@/utils/format";
import { toast } from "@/lib/toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const user = useSelector(selectCurrentUser);
  const isSeller = useSelector(selectIsSeller);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  async function handleLogout() {
    try {
      await logout().unwrap();
    } catch {
      // Session may already be gone — clear local state regardless.
    } finally {
      dispatch(clearCredentials());
      dispatch(apiSlice.util.resetApiState());
      toast.success("Signed out", "Come back soon.");
      navigate("/");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-lg" className="rounded-full" aria-label="Account menu" />}
      >
        <Avatar size="lg">
          <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
            {initials(user?.name) || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="px-2 py-1.5">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/cart")}>
          <ShoppingBag /> My cart
        </DropdownMenuItem>
        {isSeller && (
          <DropdownMenuItem onClick={() => navigate("/seller")}>
            <Store /> Seller dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
