import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
};

export const Button = ({ className, children, ...props }: Props) => {
  return (
    <button
      className={`btn btn-primary border-none ${className ?? ""} ${
        props.isLoading ?? " loading"
      }`}
      {...props}
    >
      {props.isLoading ? (
        <span className="loading-dots text-black" />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
