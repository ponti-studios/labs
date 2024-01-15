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
    <header className="flex items-center justify-between py-4 max-md:px-2">
      <NavMenuItem>
        <Link
          to={LANDING}
          className="text-primary font-extrabold lowercase text-4xl"
        >
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
