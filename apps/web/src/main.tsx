import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APIProvider } from "@vis.gl/react-google-maps";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";

import "./index.css";
import App from "./layout";
import { AuthProvider } from "./lib/auth";
import { store } from "./lib/store";

const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
	<React.StrictMode>
		<Router>
			<Provider store={store}>
				<QueryClientProvider client={queryClient}>
					<APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
						<AuthProvider>
							<App />
						</AuthProvider>
					</APIProvider>
				</QueryClientProvider>
			</Provider>
		</Router>
	</React.StrictMode>,
);
