import { apiSlice } from "@/api/apiSlice";

function toProductFormData(product) {
  const formData = new FormData();
  formData.append("title", product.title);
  formData.append("description", product.description);
  formData.append("priceAmount", product.priceAmount);
  formData.append("currency", product.currency || "INR");
  formData.append("stock", product.stock ?? 0);
  formData.append("published", String(Boolean(product.published)));
  if (product.image instanceof File) {
    formData.append("image", product.image);
  }
  return formData;
}

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ page = 1, limit = 12 } = {}) => `/products?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result?.data?.products
          ? [
              ...result.data.products.map((p) => ({ type: "Product", id: p._id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation({
      query: (product) => ({
        url: "/products",
        method: "POST",
        body: toProductFormData(product),
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...product }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: toProductFormData(product),
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
