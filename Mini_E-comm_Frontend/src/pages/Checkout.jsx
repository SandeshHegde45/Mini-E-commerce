import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Check, CreditCard, LockKeyhole, MapPin } from "lucide-react";
import { useSelector } from "react-redux";

import { useCheckoutCartMutation, useGetCartQuery } from "@/api/cartApi";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { EmptyState } from "@/components/EmptyState";
import { LoadingButton } from "@/components/LoadingButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { formatPrice, getApiErrorMessage } from "@/utils/format";

const initialDetails = {
  name: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  paymentMethod: "cod",
};

function createOrderId() {
  return `BK-${Date.now().toString(36).toUpperCase()}`;
}

export default function Checkout() {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetCartQuery();
  const [checkoutCart, { isLoading: isPlacingOrder }] = useCheckoutCartMutation();
  const [details, setDetails] = useState({
    ...initialDetails,
    name: user?.name || "",
    email: user?.email || "",
  });

  const cart = data?.data?.cart;
  const items = cart?.items ?? [];
  const currency = items.find((item) => item.product)?.product.price.currency ?? "INR";
  const hasUnavailableItems = items.some((item) => !item.available);

  function updateDetails(event) {
    const { name, value } = event.target;
    setDetails((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (hasUnavailableItems) {
      toast.error("Review your cart", "Remove unavailable items before placing the order.");
      navigate("/cart");
      return;
    }

    try {
      await checkoutCart().unwrap();
      const orderId = createOrderId();
      toast.success("Order placed", `Your order ${orderId} has been confirmed.`);
      navigate("/order-success", {
        replace: true,
        state: {
          orderId,
          customerName: details.name,
          total: cart.totalAmount,
          currency,
          itemCount: cart.totalItems,
        },
      });
    } catch (error) {
      toast.error("Couldn't place order", getApiErrorMessage(error));
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Skeleton className="h-128 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Couldn't load checkout"
        description="Please try again in a moment."
        action={<Button type="button" onClick={refetch}>Try again</Button>}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={CreditCard}
        title="Your cart is empty"
        description="Add something to your cart before checking out."
        action={<Link to="/" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">Browse products</Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to cart
      </Link>
      <div>
        <Badge variant="secondary">Secure checkout</Badge>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Ready when you are</h1>
        <p className="mt-2 text-muted-foreground">Confirm your delivery details and place your order.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="size-5 text-primary" /> Delivery details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="checkout-name">Full name</FieldLabel>
                  <Input id="checkout-name" name="name" value={details.name} onChange={updateDetails} autoComplete="name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-email">Email</FieldLabel>
                  <Input id="checkout-email" name="email" type="email" value={details.email} onChange={updateDetails} autoComplete="email" required />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="checkout-address">Address</FieldLabel>
                <Input id="checkout-address" name="address" value={details.address} onChange={updateDetails} autoComplete="street-address" required />
                <FieldDescription>We will use this address for delivery.</FieldDescription>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="checkout-city">City</FieldLabel>
                  <Input id="checkout-city" name="city" value={details.city} onChange={updateDetails} autoComplete="address-level2" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-postal-code">Postal code</FieldLabel>
                  <Input id="checkout-postal-code" name="postalCode" inputMode="numeric" value={details.postalCode} onChange={updateDetails} autoComplete="postal-code" pattern="[0-9]{4,10}" required />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="checkout-payment">Payment method</FieldLabel>
                <NativeSelect id="checkout-payment" name="paymentMethod" value={details.paymentMethod} onChange={updateDetails}>
                  <option value="cod">Cash on delivery</option>
                </NativeSelect>
                <FieldDescription>Online payments will be available in a future update.</FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product?._id} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-muted-foreground">{item.product?.title} × {item.quantity}</span>
                  <span data-tabular className="shrink-0">{formatPrice(item.subtotal, currency)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-border pt-4 font-semibold">
              <span>Total</span>
              <span data-tabular>{formatPrice(cart.totalAmount, currency)}</span>
            </div>
            {hasUnavailableItems && (
              <p className="text-sm text-destructive">Remove unavailable items before placing this order.</p>
            )}
            <LoadingButton type="submit" size="lg" className="w-full" loading={isPlacingOrder} disabled={hasUnavailableItems}>
              {!isPlacingOrder && <Check />}
              Place order
            </LoadingButton>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><LockKeyhole className="size-3" /> Your checkout details stay in this session.</p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
