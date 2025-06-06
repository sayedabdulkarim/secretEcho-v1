import { configureStore } from "@reduxjs/toolkit";
//reducers
import { apiSlice } from "./slices/apiSlice";
import authReducer from "./slices/auth/authSlice";

const store = configureStore({
  reducer: {
    authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  //on production change it to false
  devTools: process.env.NODE_ENV === "development",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
