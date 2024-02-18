import { PropsWithChildren } from "react";
import { Link, useMatch } from "react-router-dom";
import { twMerge } from "tailwind-merge";

const NavLink = ({
  to,
  className,
  children,
}: PropsWithChildren & {
  className?: string;
  to: string;
}) => {
  return (
    <Link
      to={to}
      className={twMerge(
        "text-black",
        useMatch(to) ? "bg-blue-100" : null,
        className,
      )}
    >
      {children}
    </Link>
  );
};

export default NavLink;
