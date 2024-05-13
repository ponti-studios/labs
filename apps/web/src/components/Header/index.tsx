import { Globe } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "src/lib/auth";
import { AuthStatus } from "src/lib/auth/types";
import { APP_NAME } from "src/lib/constants";
import { LANDING, LOGIN } from "src/lib/routes";

import AuthNavMenu from "./auth-nav-menu";

function Header() {
	const { user, status } = useAuth();

	return (
		<header className="navbar flex flex-row justify-between items-center pt-4 px-0">
			<Link
				to={LANDING}
				className="flex gap-2 items-center font-extrabold lowercase text-4xl py-1"
			>
				<Globe className="animate-spin-slow mt-1 size-7 text-primary" />
				{APP_NAME}
			</Link>
			{status === AuthStatus.Authenticated ? (
				<AuthNavMenu user={user} />
			) : (
				<Link to={LOGIN} className="btn btn-primary text-white">
					Log In
				</Link>
			)}
		</header>
	);
}

export default Header;
