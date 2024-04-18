import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import {
	type RootState,
	useAppDispatch,
	useAppSelector,
} from "src/services/store";

export type ToastMessage = {
	text: string;
	type: string;
};

const toastSlice = createSlice({
	name: "toast",
	initialState: {
		isOpen: false,
		messages: [],
	},
	reducers: {
		openToast(state, action: PayloadAction<ToastMessage>) {
			state.isOpen = true;
			state.messages.push(action.payload);
		},
		closeToast(state) {
			state.isOpen = false;
			state.messages = [];
		},
	},
});

export const useToast = () => {
	const isOpen = useAppSelector((state: RootState) => state.toast.isOpen);
	const messages = useAppSelector<ToastMessage[]>(
		(state: RootState) => state.toast.messages,
	);
	const dispatch = useAppDispatch();

	const openToast = (message: ToastMessage) => {
		dispatch(toastSlice.actions.openToast(message));
		// Set a timeout to close the toast automatically
		setTimeout(() => {
			dispatch(toastSlice.actions.closeToast());
		}, 3000);
	};

	return {
		isOpen,
		messages,
		openToast,
		closeToast: () => dispatch(toastSlice.actions.closeToast()),
	};
};

export default toastSlice;
