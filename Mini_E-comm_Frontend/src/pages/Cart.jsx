import { Link } from "react-router";
import { AlertTriangle, CreditCard, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import {
  useClearCartMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/api/cartApi";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingButton } from "@/components/LoadingButton";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipHint } from "@/components/TooltipHint";
import { toast } from "@/lib/toast";
import { formatPrice, getApiErrorMessage } from "@/utils/format";

function CartItem({ item }) {
  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();
  const { product, quantity, subtotal, available } = item;

  async function changeQuantity(nextQuantity) {
    try {
      await updateCartItem({ productId: product._id, quantity: nextQuantity }).unwrap();
    } catch (error) {
      toast.error("Couldn't update quantity", getApiErrorMessage(error));
    }
  }

  async function removeItem() {
    try {
      await removeCartItem(product._id).unwrap();
      toast.success("Item removed", `${product.title} was removed from your cart.`);
    } catch (error) {
      toast.error("Couldn't remove item", getApiErrorMessage(error));
    }
  }

  if (!product) {
    return (
      <li>
        <Card>
          <CardContent className="text-sm text-muted-foreground">This product is no longer available.</CardContent>
        </Card>
      </li>
    );
  }

  return (
    <li>
      <Card className="flex-row gap-4 p-3 sm:p-4">
        <Link to={`/products/${product._id}`} className="shrink-0">
          <img
            src={product.image?.[0]}
            alt={product.title}
            className="size-20 rounded-lg object-cover sm:size-24"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <Link to={`/products/${product._id}`} className="line-clamp-2 font-medium hover:underline">
              {product.title}
            </Link>
            <p data-tabular className="shrink-0 font-semibold">
              {formatPrice(subtotal, product.price.currency)}
            </p>
          </div>
          <p data-tabular className="text-sm text-muted-foreground">
            {formatPrice(product.price.amount, product.price.currency)} each
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1" aria-label={`Quantity for ${product.title}`}>
              <TooltipHint content="Decrease quantity">
                <LoadingButton
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Decrease ${product.title}`}
                  onClick={() => changeQuantity(quantity - 1)}
                  loading={isUpdating}
                  disabled={isUpdating || isRemoving || quantity <= 1}
                >
                  {!isUpdating && <Minus />}
                </LoadingButton>
              </TooltipHint>
              <span data-tabular className="min-w-8 text-center text-sm font-medium">{quantity}</span>
              <TooltipHint content="Increase quantity">
                <LoadingButton
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Increase ${product.title}`}
                  onClick={() => changeQuantity(quantity + 1)}
                  loading={isUpdating}
                  disabled={isUpdating || isRemoving || !available}
                >
                  {!isUpdating && <Plus />}
                </LoadingButton>
              </TooltipHint>
            </div>
            <TooltipHint content="Remove item">
              <LoadingButton
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${product.title}`}
                onClick={removeItem}
                loading={isRemoving}
                disabled={isUpdating}
              >
                {!isRemoving && <Trash2 />}
              </LoadingButton>
            </TooltipHint>
            {!available && (
              <Badge className="bg-warning/15 text-warning">
                <AlertTriangle className="size-3" /> Not enough stock
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}

export default function Cart() {
  const { data, isLoading, isError, refetch } = useGetCartQuery();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  const cart = data?.data?.cart;
  const items = cart?.items ?? [];
  const currency = items.find((i) => i.product)?.product.price.currency ?? "INR";
  const hasUnavailableItems = items.some((item) => !item.available);

  async function handleClearCart() {
    try {
      await clearCart().unwrap();
      toast.success("Cart cleared", "All items were removed from your cart.");
    } catch (error) {
      toast.error("Couldn't clear cart", getApiErrorMessage(error));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your cart</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={ShoppingBag}
          title="Couldn't load your cart"
          description="Please try again in a moment."
          action={<Button onClick={refetch}>Try again</Button>}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add something you like and it will show up here."
          action={<Link to="/" className={buttonVariants()}>Start shopping</Link>}
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
          <ul className="space-y-3">
            {items.map((item, i) => (
              <CartItem key={item.product?._id ?? i} item={item} />
            ))}
          </ul>

          <aside className="lg:sticky lg:top-24">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Order summary</h2>
                <TooltipHint content="Clear cart">
                  <LoadingButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Clear cart"
                    onClick={handleClearCart}
                    loading={isClearing}
                  >
                    {!isClearing && <X />}
                  </LoadingButton>
                </TooltipHint>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Items</dt>
                  <dd data-tabular>{cart.totalItems}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <dt>Total</dt>
                  <dd data-tabular>{formatPrice(cart.totalAmount, currency)}</dd>
                </div>
              </dl>
              <TooltipHint content={hasUnavailableItems ? "Remove unavailable items first" : "Continue to checkout"}>
                <span className="mt-5 block">
                  {hasUnavailableItems ? (
                    <Button size="lg" className="w-full" disabled>
                      <CreditCard /> Checkout
                    </Button>
                  ) : (
                    <Link to="/checkout" className={buttonVariants({ size: "lg", className: "w-full" })}>
                      <CreditCard /> Checkout
                    </Link>
                  )}
                </span>
              </TooltipHint>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}
