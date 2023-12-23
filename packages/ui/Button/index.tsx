import { HTMLAttributes, ReactNode, SyntheticEvent } from "react";

type Props = HTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  loading?: boolean;
  onClick?: (e: SyntheticEvent<HTMLButtonElement>) => void;
};

export const Button = ({ className, children, onClick, ...props }: Props) => {
  return (
    <button
      {...(onClick && { onClick })}
      className={`btn btn-primary ${className ?? ""} ${
        props.loading ?? " loading"
      }`}
    >
      {children}
    </button>
  );
};

export default Button;
