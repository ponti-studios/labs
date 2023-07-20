import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import auth from "./auth";

export const store = configureStore({
  reducer: {
    auth,
  },
});

export const getIsLoadingAuth = (state: RootState) => state.auth.isLoadingAuth;
export const getLoginEmail = (state: RootState) => state.auth.loginEmail;
export const getUser = (state: RootState) => state.auth.user;
export const getIsAuthenticated = (state: RootState) => !!state.auth.user;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
