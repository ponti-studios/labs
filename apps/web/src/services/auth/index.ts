import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  Reducer,
} from "@reduxjs/toolkit";

import api from "src/services/api";

import * as authApi from "./auth.api";

export type User = {
  id: string;
  avatar: string;
  email: string;
  name: string;
  isAdmin: string;
  createdAt: string;
  updatedAt: string;
};

export interface AuthState {
  isLoadingAuth?: boolean;
  authError: string | null;
  loginEmail: string | null;
  user?: User;
}

const initialState: AuthState = {
  authError: null,
  loginEmail: null,
};

export const loadAuth = createAsyncThunk("auth/load", async () => {
  const response = await api.get("/me");
  return response.data as User;
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
  return true;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setError(state, action: PayloadAction<string | null>) {
      state.authError = action.payload;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setCurrentEmail(state, action: PayloadAction<string | null>) {
      state.loginEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAuth.pending, (state) => {
        state.isLoadingAuth = true;
        state.authError = null;
      })
      .addCase(loadAuth.fulfilled, (state, action) => {
        state.isLoadingAuth = false;
        state.authError = null;
        state.user = action.payload;
      })
      .addCase(loadAuth.rejected, (state, action) => {
        state.isLoadingAuth = false;
        state.authError = action.error.message;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoadingAuth = false;
        state.authError = null;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoadingAuth = false;
        state.authError = action.error.message;
      });
  },
});

export const { setCurrentEmail, setUser } = authSlice.actions;
export default authSlice.reducer as Reducer<AuthState>;
