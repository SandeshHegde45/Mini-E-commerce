import { Link, useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { ShoppingBag } from "lucide-react";

import { selectIsAuthenticated } from "@/features/auth/authSlice";
import { useAddToCartMutation } from "@/api/cartApi";
import { LoadingButton } from "@/components/LoadingButton";
import { TooltipHint } from "@/components/TooltipHint";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { formatPrice, getApiErrorMessage } from "@/utils/format";

export function StockBadge({ stock }) {
  if (stock < 1) return <Badge variant="destructive">Out of stock</Badge>;
  if (stock <= 5) return <Badge className="bg-warning/15 text-warning">Only {stock} left</Badge>;
  return <Badge className="bg-success/15 text-success">In stock</Badge>;
}

export function ProductCard({ product }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const [addToCart, { isLoading }] = useAddToCartMutation();
  const soldOut = product.stock < 1;

  async function handleAdd() {
    if (!isAuthenticated) {
      toast.info("Log in to add items", "Your cart is saved to your account.");
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap();
      toast.success("Added to cart", product.title);
    } catch (error) {
      toast.error("Couldn't add to cart", getApiErrorMessage(error));
    }
  }

  return (
    <Card className="group gap-0 py-0">
      <Link to={`/products/${product._id}`} className="block overflow-hidden bg-muted">
        <img
          src={product.image?.[0]}
          alt={product.title}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <Link to={`/products/${product._id}`} className="line-clamp-2 font-medium leading-snug hover:underline">
            {product.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p data-tabular className="text-lg font-semibold">
            {formatPrice(product.price.amount, product.price.currency)}
          </p>
          <StockBadge stock={product.stock} />
        </div>
        <TooltipHint content={soldOut ? "This item is sold out" : "Add one to your cart"}>
          <LoadingButton variant="secondary" size="lg" className="w-full" onClick={handleAdd} loading={isLoading} disabled={soldOut}>
            {!isLoading && <ShoppingBag />}
            Add to cart
          </LoadingButton>
        </TooltipHint>
      </CardContent>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="gap-0 py-0">
      <Skeleton className="aspect-square w-full rounded-none" />
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
