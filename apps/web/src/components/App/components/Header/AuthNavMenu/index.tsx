import { List, LogOut, Mail, Search, Settings, UserCircle } from "lucide-react";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
	ACCOUNT,
	DASHBOARD,
	INVITES,
	LANDING,
	LISTS,
} from "src/constants/routes";
import { logout } from "src/services/auth";
import { useAppDispatch } from "src/services/hooks";
import { useAuth } from "src/services/store";

import NavLink from "../../NavLink";

const AuthNavMenu = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { user } = useAuth();
	const onLogoutClick = useCallback(() => {
		dispatch(logout()).then(() => {
			navigate(LANDING);
		});
	}, [dispatch, navigate]);

	return (
		<>
		<div className="hidden md:visible md:flex gap-6 mr-4">
			<NavLink to={DASHBOARD} className="px-4 py-2 rounded-xl">
				<Search />
			</NavLink>
			<NavLink to={LISTS} className="px-4 py-2 rounded-xl">
				<List />
			</NavLink>
			<NavLink to={INVITES} className="px-4 py-2 rounded-xl">
				<Mail />
			</NavLink>
			</div>
			<div>
			<details data-testid="dropdown" className="dropdown dropdown-end">
				<summary data-testid="dropdown-button" role="button" className="btn bg-transparent border-none">
					<UserCircle />
				</summary>
				<ul className="p-1 pb-3 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52 mt-1">
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
						<button type="button" className="btn-ghost" onClick={onLogoutClick}>
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
