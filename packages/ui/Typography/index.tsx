import { ReactNode } from "react";

type Variant = "h1" | "span" | "bold";

const Typography = ({
  children,
  className = "",
  variant,
  ...props
}: {
  children: ReactNode;
  className?: string;
  variant?: Variant;
}) => {
  const baseClasses = "text-primary";

  if (variant === "h1") {
    return (
      <h1
        className={`${baseClasses} text-3xl font-semibold ${className}`}
        {...props}
      >
        {children}
      </h1>
    );
  }

  if (variant === "bold") {
    return (
      <span className={`${baseClasses} font-semibold ${className}`} {...props}>
        {children}
      </span>
    );
  }

  return (
    <span className={`text-primary text-md ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Typography;
