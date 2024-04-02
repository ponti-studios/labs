import { useCallback, useEffect, useRef } from "react";
import {
	type TypedUseSelectorHook,
	useDispatch,
	useSelector,
} from "react-redux";

import type { AppDispatch, RootState } from "./store";

// Use throughout client application instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useMountedState = () => {
	const isMountedRef = useRef<boolean>(false);
	const isMounted = useCallback(() => isMountedRef.current, []);

	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	return isMounted;
};
