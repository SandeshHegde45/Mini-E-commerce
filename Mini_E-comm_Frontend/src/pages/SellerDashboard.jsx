import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Info, Pencil, Store, Trash2 } from "lucide-react";

import { selectCurrentUser } from "@/features/auth/authSlice";
import {
  removeProduct,
  selectSellerProducts,
  upsertProduct,
} from "@/features/products/sellerProductsSlice";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "@/api/productApi";
import { ProductForm } from "@/components/seller/ProductForm";
import { DeleteProductDialog } from "@/components/seller/DeleteProductDialog";
import { EmptyState } from "@/components/EmptyState";
import { TooltipHint } from "@/components/TooltipHint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { formatPrice, getApiErrorMessage } from "@/utils/format";

export default function SellerDashboard() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const products = useSelector(selectSellerProducts(user.id));
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const formRef = useRef(null);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Returns true on success so the form knows whether to reset itself.
  async function handleSubmit(values) {
    try {
      const res = editing
        ? await updateProduct({ id: editing._id, ...values }).unwrap()
        : await createProduct(values).unwrap();
      dispatch(upsertProduct({ sellerId: user.id, product: res.data.product }));
      toast.success(editing ? "Product updated" : "Product added", res.data.product.title);
      setEditing(null);
      return true;
    } catch (error) {
      toast.error(editing ? "Couldn't save changes" : "Couldn't add product", getApiErrorMessage(error));
      return false;
    }
  }

  async function handleDelete() {
    try {
      await deleteProduct(deleting._id).unwrap();
      dispatch(removeProduct({ sellerId: user.id, productId: deleting._id }));
      toast.success("Product deleted", deleting.title);
      if (editing?._id === deleting._id) setEditing(null);
      setDeleting(null);
    } catch (error) {
      if (error?.status === 404) {
        dispatch(removeProduct({ sellerId: user.id, productId: deleting._id }));
        setDeleting(null);
      }
      toast.error("Couldn't delete product", getApiErrorMessage(error));
    }
  }

  function startEdit(product) {
    setEditing(product);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Seller dashboard</h1>
        <p className="mt-1 text-muted-foreground">Add products and keep your listings up to date.</p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[24rem_1fr]">
        <Card ref={formRef} className="scroll-mt-24">
          <CardHeader>
            <CardTitle>{editing ? "Edit product" : "Add a product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              product={editing}
              onSubmit={handleSubmit}
              submitting={isCreating || isUpdating}
              onCancel={() => setEditing(null)}
            />
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Your products</h2>
            <TooltipHint content="Lists products added or edited from this browser. The server has no seller-only product list.">
              <Button type="button" variant="ghost" size="icon-xs" aria-label="About this list">
                <Info />
              </Button>
            </TooltipHint>
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No products yet"
              description="Products you add here will appear in this list."
            />
          ) : (
            <ul className="space-y-3">
              {products.map((product) => (
                <li key={product._id}>
                  <Card className="flex-row gap-3 p-3 sm:gap-4 sm:p-4">
                  <img src={product.image?.[0]} alt={product.title} className="size-16 shrink-0 rounded-lg object-cover sm:size-20" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p className="truncate font-medium">{product.title}</p>
                    <p data-tabular className="text-sm text-muted-foreground">
                      {formatPrice(product.price.amount, product.price.currency)} · {product.stock} in stock
                    </p>
                    <Badge
                      variant={product.published ? "default" : "secondary"}
                      className={product.published ? "self-start bg-success/15 text-success" : "self-start"}
                    >
                      {product.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <TooltipHint content="Edit">
                      <Button variant="outline" size="icon" aria-label={`Edit ${product.title}`} onClick={() => startEdit(product)}>
                        <Pencil />
                      </Button>
                    </TooltipHint>
                    <TooltipHint content="Delete">
                      <Button variant="destructive" size="icon" aria-label={`Delete ${product.title}`} onClick={() => setDeleting(product)}>
                        <Trash2 />
                      </Button>
                    </TooltipHint>
                  </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <DeleteProductDialog
        product={deleting}
        deleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
