import { configureStore } from "@reduxjs/toolkit";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { rootReducer } from "src/services/store";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

const defaultAuthState = {
	auth: {
		user: {
			id: "1",
		},
	},
};

export function renderWithProviders(
	ui: ReactElement,
	{
		options,
		isAuth = false,
		preloadedState = isAuth ? defaultAuthState : {},
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
