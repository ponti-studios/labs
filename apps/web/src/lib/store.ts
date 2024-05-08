import {
	type Action,
	type ThunkAction,
	configureStore,
} from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { toastSlice } from "./toast";

export const rootReducer = {
	toast: toastSlice.reducer,
};

export const store = configureStore({
	reducer: rootReducer,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action<string>
>;

// Use throughout client application instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
