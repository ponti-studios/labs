import { HTMLAttributes } from "react";

type DashboardWrapProps = HTMLAttributes<HTMLDivElement>;
const DashboardWrap = ({ children, className }: DashboardWrapProps) => {
  return (
    <div
      className={`flex flex-col flex-1 px-4 sm:max-w-2xl mx-auto ${className}`}
    >
      {children}
    </div>
  );
};

export default DashboardWrap;
