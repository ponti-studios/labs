import { List, LogOut, Mail, Search, Settings, UserCircle } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import AppLink from "src/components/AppLink";
import { useAuth } from "src/lib/auth";
import type { User } from "src/lib/types";
import {
	ACCOUNT,
	DASHBOARD,
	INVITES,
	LANDING,
	LISTS,
} from "src/lib/utils/routes";

const AuthNavMenu = ({ user }: { user: User }) => {
	const { logout } = useAuth();
	const navMenuRef = useRef(null);
	const navigate = useNavigate();
	const onLogoutClick = useCallback(
		async () => logout.mutateAsync(),
		[logout.mutateAsync],
	);

	useEffect(() => {
		logout.status === "success" && navigate(LANDING);
	}, [logout.status, navigate]);

	const onLinkClick = useCallback(() => {
		navMenuRef.current?.click?.();
	}, []);

	const onLinkKeyDown = useCallback((event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			navMenuRef.current?.click?.();
		}
	}, []);

	return (
		<>
			<div className="hidden md:visible md:flex gap-6 mr-4">
				<AppLink to={DASHBOARD} className="px-4 py-2 rounded-xl">
					<Search />
				</AppLink>
				<AppLink to={LISTS} className="px-4 py-2 rounded-xl">
					<List />
				</AppLink>
				<AppLink to={INVITES} className="px-4 py-2 rounded-xl">
					<Mail />
				</AppLink>
			</div>
			<div>
				<details data-testid="dropdown" className="dropdown dropdown-end">
					<summary
						ref={navMenuRef}
						data-testid="dropdown-button"
						role="button"
						className="btn bg-transparent border-black"
					>
						<UserCircle />
					</summary>
					<ul
						className="p-1 pb-3 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52 mt-1"
						onKeyDown={onLinkKeyDown}
						onClick={onLinkClick}
					>
						<li>
							<span className="flex justify-end text-sm text-secondary hover:outline-none">
								{user.email}
							</span>
						</li>
						<li>
							<Link to={LISTS}>
								<List size={20} />
								Lists
							</Link>
						</li>
						<li>
							<Link to={INVITES}>
								<Mail size={20} />
								Invites
							</Link>
						</li>
						<li>
							<Link to={ACCOUNT}>
								<Settings size={20} />
								Account
							</Link>
						</li>
						<li>
							<button
								type="button"
								className="btn-ghost"
								onClick={onLogoutClick}
							>
								<LogOut size={20} />
								Logout
							</button>
						</li>
					</ul>
				</details>
			</div>
		</>
	);
};

export default AuthNavMenu;
