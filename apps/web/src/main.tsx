import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APIProvider } from "@vis.gl/react-google-maps";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { AuthProvider } from "src/lib/auth";
import { store } from "src/lib/store";
import * as ROUTES from "src/lib/utils/routes";
import Authenticate from "src/scenes/authenticate";
import LandingPage from "src/scenes/index";
import Login from "src/scenes/login";
import NotFound from "src/scenes/not-found";
import "./index.css";
import Layout from "./layout";

const authRouter = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{ path: ROUTES.LANDING, element: <LandingPage /> },
			{ path: ROUTES.LOGIN, element: <Login /> },
			{ path: ROUTES.WILDCARD, element: <NotFound /> },
			{ path: ROUTES.AUTHENTICATE, element: <Authenticate /> },
			{ path: ROUTES.DASHBOARD, lazy: () => import("./scenes/dashboard") },
			{ path: ROUTES.ACCOUNT, lazy: () => import("./scenes/account") },
			{ path: ROUTES.INVITES, lazy: () => import("./scenes/invites") },
			{ path: ROUTES.LISTS, lazy: () => import("./scenes/lists") },
			{ path: ROUTES.LIST, lazy: () => import("./scenes/lists/list") },
			{
				path: ROUTES.LIST_INVITE,
				lazy: () => import("./scenes/lists/list/invites"),
			},
			{ path: ROUTES.PLACE, lazy: () => import("./scenes/place") },
			{ path: ROUTES.WILDCARD, element: <NotFound /> },
		],
	},
]);

const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
					<AuthProvider>
						<RouterProvider router={authRouter} />
					</AuthProvider>
				</APIProvider>
			</QueryClientProvider>
		</Provider>
	</React.StrictMode>,
);
