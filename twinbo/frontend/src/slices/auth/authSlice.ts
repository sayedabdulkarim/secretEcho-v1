import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  AuthState,
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../../types/auth";

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Registration failed");
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const user = localStorage.getItem("user");

      if (!token || !user) {
        return rejectWithValue("No authentication data found");
      }

      // Verify token with backend
      const response = await fetch("http://localhost:5001/api/auth/verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
        return rejectWithValue("Token verification failed");
      }

      return JSON.parse(user);
    } catch (error: any) {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      return rejectWithValue(error.message || "Authentication check failed");
    }
  }
);

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
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = action.payload;
        state.userDetails = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check auth cases
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = action.payload;
        state.userDetails = action.payload;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.userInfo = null;
        state.userDetails = null;
        state.error = action.payload as string;
      });
  },
});

export const { setCredentials, logoutUser, clearError } = authSlice.actions;

export default authSlice.reducer;
