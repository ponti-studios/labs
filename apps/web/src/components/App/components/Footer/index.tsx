import { List as ListIcon, Mail, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { DASHBOARD, INVITES, LISTS } from "src/constants/routes";

const Footer = () => {
  return (
    <div className="sm:hidden btm-nav relative z-[55]">
      <Link to={DASHBOARD} className="text-black">
        <Search className="inline-block" />
      </Link>
      <Link to={LISTS} className="text-black">
        <span className="inline-block relative">
          <ListIcon className="inline-block" />
        </span>
      </Link>
      <Link to={INVITES} className="text-black">
        <Mail className="inline-block" />
      </Link>
    </div>
  );
};

export default Footer;
