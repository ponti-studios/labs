import * as Avatar from "@radix-ui/react-avatar";

import "./styles.css";

type AvatarProps = {
  alt: string;
  fallback?: string;
  src?: string;
};
const CustomAvatar = ({ alt, src, fallback }: AvatarProps) =>
  src ? (
    <Avatar.Root className="AvatarRoot">
      <Avatar.Image className="AvatarImage" src={src} alt={alt} />
      <Avatar.Fallback className="text-primary" delayMs={600}>
        {fallback}
      </Avatar.Fallback>
    </Avatar.Root>
  ) : null;

export default CustomAvatar;
