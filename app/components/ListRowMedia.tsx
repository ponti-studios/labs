import { cn } from "@ponti-studios/ui/utilities";
import { useEffect, useRef, useState } from "react";

import styles from "./list-row.module.css";

type ListRowMediaProps = {
  alt?: string;
  fallback: string;
  loading?: "eager" | "lazy";
  src: string;
  variant?: "square" | "wide";
};

export function ListRowMedia({
  alt = "",
  fallback,
  loading = "lazy",
  src,
  variant = "square",
}: ListRowMediaProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;

    if (!image?.complete) return;

    setStatus(image.naturalWidth > 0 ? "loaded" : "error");
  }, [src]);

  return (
    <span
      className={cn("list-media", {
        [styles.mediaArtboard]: true,
        "list-media-square": variant === "square",
        "list-media-wide": variant === "wide",
      })}
      aria-hidden={alt ? undefined : true}
    >
      <span
        aria-hidden="true"
        className={cn(`list-media-placeholder`, {
          "opacity-100": status === "loading",
          "opacity-0": status !== "loading",
        })}
      >
        <span className={cn({ [styles.mediaPulse]: true })} />
      </span>

      {status === "error" ? (
        <span className="text-muted-foreground subtext-lg relative font-semibold tracking-tight">
          {fallback}
        </span>
      ) : (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          width={256}
          height={256}
          loading={loading}
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={cn(
            `relative max-h-10 max-w-full object-contain transition-opacity duration-150`,
            {
              "opacity-100": status === "loaded",
              "opacity-0": status !== "loaded",
            },
          )}
        />
      )}
    </span>
  );
}
