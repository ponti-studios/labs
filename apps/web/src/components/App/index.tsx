import Loading from "@hominem/components/Loading";
import React, { useEffect, useRef } from "react";
import { Route, Routes } from "react-router-dom";

import * as ROUTES from "src/constants/routes";
import Home from "src/scenes/Home";
import Login from "src/scenes/login";
import Authenticate from "src/scenes/login/scenes/authenticate";
import NotFound from "src/scenes/not-found";
import { loadAuth } from "src/services/auth";
import { useAuth } from "src/services/hooks";
import { useAppDispatch } from "src/services/store";

import AuthenticatedScenes from "./components/Authenticated";
import Footer from "./components/Footer";
import Header from "./components/Header";

function App() {
	const { isAuthenticated, status } = useAuth();
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (status === "unloaded") {
			dispatch(loadAuth());
		}
	}, [dispatch, status]);

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center max-w-[300px] mx-auto min-h-screen">
				<Loading size="xl" />
			</div>
		);
	}

	return (
		<div className="h-full w-full flex flex-col items-center">
			<div className="h-full w-full flex flex-col lg:max-w-[800px] sm:px-2 md:px-0">
				<Header />
				<main
					data-testid="app-main"
					className="flex flex-1 mt-8 w-full max-sm:pb-16"
				>
					{isAuthenticated ? (
						<AuthenticatedScenes />
					) : (
						<Routes>
							<Route path={ROUTES.AUTHENTICATE} element={<Authenticate />} />
							<Route path={ROUTES.LOGIN} element={<Login />} />
							<Route path={ROUTES.LANDING} element={<Home />} />
							<Route path={ROUTES.WILDCARD} element={<NotFound />} />
						</Routes>
					)}
				</main>
				{isAuthenticated && <Footer />}
			</div>
		</div>
	);
}

export default App;
