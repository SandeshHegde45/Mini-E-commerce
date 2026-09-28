import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ImagePlus } from "lucide-react";

import { LoadingButton } from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

const MAX_IMAGE_BYTES = 1024 * 1024; // matches the server's 1 MB upload limit

const emptyValues = {
  title: "",
  description: "",
  priceAmount: "",
  currency: "INR",
  stock: 0,
  published: true,
  image: null,
};

export function ProductForm({ product, onSubmit, submitting, onCancel }) {
  const isEditing = Boolean(product);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ defaultValues: emptyValues });

  useEffect(() => {
    reset(
      product
        ? {
            title: product.title,
            description: product.description,
            priceAmount: product.price.amount,
            currency: product.price.currency,
            stock: product.stock,
            published: product.published,
            image: null,
          }
        : emptyValues,
    );
  }, [product, reset]);

  const file = useWatch({ control, name: "image" })?.[0];
  const localPreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => localPreview && URL.revokeObjectURL(localPreview), [localPreview]);
  const previewUrl = localPreview || product?.image?.[0];

  async function submit(values) {
    const succeeded = await onSubmit({ ...values, image: values.image?.[0] });
    if (succeeded && !isEditing) reset(emptyValues);
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.title)}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            aria-invalid={Boolean(errors.title)}
            {...register("title", {
              required: "Enter a title",
              minLength: { value: 2, message: "Title must be at least 2 characters" },
              maxLength: { value: 100, message: "Title must be 100 characters or fewer" },
            })}
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field data-invalid={Boolean(errors.description)}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            rows={4}
            aria-invalid={Boolean(errors.description)}
            {...register("description", {
              required: "Enter a description",
              minLength: { value: 20, message: "Description must be at least 20 characters" },
              maxLength: { value: 500, message: "Description must be 500 characters or fewer" },
            })}
          />
          <FieldError errors={[errors.description]} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={Boolean(errors.priceAmount)}>
            <FieldLabel htmlFor="priceAmount">Price</FieldLabel>
            <Input
              id="priceAmount"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              aria-invalid={Boolean(errors.priceAmount)}
              {...register("priceAmount", {
                required: "Enter a price",
                min: { value: 0, message: "Price can't be negative" },
              })}
            />
            <FieldError errors={[errors.priceAmount]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="currency">Currency</FieldLabel>
            <NativeSelect id="currency" className="w-full" {...register("currency")}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </NativeSelect>
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.stock)}>
          <FieldLabel htmlFor="stock">Stock</FieldLabel>
          <Input
            id="stock"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            aria-invalid={Boolean(errors.stock)}
            {...register("stock", {
              required: "Enter the stock count",
              min: { value: 0, message: "Stock can't be negative" },
            })}
          />
          <FieldError errors={[errors.stock]} />
        </Field>

        <Field data-invalid={Boolean(errors.image)}>
          <FieldLabel htmlFor="image">Image</FieldLabel>
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted">
              {previewUrl ? (
                <img src={previewUrl} alt="Product preview" className="size-full object-cover" />
              ) : (
                <ImagePlus className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Input
                id="image"
                type="file"
                accept="image/*"
                aria-invalid={Boolean(errors.image)}
                {...register("image", {
                  validate: (files) => {
                    const f = files?.[0];
                    if (!f) return isEditing || "Choose a product image";
                    return f.size <= MAX_IMAGE_BYTES || "Image must be 1 MB or smaller";
                  },
                })}
              />
            </div>
          </div>
          {isEditing && !file && <FieldDescription>Leave empty to keep the current image.</FieldDescription>}
          <FieldError errors={[errors.image]} />
        </Field>

        <Field orientation="horizontal">
          <Controller
            name="published"
            control={control}
            render={({ field }) => (
              <Checkbox id="published" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <FieldLabel htmlFor="published" className="font-normal">
            Publish so shoppers can see it
          </FieldLabel>
        </Field>

        <div className="flex gap-3">
          <LoadingButton type="submit" size="lg" loading={submitting} className="flex-1 sm:flex-none">
            {isEditing ? "Save changes" : "Add product"}
          </LoadingButton>
          {isEditing && (
            <Button type="button" variant="outline" size="lg" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
