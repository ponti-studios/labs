import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import * as authApi from "./auth.api";
import { User } from "./auth.types";

export interface AuthState {
  isLoadingAuth: boolean;
  authError: string | null;
  loginEmail: string | null;
  user?: User;
}

const initialState: AuthState = {
  isLoadingAuth: true,
  authError: null,
  loginEmail: null,
};

export const loadAuth = createAsyncThunk("auth/load", async () => {
  const response = await authApi.getUser();
  return response.data as User;
});

export const logout = createAsyncThunk("auth/logout", authApi.logout);

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
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoadingAuth = false;
        state.authError = null;
        state.user = undefined;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoadingAuth = false;
        state.authError = action.error.message;
      });
  },
});

export const getIsLoadingAuth = (state: RootState) => state.auth.isLoadingAuth;
export const getLoginEmail = (state: RootState) => state.auth.loginEmail;
export const getUser = (state: RootState) => state.auth.user;
export const getIsAuthenticated = (state: RootState) => !!state.auth.user;

export const { setCurrentEmail, setUser } = authSlice.actions;
export default authSlice.reducer;
