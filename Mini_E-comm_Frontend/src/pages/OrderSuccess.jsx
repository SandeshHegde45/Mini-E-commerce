import { Link, useLocation } from "react-router";
import { CheckCircle2, PackageCheck, ShoppingBag } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/utils/format";

export default function OrderSuccess() {
  const { state } = useLocation();
  const orderId = state?.orderId || "your order";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-primary px-6 py-10 text-center text-primary-foreground sm:px-10">
          <CheckCircle2 className="mx-auto size-14" />
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground/75">Order confirmed</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Thanks, {state?.customerName || "shopper"}.</h1>
          <p className="mt-3 text-primary-foreground/80">Your Basket order is on its way to the next step.</p>
        </div>
        <CardContent className="space-y-6 p-6 sm:p-10">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Order number</p>
              <p data-tabular className="mt-2 font-semibold">{orderId}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Order total</p>
              <p data-tabular className="mt-2 font-semibold">{state ? formatPrice(state.total, state.currency) : "Confirmed"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-muted p-4 text-sm">
            <PackageCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-muted-foreground">We have your order details. Delivery updates will be available once order tracking is connected.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/" className={buttonVariants({ size: "lg", className: "flex-1" })}><ShoppingBag /> Continue shopping</Link>
            <Link to="/cart" className={buttonVariants({ variant: "outline", size: "lg", className: "flex-1" })}>View cart</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
