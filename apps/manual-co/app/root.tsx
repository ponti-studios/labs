import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import QueryProvider from "./components/QueryProvider";
import "./app.css";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<QueryProvider>
			<Outlet />
		</QueryProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let status = 500;
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		status = error.status;
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto min-h-screen flex items-center justify-center">
			<div className="max-w-md w-full text-center">
				<div className="mb-6">
					<div className="text-6xl font-bold text-red-500 mb-2">{status}</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">{message}</h1>
					<p className="text-gray-600">{details}</p>
				</div>

				<div className="flex gap-4 justify-center">
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Try Again
					</button>
					<a
						href="/"
						className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
					>
						Go Home
					</a>
				</div>

				{stack && import.meta.env.DEV && (
					<div className="mt-8 text-left">
						<details className="bg-gray-100 rounded-lg p-4">
							<summary className="font-semibold cursor-pointer">Stack Trace</summary>
							<pre className="mt-4 text-xs overflow-x-auto text-red-600">
								<code>{stack}</code>
							</pre>
						</details>
					</div>
				)}
			</div>
		</main>
	);
}
