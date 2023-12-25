import { Link, useLocation } from "react-router-dom";
import styles from "./NotFound.module.css";

function NotFound() {
  const pathname = useLocation().pathname;

  if (pathname.indexOf("invites") !== -1) {
    return (
      <div className={styles.wrap}>
        <h2 className="text-2xl font-semibold">
          This invite could not be found.
        </h2>
        <p className="text-md">
          If someone invited you to a list,{" "}
          <Link to="/login" className="text-blue-400 font-semibold">
            log in
          </Link>{" "}
          to view your new list.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1>You lost, buddy?</h1>
    </div>
  );
}

export default NotFound;
