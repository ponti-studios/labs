import { HTMLAttributes } from "react";

const PlaceType = ({
  children,
  className,
}: HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={`bg-secondary rounded px-3 py-1 text-white text-xs capitalize ${className}`}
    >
      {children}
    </span>
  );
};

export default PlaceType;
