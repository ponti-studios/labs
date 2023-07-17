import { useLoadScript } from "@react-google-maps/api";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "ui/Loading";

import {
  ACCOUNT_PATH,
  AUTHENTICATE_PATH,
  DASHBOARD_PATH,
  LANDING_PATH,
  LOGIN_PATH,
  WILDCARD_PATH,
} from "src/constants/routes";
import Account from "src/scenes/Account";
import Authenticate from "src/scenes/Authenticate";
import Dashboard from "src/scenes/Dashboard";
import Home from "src/scenes/Home";
import Login from "src/scenes/Login";
import NotFound from "src/scenes/NotFound";
import {
  getIsLoadingAuth,
  loadAuth,
  getUser,
  getIsAuthenticated,
} from "src/services/auth";
import { useAppDispatch, useAppSelector } from "src/services/hooks";

import Header from "./components/Header";
import styles from "./App.module.scss";

const { VITE_GOOGLE_API_KEY } = import.meta.env;

const LIBRARIES = ["places"];

function App() {
  const isLoadingAuth = useAppSelector(getIsLoadingAuth);
  const isAuthenticated = useAppSelector(getIsAuthenticated);
  const dispatch = useAppDispatch();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: VITE_GOOGLE_API_KEY,
    libraries: LIBRARIES as any, // eslint-disable-line
  });

  useEffect(() => {
    console.log("App: loadAuth");
    dispatch(loadAuth());
  });

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center max-w-[300px] mx-auto min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div id="app" className={`h-100 flex flex-col ${styles.wrap}`}>
      <Header />
      <main className="flex mt-8" style={{ height: "85vh" }}>
        <Routes>
          <Route path={AUTHENTICATE_PATH} element={<Authenticate />} />
          {!isAuthenticated && <Route path={LOGIN_PATH} element={<Login />} />}
          {isAuthenticated && (
            <>
              <Route
                path={DASHBOARD_PATH}
                element={<Dashboard isMapLoaded={isLoaded} />}
              />
              <Route path={ACCOUNT_PATH} element={<Account />} />
            </>
          )}
          <Route path={LANDING_PATH} element={<Home />} />
          <Route path={WILDCARD_PATH} element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
