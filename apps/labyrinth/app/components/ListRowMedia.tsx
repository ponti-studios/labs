import { useEffect, useRef, useState } from "react";

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
      className={`list-media list-media-artboard list-media-${variant}`}
      aria-hidden={alt ? undefined : true}
    >
      <span
        aria-hidden="true"
        className={`list-media-placeholder ${status === "loading" ? "opacity-100" : "opacity-0"}`}
      >
        <span className="list-media-pulse" />
      </span>

      {status === "error" ? (
        <span className="text-muted-foreground subtext-lg font-semibold tracking-tight relative tracking-wide">{fallback}</span>
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
          className={`relative max-h-10 max-w-full object-contain transition-opacity duration-150 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </span>
  );
}
