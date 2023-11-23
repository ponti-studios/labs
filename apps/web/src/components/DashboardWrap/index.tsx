import { ReactNode } from "react";
import DashboardNav from "./DashboardNav";

type DashboardWrapProps = {
  children: ReactNode;
};
const DashboardWrap = ({ children }: DashboardWrapProps) => {
  return (
    <div className="flex flex-col flex-1 px-4 sm:max-w-2xl mx-auto">
      <DashboardNav />
      {children}
    </div>
  );
};

export default DashboardWrap;
