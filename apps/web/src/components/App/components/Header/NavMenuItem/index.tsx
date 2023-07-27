import React from "react";

import styles from "./NavMenuItem.module.css";

function NavMenuItem({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={styles.menuItem} {...props}>
      {children}
    </div>
  );
}

export default NavMenuItem;
