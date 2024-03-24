import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import auth from "./auth";
import { useAppDispatch, useAppSelector } from "./hooks";
import toastSlice from "./toast/toast.slice";

export const rootReducer = {
  auth,
  toast: toastSlice.reducer,
};

export const store = configureStore({
  reducer: rootReducer,
});

export const getIsLoadingAuth = (state: RootState) => state.auth.isLoadingAuth;
export const getLoginEmail = (state: RootState) => state.auth.loginEmail;
export const getIsAuthenticated = (state: RootState) => !!state.auth.user;

export const useAuth = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const isLoadingAuth = useAppSelector(getIsLoadingAuth);
  const loginEmail = useAppSelector(getLoginEmail);
  const dispatch = useAppDispatch();
  return {
    user,
    isLoadingAuth,
    loginEmail,
    dispatch,
  };
};

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
