import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { ArrowLeft, Check, Minus, PackageX, Plus, ShoppingBag } from "lucide-react";

import { selectIsAuthenticated } from "@/features/auth/authSlice";
import { useGetProductByIdQuery } from "@/api/productApi";
import { useAddToCartMutation } from "@/api/cartApi";
import { useCartPreview } from "@/components/CartPreview";
import { StockBadge } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingButton } from "@/components/LoadingButton";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipHint } from "@/components/TooltipHint";
import { toast } from "@/lib/toast";
import { formatPrice, getApiErrorMessage } from "@/utils/format";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data, isLoading, isError } = useGetProductByIdQuery(id);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const { showCartPreview } = useCartPreview();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimeout = useRef(null);

  const product = data?.data?.product;

  async function handleAdd() {
    if (!isAuthenticated) {
      toast.info("Log in to add items", "Your cart is saved to your account.");
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      await addToCart({ productId: product._id, quantity }).unwrap();
      setAdded(true);
      clearTimeout(addedTimeout.current);
      addedTimeout.current = setTimeout(() => setAdded(false), 5000);
      showCartPreview();
    } catch (error) {
      toast.error("Couldn't add to cart", getApiErrorMessage(error));
    }
  }

  useEffect(() => () => clearTimeout(addedTimeout.current), []);

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <EmptyState
        icon={PackageX}
        title="Product not found"
        description="It may have been unpublished or removed by the seller."
        action={<Link to="/" className={buttonVariants()}>Back to shop</Link>}
      />
    );
  }

  const soldOut = product.stock < 1;
  const maxQty = Math.min(product.stock, 99);

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All products
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          <img src={product.image?.[0]} alt={product.title} className="aspect-square w-full object-cover" />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.title}</h1>
            <p data-tabular className="mt-2 text-2xl font-semibold text-primary">
              {formatPrice(product.price.amount, product.price.currency)}
            </p>
          </div>

          <StockBadge stock={product.stock} />

          <p className="max-w-prose whitespace-pre-line leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center self-start rounded-lg border bg-card">
              <TooltipHint content="Decrease quantity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Decrease quantity"
                  disabled={soldOut || quantity <= 1}
                  onClick={() => setQuantity((q) => q - 1)}
                >
                  <Minus />
                </Button>
              </TooltipHint>
              <span data-tabular aria-live="polite" className="w-10 text-center text-sm font-medium">
                {quantity}
              </span>
              <TooltipHint content={quantity >= maxQty ? "That's all we have" : "Increase quantity"}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Increase quantity"
                  disabled={soldOut || quantity >= maxQty}
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus />
                </Button>
              </TooltipHint>
            </div>

            <LoadingButton size="lg" className="flex-1 sm:flex-none sm:px-10" onClick={handleAdd} loading={isAdding} disabled={soldOut}>
              {!isAdding && (added ? <Check /> : <ShoppingBag />)}
              {soldOut ? "Sold out" : added ? "Added to cart" : "Add to cart"}
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}
