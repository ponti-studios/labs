import { Route, Routes } from "react-router-dom";
import Loading from "ui/Loading";

import {
  ACCOUNT_PATH,
  AUTHENTICATE_PATH,
  LANDING_PATH,
  LOGIN_PATH,
  WILDCARD_PATH,
} from "src/constants/routes";
import Authenticate from "src/scenes/Authenticate";
import Home from "src/scenes/Home";
import Login from "src/scenes/Login";
import NotFound from "src/scenes/NotFound";
import Account from "src/scenes/Account";
import { useAccount } from "src/services/hooks";

import Header from "./components/Header";
import styles from "./App.module.scss";

function App() {
  const { account, loading } = useAccount();

  if (loading) {
    return (
      <div className="flex items-center justify-center max-w-[300px] mx-auto min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div id="app" className={`h-100 flex flex-col ${styles.wrap}`}>
      <Header />
      <main className="flex mt-8">
        <Routes>
          <Route path={AUTHENTICATE_PATH} element={<Authenticate />} />
          {!account && <Route path={LOGIN_PATH} element={<Login />} />}
          {account && <Route path={ACCOUNT_PATH} element={<Account />} />}
          <Route path={LANDING_PATH} element={<Home />} />
          <Route path={WILDCARD_PATH} element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
