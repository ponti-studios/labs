import { useEffect, useRef } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "ui/Loading";

import * as ROUTES from "src/constants/routes";
import Authenticate from "src/scenes/login/scenes/authenticate";
import Home from "src/scenes/Home";
import Login from "src/scenes/login";
import NotFound from "src/scenes/not-found";
import { loadAuth } from "src/services/auth";
import { useAppDispatch, useAppSelector } from "src/services/hooks";
import { getIsAuthenticated, getIsLoadingAuth } from "src/services/store";

import Header from "./components/Header";
import AuthenticatedScenes from "./components/Authenticated";

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
  }, []); // eslint-disable-line

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center max-w-[300px] mx-auto min-h-screen">
        <Loading size="xl" />
      </div>
    );
  }

  return (
    <div id="app" className="h-full w-full flex flex-col">
      <Header />
      <main className="flex flex-1 mt-8" data-testid="app-main">
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
    </div>
  );
}

export default App;
