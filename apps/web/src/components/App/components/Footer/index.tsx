import { List as ListIcon, Mail, Search } from "lucide-react";
import { DASHBOARD, INVITES, LISTS } from "src/lib/utils/routes";
import NavLink from "../NavLink";

const Footer = () => {
	return (
		<div className="visible md:hidden btm-nav z-[55]">
			<NavLink to={DASHBOARD}>
				<Search className="inline-block" />
			</NavLink>
			<NavLink to={LISTS}>
				<span className="inline-block relative">
					<ListIcon className="inline-block" />
				</span>
			</NavLink>
			<NavLink to={INVITES}>
				<Mail className="inline-block" />
			</NavLink>
		</div>
	);
};

export default Footer;
