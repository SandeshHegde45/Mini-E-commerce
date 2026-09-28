import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "basket-seller-products";

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function persist(bySeller) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bySeller));
  } catch {
    // storage unavailable — session-only fallback, nothing to do
  }
}

const sellerProductsSlice = createSlice({
  name: "sellerProducts",
  initialState: { bySeller: loadAll() },
  reducers: {
    upsertProduct(state, action) {
      const { sellerId, product } = action.payload;
      const list = state.bySeller[sellerId] || [];
      const idx = list.findIndex((p) => p._id === product._id);
      if (idx >= 0) list[idx] = product;
      else list.unshift(product);
      state.bySeller[sellerId] = list;
      persist(state.bySeller);
    },
    removeProduct(state, action) {
      const { sellerId, productId } = action.payload;
      state.bySeller[sellerId] = (state.bySeller[sellerId] || []).filter(
        (p) => p._id !== productId,
      );
      persist(state.bySeller);
    },
  },
});

export const { upsertProduct, removeProduct } = sellerProductsSlice.actions;
export default sellerProductsSlice.reducer;

export const selectSellerProducts = (sellerId) => (state) =>
  state.sellerProducts.bySeller[sellerId] || [];
