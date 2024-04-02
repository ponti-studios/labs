import type React from "react";
import styles from "./AuthWrap.module.css";

type Props = {
	children: React.ReactNode;
};

function AuthWrap({ children }: Props) {
	return <div className={styles.wrap}>{children}</div>;
}

export default AuthWrap;
