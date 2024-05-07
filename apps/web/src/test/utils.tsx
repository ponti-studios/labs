import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { type Mock, beforeEach, vi } from "vitest";

import { useAuth } from "src/lib/auth";
import type { AuthState } from "src/lib/auth/types";
import { rootReducer } from "src/lib/store";
import type { ListPlace, User } from "src/lib/types";

vi.mock("src/lib/auth", (importOriginal) => {
	const original = importOriginal as unknown as typeof import("src/lib/auth");
	return {
		...original,
		useAuth: vi.fn(),
	};
});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

export const USER_ID = "user-id";
export const TEST_USER_EMAIL = "test-user@ponti.io";
export const TEST_USER_NAME = "Test User";

export const getMockUser = (): User => ({
	id: USER_ID,
	avatar: "https://example.com/avatar.jpg",
	email: TEST_USER_EMAIL,
	createdAt: "2021-01-01T00:00:00.000Z",
	updatedAt: "2021-01-01T00:00:00.000Z",
	isAdmin: "false",
	name: TEST_USER_NAME,
});

export const getMockPlace = (): ListPlace => ({
	imageUrl: "https://example.com/image.jpg",
	googleMapsId: "123",
	name: "Place Name",
	types: ["type1", "type2"],
	id: "123",
	itemId: "123",
	description: "Description",
});

export const getMockLists = () => [
	{
		id: "1",
		name: "List 1",
		createdAt: "2021-01-01T00:00:00.000Z",
		updatedAt: "2021-01-01T00:00:00.000Z",
		createdBy: getMockUser(),
		places: [getMockPlace()],
	},
	{
		id: "2",
		name: "List 2",
		createdAt: "2021-01-01T00:00:00.000Z",
		updatedAt: "2021-01-01T00:00:00.000Z",
		createdBy: getMockUser(),
		places: [getMockPlace()],
	},
];

export const getMockStore = ({ isAuth, authOptions = {} }) =>
	configureStore({
		reducer: rootReducer,
		preloadedState: {},
	});

export const loginMock = {
	mutateAsync: vi.fn().mockResolvedValue(null),
};

export const logoutMock = {
	mutateAsync: vi.fn().mockResolvedValue(null),
};

export const useAuthMock = ({
	isAuth = false,
}: { isAuth?: boolean }): AuthState => ({
	authError: null,
	currentLocation: { latitude: 37.7749, longitude: -122.4194 },
	user: isAuth ? getMockUser() : null,
	isLoadingAuth: false,
	loginEmail: null,
	status: (isAuth ? "authenticated" : "unauthenticated") as any,
	login: loginMock as any,
	logout: logoutMock as any,
});

export function mockUseAuth(isAuth = false) {
	(useAuth as Mock).mockReturnValue(useAuthMock({ isAuth }));
}

export const TestProviders = ({
	children,
	initialEntries = ["/"],
	isAuth = false,
	store,
}: PropsWithChildren<{
	initialEntries?: string[];
	isAuth?: boolean;
	store?: ReturnType<typeof configureStore>;
}>) => {
	return (
		<MemoryRouter initialEntries={initialEntries}>
			<Provider store={store || getMockStore({ isAuth })}>
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			</Provider>
		</MemoryRouter>
	);
};

export function renderWithProviders(
	ui: ReactElement,
	{
		options,
		isAuth = false,
	}: {
		options?: RenderOptions;
		isAuth?: boolean;
	} = {},
): ReturnType<typeof render> {
	return render(ui, {
		wrapper: ({ children }) => (
			<TestProviders isAuth={isAuth}>{children}</TestProviders>
		),
		...options,
	});
}

beforeEach(() => {
	(useAuth as Mock).mockReturnValue(useAuthMock({ isAuth: false }));
});
