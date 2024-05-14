import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import { http, HttpResponse } from "msw";
import { baseURL } from "src/lib/api/base";
import { AuthProvider } from "src/lib/auth";
import { rootReducer } from "src/lib/store";
import type { ListPlace, User } from "src/lib/types";
import { testServer } from "./test.setup";

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

export const loginMock = {
	mutateAsync: vi.fn().mockResolvedValue(null),
};

export const logoutMock = {
	mutateAsync: vi.fn().mockResolvedValue(null),
};

type TestProviderProps = {
	initialEntries?: string[];
	isAuth?: boolean;
	store?: ReturnType<typeof configureStore>;
};
export const TestProviders = ({
	children,
	initialEntries = ["/"],
	isAuth = false,
	store,
}: PropsWithChildren<TestProviderProps>) => {
	testServer.use(
		http.get(`${baseURL}/me`, () => {
			return isAuth
				? HttpResponse.json(getMockUser())
				: HttpResponse.text("Unauthorized", { status: 401 });
		}),
	);

	return (
		<MemoryRouter initialEntries={initialEntries}>
			<Provider
				store={
					store ||
					configureStore({
						reducer: rootReducer,
						preloadedState: {},
					})
				}
			>
				<QueryClientProvider client={queryClient}>
					<AuthProvider>{children}</AuthProvider>
				</QueryClientProvider>
			</Provider>
		</MemoryRouter>
	);
};

export function renderWithProviders(
	ui: ReactElement,
	{
		options,
		...props
	}: TestProviderProps & {
		options?: RenderOptions;
	} = {},
): ReturnType<typeof render> {
	return render(ui, {
		wrapper: ({ children }) => (
			<TestProviders {...props}>{children}</TestProviders>
		),
		...options,
	});
}
