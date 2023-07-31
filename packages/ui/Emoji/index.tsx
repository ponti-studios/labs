import { HTMLAttributes, ReactNode } from "react";

type EmojiSizes = "sm" | "md" | "lg";

const SIZES = {
  sm: "16px",
  md: "24px",
  lg: "48px",
};

type EmojiProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  kind: string;
  size: EmojiSizes;
};

function Emoji({ children, kind, size, ...props }: EmojiProps) {
  return (
    <span
      aria-label={kind}
      role="img"
      style={{ fontSize: SIZES[size] }}
      {...props}
    >
      {children}
    </span>
  );
}

export default Emoji;
