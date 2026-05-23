import { configureStore } from '@reduxjs/toolkit';
import authReducer   from './authSlice';
import cartReducer   from './cartSlice';
import uiReducer     from './uiSlice';
import filterReducer from './filterSlice';

const store = configureStore({
  reducer: {
    auth:    authReducer,
    cart:    cartReducer,
    ui:      uiReducer,
    filters: filterReducer,
  },
});

export default store;
