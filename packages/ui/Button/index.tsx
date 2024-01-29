import { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
};

export const Button = ({ className, children, isLoading, ...props }: Props) => {
  const disabled = props.disabled || isLoading;
  const disabledClassName = disabled ? "opacity-50 cursor-not-allowed" : "";
  return (
    <button
      className={twMerge(
        `btn btn-primary text-white font-semibold text-md`,
        className,
        disabledClassName,
      )}
      {...props}
    >
      {isLoading ? (
        <span className="loading-dots loading-md bg-white h-6" />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
