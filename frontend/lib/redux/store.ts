import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import adminReducer from "./slices/adminSlice";
import adminProductReducer from "./slices/adminProductSlice";
import adminBannerReducer from './slices/adminBannerSlice';
import productReducer from './slices/productSlice';
import bannerReducer from './slices/bannerSlice';
import orderReducer from './slices/orderSlice';
import addressReducer from './slices/addressSlice';           
import notificationReducer from './slices/notificationSlice';
import adminOrderReducer from './slices/adminOrderSlice';
import couponReducer from './slices/couponSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    admin: adminReducer,
    adminProduct:adminProductReducer,
    adminBanner: adminBannerReducer,
    product:productReducer,
    banner:bannerReducer,
    order: orderReducer,          
    address: addressReducer,    
    notification: notificationReducer,
    adminOrder: adminOrderReducer,
    coupon: couponReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;