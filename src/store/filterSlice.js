import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  category:  '',   // category name e.g. 'chair'
  search:    '',   // committed search string (only set on submit/debounce resolve)
  brand:     '',
  color:     '',
  locality:  '',
  minPrice:  '',
  maxPrice:  '',
  ordering:  '',   // '' | 'price_per_day' | '-price_per_day' | '-created_at'
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      // Toggle off if same category clicked again
      state.category = state.category === action.payload ? '' : action.payload;
    },
    setCategoryDirect: (state, action) => {
      // Always set (used when navigating from hero/external pages)
      state.category = action.payload ?? '';
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setBrand: (state, action) => {
      state.brand = action.payload;
    },
    setColor: (state, action) => {
      state.color = state.color === action.payload ? '' : action.payload;
    },
    setLocality: (state, action) => {
      state.locality = action.payload;
    },
    setMinPrice: (state, action) => {
      state.minPrice = action.payload;
    },
    setMaxPrice: (state, action) => {
      state.maxPrice = action.payload;
    },
    setOrdering: (state, action) => {
      state.ordering = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setCategory,
  setCategoryDirect,
  setSearch,
  setBrand,
  setColor,
  setLocality,
  setMinPrice,
  setMaxPrice,
  setOrdering,
  resetFilters,
} = filterSlice.actions;

// ─── Selectors ─────────────────────────────────────────────────────────────────
export const selectFilters   = (state) => state.filters;
export const selectCategory  = (state) => state.filters.category;
export const selectSearch    = (state) => state.filters.search;
export const selectOrdering  = (state) => state.filters.ordering;

/**
 * Derives the clean API params object from Redux filter state.
 * - Skips empty strings / null / undefined
 * - Normalizes strings to lowercase
 */
export const selectApiParams = (state) => {
  const f = state.filters;
  const params = {};
  if (f.category)  params.category  = f.category.toLowerCase();
  if (f.search)    params.search    = f.search.trim();
  if (f.brand)     params.brand_name = f.brand.trim().toLowerCase();
  if (f.color)     params.color     = f.color.toLowerCase();
  if (f.locality)  params.locality  = f.locality.trim();
  if (f.minPrice)  params.min_price = f.minPrice;
  if (f.maxPrice)  params.max_price = f.maxPrice;
  if (f.ordering)  params.ordering  = f.ordering;
  return params;
};

export default filterSlice.reducer;
