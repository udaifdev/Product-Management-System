// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slice/authSlice.js';
import wishlistReducer from './slice/wishlistSlice.js';


const store = configureStore({
    reducer: {
        auth: authReducer,  
        wishlist: wishlistReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: ['persist/PERSIST'],
        },
    }),
    devTools: process.env.NODE_ENV !== 'production'
});

export default store;