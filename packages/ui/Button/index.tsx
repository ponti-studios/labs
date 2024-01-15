import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
};

export const Button = ({ className, children, ...props }: Props) => {
  return (
    <button
      className={`btn btn-primary text-white border-none ${className ?? ""}`}
      {...props}
    >
      {props.isLoading ? (
        <span className="loading-dots loading-md bg-white h-6" />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
