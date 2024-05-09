import Loading from "@hominem/components/Loading";
import React from "react";
import { Outlet } from "react-router-dom";

import Footer from "src/components/Footer";
import Header from "src/components/Header";
import Toast from "src/components/Toast";
import { useAuth } from "src/lib/auth";
import { AuthStatus } from "src/lib/auth/types";

export default function Layout() {
	const { status } = useAuth();
	const isAuthenticated = status === AuthStatus.Authenticated;

	return (
		<div className="h-full w-full flex flex-col items-center">
			<div className="h-full w-full flex flex-col sm:max-w-3xl px-2">
				<Header />
				<main
					data-testid="app-main"
					className="flex flex-1 mt-8 w-full max-sm:pb-16"
				>
					{status === "loading" ? (
						<div className="flex items-center justify-center max-w-[300px] mx-auto min-h-screen">
							<Loading size="xl" />
						</div>
					) : (
						<Outlet />
					)}
					<Toast />
				</main>
				{isAuthenticated && <Footer />}
			</div>
		</div>
	);
}
