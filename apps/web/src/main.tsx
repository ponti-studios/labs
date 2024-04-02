import { APIProvider } from "@vis.gl/react-google-maps";
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";

import * as Spotlight from "@spotlightjs/spotlight";
import App from "./components/App";
import "./index.css";
import { store } from "./services/store";

// only load Spotlight in dev
if (process.env.NODE_ENV === "development") {
	Spotlight.init();
}

const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
	<React.StrictMode>
		<Router>
			<Provider store={store}>
				<QueryClientProvider client={queryClient}>
					<APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
						<App />
					</APIProvider>
				</QueryClientProvider>
			</Provider>
		</Router>
	</React.StrictMode>,
);
