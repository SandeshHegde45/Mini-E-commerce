import { createContext, useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { CreditCard } from "lucide-react";

import { useGetCartQuery } from "@/api/cartApi";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/utils/format";

const CartPreviewContext = createContext(null);

function CartPreviewSheet({ open, onOpenChange }) {
  const { data, isLoading, isError, refetch } = useGetCartQuery(undefined, { skip: !open });
  const cart = data?.data?.cart;
  const items = cart?.items ?? [];
  const currency = items.find((item) => item.product)?.product.price.currency ?? "INR";
  const hasUnavailableItems = items.some((item) => !item.available);

  useEffect(() => {
    if (!open) return undefined;
    const timeoutId = window.setTimeout(() => onOpenChange(false), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [open, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[92vw] max-w-sm gap-0 p-0">
        <SheetHeader className="border-b pr-14">
          <SheetTitle>Added to your cart</SheetTitle>
          <SheetDescription>Review your items or continue shopping.</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <div className="p-4 text-sm text-muted-foreground">
            <p>Couldn't load your cart.</p>
            <Button variant="link" className="px-0" onClick={refetch}>Try again</Button>
          </div>
        ) : (
          <>
            <ul className="max-h-[50vh] flex-1 divide-y overflow-y-auto px-4">
              {items.filter((item) => item.product).map((item) => (
                <li key={item.product._id} className="flex items-center gap-3 py-3">
                  <img
                    src={item.product.image?.[0]}
                    alt={item.product.title}
                    className="size-14 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{item.product.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p data-tabular className="shrink-0 text-sm font-medium">
                    {formatPrice(item.subtotal, item.product.price.currency)}
                  </p>
                </li>
              ))}
              {items.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">Your cart is empty.</li>
              )}
            </ul>

            {cart && (
              <div className="flex justify-between border-t px-4 py-3 text-sm">
                <span className="text-muted-foreground">{cart.totalItems} items</span>
                <span data-tabular className="font-semibold">{formatPrice(cart.totalAmount, currency)}</span>
              </div>
            )}
          </>
        )}

        <SheetFooter className="mt-auto border-t">
          {items.length > 0 && !isError && !hasUnavailableItems ? (
            <SheetClose
              nativeButton={false}
              render={<Link to="/checkout" className={buttonVariants({ size: "lg", className: "w-full" })} />}
            >
              <CreditCard /> Checkout
            </SheetClose>
          ) : (
            <Button size="lg" className="w-full" disabled>
              <CreditCard /> Checkout
            </Button>
          )}
          <SheetClose
            nativeButton={false}
            render={<Button variant="outline" size="lg" className="w-full" />}
          >
            Continue shopping
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function CartPreviewProvider({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <CartPreviewContext.Provider value={{ showCartPreview: () => setOpen(true) }}>
      {children}
      <CartPreviewSheet open={open} onOpenChange={setOpen} />
    </CartPreviewContext.Provider>
  );
}

export function useCartPreview() {
  const context = useContext(CartPreviewContext);
  if (!context) throw new Error("useCartPreview must be used within CartPreviewProvider");
  return context;
}