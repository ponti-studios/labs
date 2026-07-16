import { useEffect, useRef, useState } from "react";

type ListRowMediaProps = {
  alt?: string;
  fallback: string;
  src: string;
  variant?: "square" | "wide";
};

export function ListRowMedia({ alt = "", fallback, src, variant = "square" }: ListRowMediaProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;

    if (!image?.complete) return;

    setStatus(image.naturalWidth > 0 ? "loaded" : "error");
  }, [src]);

  return (
    <span
      className={`content-list-media content-list-media-artboard content-list-media-${variant}`}
      aria-hidden={alt ? undefined : true}
    >
      <span
        className={`content-list-media-placeholder text-muted-foreground ${
          status === "loading" ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="bg-muted h-1.5 w-1.5 rounded-full" />
        <span className="bg-muted h-1.5 w-8 rounded-full" />
        <span className="bg-muted h-1.5 w-3 rounded-full" />
      </span>

      {status === "error" ? (
        <span className="text-muted-foreground subheading-3 relative tracking-wide">{fallback}</span>
      ) : (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          width={256}
          height={256}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`relative max-h-10 max-w-full object-contain transition-opacity duration-150 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </span>
  );
}
