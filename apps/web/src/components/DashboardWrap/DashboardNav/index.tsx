import { Link, useLocation } from "react-router-dom";
import React from "react";

const LINKS = [
  { path: "/ideas", text: "Ideas" },
  { path: "/bookmarks", text: "Bookmarks" },
  { path: "/lists", text: "Lists" },
  { path: "/lists/invites", text: "Invites" },
];

function DashboardNav() {
  const location = useLocation();

  return (
    <div className="flex justify-center gap-4 p-4">
      {LINKS.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={
            location.pathname === link.path
              ? "underline underline-offset-4 decoration-black text-primary font-bold decoration-2"
              : ""
          }
        >
          {link.text}
        </Link>
      ))}
    </div>
  );
}

export default React.memo(DashboardNav);
