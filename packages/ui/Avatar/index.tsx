import * as Avatar from "@radix-ui/react-avatar";
import { PersonIcon } from "@radix-ui/react-icons";

import "./styles.css";

type AvatarProps = {
  alt: string;
  fallback?: string;
  src?: string;
};
const CustomAvatar = ({ alt, src, fallback }: AvatarProps) => (
  <Avatar.Root className="AvatarRoot">
    {src ? (
      <Avatar.Image
        className="AvatarImage"
        src={src || "https://avatars.githubusercontent.com/u/1831709?v=4"}
        alt={alt}
      />
    ) : (
      <PersonIcon />
    )}
    <Avatar.Fallback className="AvatarFallback" delayMs={600}>
      {fallback}
    </Avatar.Fallback>
  </Avatar.Root>
);

export default CustomAvatar;
