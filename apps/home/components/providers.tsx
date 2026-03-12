"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import React from "react";

function Providers({ children }: React.PropsWithChildren) {
	const [client] = React.useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// Increase stale time for better performance with SSR
						staleTime: 1000 * 60 * 5, // 5 minutes
						// Enable background refetching
						refetchOnWindowFocus: false,
						refetchOnMount: false,
						// Use longer cache time for production
						gcTime: 1000 * 60 * 60, // 1 hour (was cacheTime)
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={client}>
			<ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
			{process.env.NODE_ENV === "development" && (
				<ReactQueryDevtools initialIsOpen={false} />
			)}
		</QueryClientProvider>
	);
}

export default Providers;
