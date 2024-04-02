import { useEffect, useRef } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "ui/Loading";

import * as ROUTES from "src/constants/routes";
import Home from "src/scenes/Home";
import Login from "src/scenes/login";
import Authenticate from "src/scenes/login/scenes/authenticate";
import NotFound from "src/scenes/not-found";
import { loadAuth } from "src/services/auth";
import { useAppDispatch, useAppSelector } from "src/services/hooks";
import { getIsAuthenticated, getIsLoadingAuth } from "src/services/store";

import AuthenticatedScenes from "./components/Authenticated";
import Footer from "./components/Footer";
import Header from "./components/Header";

function App() {
	const authRef = useRef<boolean>(false);
	const isLoadingAuth = useAppSelector(getIsLoadingAuth);
	const isAuthenticated = useAppSelector(getIsAuthenticated);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (authRef.current === false) {
			authRef.current = true;
			dispatch(loadAuth());
		}
	}, [dispatch]);

	if (isLoadingAuth) {
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
					className="flex flex-1 mt-8 w-full max-sm:pb-16"
					data-testid="app-main"
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
