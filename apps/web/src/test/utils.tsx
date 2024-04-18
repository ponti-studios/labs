import { configureStore } from "@reduxjs/toolkit";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { rootReducer } from "src/services/store";
import type { ListPlace } from "src/services/types";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
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

export const USER_ID = "user-id";

export function renderWithProviders(
	ui: ReactElement,
	{
		options,
		isAuth = false,
		preloadedState = isAuth
			? {
					auth: {
						user: {
							id: USER_ID,
						},
					},
				}
			: {},
		store = configureStore({ reducer: rootReducer, preloadedState }),
	}: {
		options?: RenderOptions;
		isAuth?: boolean;
		preloadedState?: { [key: string]: unknown };
		store?: typeof configureStore extends (...args: any[]) => infer R
			? R
			: never;
	} = {},
): ReturnType<typeof render> {
	const Providers: React.FC = ({ children }: { children: ReactNode }) => {
		return (
			<Provider store={store}>
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			</Provider>
		);
	};

	return render(ui, { wrapper: Providers, ...options });
}
