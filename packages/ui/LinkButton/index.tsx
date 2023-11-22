import { Link } from "react-router-dom";
import { ReactNode } from "react";

type LinkButtonProps = {
  children: ReactNode;
  href: string;
};
export default function LinkButton({ children, href }: LinkButtonProps) {
  return (
    <Link to={href}>
      <span className="border-primary border-[1px] px-2 py-3 rounded-md hover:cursor-pointer">
        {children}
      </span>
    </Link>
  );
}
