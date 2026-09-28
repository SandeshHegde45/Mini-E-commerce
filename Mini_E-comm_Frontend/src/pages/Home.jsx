import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, PackageSearch, Search } from "lucide-react";

import { useGetProductsQuery } from "@/api/productApi";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipHint } from "@/components/TooltipHint";

const PAGE_SIZE = 12;

export default function Home() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery({
    page,
    limit: PAGE_SIZE,
  });

  const products = data?.data?.products;
  const total = data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const visible = useMemo(() => {
    const list = products ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term),
    );
  }, [products, search]);

  function goToPage(next) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everyday things, well chosen.
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse what sellers have listed and add your favourites to your cart.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search this page"
            aria-label="Search products on this page"
            className="pl-9"
          />
        </div>
      </section>

      {isError ? (
        <EmptyState
          icon={PackageSearch}
          title="Couldn't load products"
          description="Check that the backend is running and the API URL is correct, then try again."
          action={<Button onClick={refetch}>Try again</Button>}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={search ? "No matches" : "No products yet"}
          description={
            search
              ? `Nothing on this page matches "${search}".`
              : "Sellers haven't published anything yet. Check back soon."
          }
          action={search && <Button variant="secondary" onClick={() => setSearch("")}>Clear search</Button>}
        />
      ) : (
        <div
          className={`grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity ${isFetching ? "opacity-60" : ""}`}
        >
          {visible.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && !isError && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
          <TooltipHint content="Previous page">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft />
            </Button>
          </TooltipHint>
          <span data-tabular className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <TooltipHint content="Next page">
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight />
            </Button>
          </TooltipHint>
        </nav>
      )}
    </div>
  );
}
