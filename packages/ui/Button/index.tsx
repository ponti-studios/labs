import { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children: ReactNode;
  onClick: () => void;
};

export const Button = ({ className, children, onClick, ...props }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-primary ${(className && ` ${className}`) ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
