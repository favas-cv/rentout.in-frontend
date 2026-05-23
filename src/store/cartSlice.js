import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalCount: 0,
  isLoading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : (action.payload?.items || []);
      state.items = items;
      state.totalCount = items.length;
    },
    addItem: (state, action) => {
      const newItem = action.payload;
      const newItemProductId = newItem.product?.id || newItem.product_id;
      
      const exists = state.items.find((i) => {
        const existingProductId = i.product?.id || i.product_id;
        return i.id === newItem.id || existingProductId === newItemProductId;
      });

      if (!exists) {
        state.items.push(newItem);
        state.totalCount = state.items.length;
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.totalCount = state.items.length;
    },
    clearCartItems: (state) => {
      state.items = [];
      state.totalCount = 0;
    },
    setCartLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { 
  setCartItems, 
  addItem, 
  removeItem, 
  clearCartItems, 
  setCartLoading 
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.totalCount;

/**
 * Calculates totals for the OrderSummary.
 * Handles nested product pricing: item.product.price_per_day
 */
export const selectCartTotals = (state) => {
  const items = state.cart.items;
  const rent = items.reduce((sum, item) => sum + (item.product?.price_per_day || 0) * (item.quantity || 1), 0);
  const deposit = items.reduce((sum, item) => sum + (item.product?.security_deposit || 0) * (item.quantity || 1), 0);
  const minTotal = items.reduce((sum, item) => {
    const minDays = item.product?.min_rental_days || 1;
    const dayRent = item.product?.price_per_day || 0;
    const dep = item.product?.security_deposit || 0;
    return sum + ((minDays * dayRent) + dep) * (item.quantity || 1);
  }, 0);
  const total = rent + deposit;
  
  return { rent, deposit, total, minTotal };
};

export default cartSlice.reducer;
