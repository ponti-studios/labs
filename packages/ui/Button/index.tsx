import React, { ReactNode } from "react";
import styles from "./Button.module.css";

type Props = {
  className?: string;
  children: ReactNode;
  onClick: () => void;
};

export const Button: React.FC<Props> = ({
  className,
  children,
  onClick,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.wrap} bg-blue-600 text-white ${
        (className && ` ${className}`) ?? ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
