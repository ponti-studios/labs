import type { UseMutationResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type { User } from "src/lib/types";

export type CurrentLocation = {
	latitude: number;
	longitude: number;
};

export enum AuthStatus {
	Unloaded = "unloaded",
	Loading = "loading",
	Authenticated = "authenticated",
	Unauthenticated = "unauthenticated",
	Error = "error",
}

export type AuthenticatePayload = {
	email: string;
	emailToken: string;
};

export type LoginPayload = {
	email: string;
};

export interface AuthState {
	currentLocation: CurrentLocation;
	isLoadingAuth?: boolean;
	authError: string | null;
	loginEmail: string | null;
	status: AuthStatus;
	user?: User;
	authenticate?: UseMutationResult<
		void,
		AxiosError,
		AuthenticatePayload,
		unknown
	>;
	login?: UseMutationResult<void, AxiosError, LoginPayload, unknown>;
	logout?: UseMutationResult<void, AxiosError, void, unknown>;
	setCurrentLocation?: (location: CurrentLocation) => void;
}
