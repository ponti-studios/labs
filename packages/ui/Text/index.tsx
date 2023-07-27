import { ReactNode } from "react";

export const Bold = ({ children, ...props }: { children: ReactNode }) => (
 <span className="font-semibold" {...props}>
  {children}
 </span>
);
