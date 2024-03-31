/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore } from "@reduxjs/toolkit";
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
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
    preloadedState?: any;
    store?: any;
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
