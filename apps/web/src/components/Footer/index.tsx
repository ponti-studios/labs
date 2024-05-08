import { List as ListIcon, Mail, Search } from "lucide-react";
import { DASHBOARD, INVITES, LISTS } from "src/lib/utils/routes";
import AppLink from "../AppLink";

const Footer = () => {
	return (
		<div className="visible md:hidden btm-nav z-[55]">
			<AppLink to={DASHBOARD}>
				<Search className="inline-block" />
			</AppLink>
			<AppLink to={LISTS}>
				<span className="inline-block relative">
					<ListIcon className="inline-block" />
				</span>
			</AppLink>
			<AppLink to={INVITES}>
				<Mail className="inline-block" />
			</AppLink>
		</div>
	);
};

export default Footer;
