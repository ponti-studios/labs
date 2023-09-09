import { ReactNode } from "react";
import styles from "./List.module.scss";

type ListProps = {
  children: ReactNode;
};
function List({ children }: ListProps) {
  return <ul className={styles.list}>{children}</ul>;
}

export default List;
