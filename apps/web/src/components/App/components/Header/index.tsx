import { Globe } from "lucide-react";
import { Link } from "react-router-dom";

import { APP_NAME } from "src/constants";
import { LANDING, LOGIN } from "src/constants/routes";
import { getIsAuthenticated } from "src/services/hooks";
import { useAppSelector } from "src/services/store";

import AuthNavMenu from "./AuthNavMenu";

function Header() {
	const isAuthenticated = useAppSelector(getIsAuthenticated);

	return (
		<header className="navbar flex flex-row justify-between items-center pt-4">
			<Link
				to={LANDING}
				className="flex flex-1 gap-2 items-center font-extrabold lowercase text-4xl"
			>
				<Globe className="animate-spin-slow mt-1 size-7 text-primary" />
				{APP_NAME}
			</Link>
			{isAuthenticated ? (
				<AuthNavMenu />
			) : (
				<Link to={LOGIN} className="btn btn-primary text-white">
					Log In
				</Link>
			)}
		</header>
	);
}

export default Header;
