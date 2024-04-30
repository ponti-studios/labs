import { configureStore } from "@reduxjs/toolkit";
import { type RenderOptions, render } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { AuthStatus, type User } from "src/services/auth";
import { rootReducer } from "src/services/store";
import type { ListPlace } from "src/services/types";

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
		preloadedState: {
			auth: {
				currentLocation: null,
				isLoadingAuth: false,
				authError: null,
				loginEmail: null,
				status: AuthStatus.Unloaded,
				user: isAuth ? getMockUser() : null,
				...authOptions,
			},
		},
	});

export const useAuthMock = ({
	isAuth = false,
}: { isAuth?: boolean }): {
	dispatch: ReturnType<typeof getMockStore>["dispatch"];
	user: User | null;
	isAuthenticated: boolean;
	isLoadingAuth: boolean;
	loginEmail: string | null;
	status: AuthStatus;
} => ({
	dispatch: getMockStore({ isAuth }).dispatch,
	user: isAuth ? getMockUser() : null,
	isAuthenticated: isAuth,
	isLoadingAuth: false,
	loginEmail: null,
	status: isAuth ? AuthStatus.Authenticated : AuthStatus.Unauthenticated,
});

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
