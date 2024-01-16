import { HTMLAttributes } from "react";

const PlaceType = ({
  children,
  className,
}: HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={`inline-block bg-secondary rounded-md px-3 py-1 text-sm font-semibold text-primary-content mr-2 ${className}`}
    >
      # {children}
    </span>
  );
};

export default PlaceType;
