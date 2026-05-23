import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    searchQuery: '',
    activeCategory: null,   // e.g. 'SOFAS', 'BEDS', etc.
    isMobileMenuOpen: false,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveCategory: (state, action) => {
      // Toggle: clicking the active category in the products bar deselects it
      state.activeCategory =
        state.activeCategory === action.payload ? null : action.payload;
    },
    // Always sets (no toggle) — used when navigating from hero/external pages
    setCategoryDirect: (state, action) => {
      state.activeCategory = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
  },
});

export const { setSearchQuery, setActiveCategory, setCategoryDirect, toggleMobileMenu, closeMobileMenu } =
  uiSlice.actions;

// Selectors
export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectActiveCategory = (state) => state.ui.activeCategory;
export const selectIsMobileMenuOpen = (state) => state.ui.isMobileMenuOpen;

export default uiSlice.reducer;
