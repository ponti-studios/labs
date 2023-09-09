import Link from "next/link";
import { useLocation } from "react-router-dom";
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
    <div className="flex gap-4 py-4 mt-2">
      {LINKS.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          className={
            location.pathname === link.path &&
            "underline underline-offset-4 decoration-black text-primary font-bold decoration-2"
          }
        >
          {link.text}
        </Link>
      ))}
    </div>
  );
}

export default React.memo(DashboardNav);
