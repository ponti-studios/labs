import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { createContext, useContext, useEffect, useReducer } from "react";

import api from "src/lib/api";
import { type AuthState, AuthStatus } from "./types";

const initialAuthState: AuthState = {
	authError: null,
	currentLocation: { latitude: 37.7749, longitude: -122.4194 }, // Default center (San Francisco)
	loginEmail: null,
	status: AuthStatus.Unloaded,
};

export const AuthContext = createContext<AuthState>(initialAuthState);

const authReducer = (state: AuthState, action: any): AuthState => {
	switch (action.type) {
		case "auth/setCurrentLocation":
			return {
				...state,
				currentLocation: action.payload,
			};
		case "auth/login":
			return {
				...state,
				status: AuthStatus.Loading,
				loginEmail: action.payload.email,
				authError: null,
			};
		case "auth/authenticate":
			return {
				...state,
				status: AuthStatus.Loading,
				authError: null,
			};
		case "auth/authenticated":
			return {
				...state,
				status: AuthStatus.Authenticated,
				authError: null,
				user: action.payload,
			};
		case "auth/error":
			return {
				...state,
				status: AuthStatus.Error,
				authError: action.payload,
			};
		case "auth/load":
			return {
				...state,
				status: AuthStatus.Loading,
				authError: null,
			};
		case "auth/logout":
			return {
				...state,
				status: AuthStatus.Unauthenticated,
				user: null,
			};
		default:
			return state;
	}
};

export const AuthProvider = ({ children }) => {
	const [authState, dispatch] = useReducer(authReducer, initialAuthState);

	useEffect(() => {
		async function loadAuth() {
			try {
				const response = await api.get("/me");

				if (!response.data || !response.data.id) {
					throw new Error("User not found");
				}

				dispatch({ type: "auth/authenticated", payload: response.data });
			} catch (error) {
				dispatch({ type: "auth/error", payload: error.message });
			}
		}

		loadAuth();
	}, []);

	const login: AuthState["login"] = useMutation({
		mutationFn: async ({ email }) => {
			await api.post("/login", { email }, { withCredentials: false });
			dispatch({ type: "auth/login", payload: { email } });
		},
	});

	const authenticate: AuthState["authenticate"] = useMutation({
		mutationFn: async ({ email, emailToken }) => {
			try {
				dispatch({ type: "auth/authenticate" });
				await api.post("/authenticate", { email, emailToken });
				dispatch({ type: "auth/load" });
			} catch (error) {
				dispatch({ type: "auth/error", payload: error.message });
			}
		},
	});

	const logout: AuthState["logout"] = useMutation({
		mutationFn: async () => {
			try {
				await api.post("/logout", {});
				dispatch({ type: "auth/logout" });
			} catch (error) {
				console.error("Error logging out", error);
				dispatch({ type: "auth/error", payload: error.message });
			}
		},
	});

	return (
		<AuthContext.Provider
			value={{
				authenticate,
				login,
				logout,
				setCurrentLocation: ({ latitude, longitude }) => {
					dispatch({
						type: "auth/setCurrentLocation",
						payload: { latitude, longitude },
					});
				},
				...authState,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within a AuthProvider");
	}
	return context;
};
