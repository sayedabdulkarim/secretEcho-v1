import { createSlice } from "@reduxjs/toolkit";
import { AuthState } from "../../types/auth";

// Define initial state
const initialState: AuthState = {
  userInfo: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  userDetails: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      state.userDetails = action.payload;
      state.error = null;
      localStorage.setItem("user", JSON.stringify(action.payload));
      localStorage.setItem("jwtToken", action.payload.token);
    },
    logoutUser: (state) => {
      state.userInfo = null;
      state.userDetails = null;
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("jwtToken");
      // Optional: redirect to login page
      // window.location.pathname = "/login";
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logoutUser, clearError, setLoading, setError } =
  authSlice.actions;

export default authSlice.reducer;
