import { GlobeIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";

import { APP_NAME } from "src/constants";
import { LANDING, LOGIN } from "src/constants/routes";
import { useAppSelector } from "src/services/hooks";
import { getIsAuthenticated } from "src/services/store";

import AuthNavMenu from "./AuthNavMenu";
import NavMenuItem from "./NavMenuItem";

function Header() {
  const isAuthenticated = useAppSelector(getIsAuthenticated);

  return (
    <header className="navbar flex flex-row justify-between items-center border-b py-4">
      <NavMenuItem>
        <Link
          to={LANDING}
          className="flex gap-2 items-center font-extrabold lowercase text-4xl"
        >
          <GlobeIcon className="animate-spin-slow mt-1 h-7 w-7 text-primary" />
          {APP_NAME}
        </Link>
      </NavMenuItem>
      {isAuthenticated ? (
        <AuthNavMenu />
      ) : (
        <NavMenuItem>
          <Link to={LOGIN} className="btn btn-primary text-white">
            Log In
          </Link>
        </NavMenuItem>
      )}
    </header>
  );
}

export default Header;
