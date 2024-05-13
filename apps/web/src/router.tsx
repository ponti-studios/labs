import { RouterProvider, createBrowserRouter } from "react-router-dom";

import * as ROUTES from "src/lib/routes";
import Authenticate from "src/scenes/authenticate";
import LandingPage from "src/scenes/index";
import Login from "src/scenes/login";
import NotFound from "src/scenes/not-found";
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

export const Router = () => <RouterProvider router={authRouter} />;
