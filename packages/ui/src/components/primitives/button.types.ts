export type ButtonVariant = "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";

export type ButtonSize = "icon";

export interface ButtonBaseProps {
  isLoading?: boolean | undefined;
  size?: ButtonSize;
  title?: string | undefined;
  variant?: ButtonVariant;
}
