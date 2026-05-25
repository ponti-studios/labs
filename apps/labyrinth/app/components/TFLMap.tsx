import { useQuery } from "@tanstack/react-query";
import { X as XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { Camera, Cameras } from "~/lib/tfl/types";

function CameraCard({
  camera,
  isSelected,
  onSelect,
}: {
  camera: Camera;
  isSelected: boolean;
  onSelect: (camera: Camera) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(camera)}
      className={[
        "rounded-2xl border p-4 text-left transition-all duration-200",
        isSelected
          ? "border-olive-400 bg-olive-50/70 shadow-md"
          : "border-stone-200/70 bg-white/70 hover:border-stone-300 hover:bg-white",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3>{camera.commonName}</h3>
          <p className="mt-1 text-sm text-stone-600">{camera.view || "Traffic Camera"}</p>
        </div>
        <span
          className={[
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
            camera.available === "true"
              ? "border-olive-200 bg-olive-100 text-olive-800"
              : "border-stone-200 bg-stone-100 text-stone-600",
          ].join(" ")}
        >
          {camera.available === "true" ? "Live" : "Offline"}
        </span>
      </div>
      <p className="mt-3 text-xs text-stone-500">
        {camera.lat.toFixed(4)}, {camera.lng.toFixed(4)}
      </p>
    </button>
  );
}

export default function TFLMap() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["tfl-cameras"],
    queryFn: async (): Promise<Cameras> => {
      const response = await fetch("/api/tfl");
      if (!response.ok) {
        throw new Error("Failed to fetch camera data");
      }
      const payload = (await response.json()) as { cameras: Cameras };
      return payload.cameras;
    },
  });

  const cameras = data ?? [];
  const featuredCamera = selectedCamera ?? cameras[0] ?? null;
  const visibleCameras = useMemo(() => cameras.slice(0, 24), [cameras]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-96 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-stone-300 border-t-olive-600" />
          <p className="font-light text-stone-600">Loading camera feeds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-96 items-center justify-center">
        <div className="max-w-md rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center shadow-sm">
          <h2 className="mb-4">Unable to Load Cameras</h2>
          <p className="font-light text-stone-600">
            {error instanceof Error ? error.message : "Failed to load camera data"}
          </p>
        </div>
      </div>
    );
  }

  if (!featuredCamera) {
    return (
      <div className="flex h-full min-h-96 items-center justify-center">
        <div className="max-w-md rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center shadow-sm">
          <h2 className="mb-4">No Camera Feeds Available</h2>
          <p className="font-light text-stone-600">
            Camera data is currently unavailable. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-96 gap-6 lg:grid-cols-[1.35fr_0.85fr]">
      <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-sm">
        <div className="relative h-80 bg-stone-100 md:h-96">
          <img
            src={featuredCamera.imageUrl}
            alt={featuredCamera.commonName}
            className="h-full w-full object-cover"
            onError={(event) => {
              const target = event.target as HTMLImageElement;
              target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='960' height='640' viewBox='0 0 960 640'%3E%3Crect width='960' height='640' fill='%23f5f5f4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2378716c' font-family='serif' font-size='28'%3ECamera Unavailable%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-stone-950/30 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2>{featuredCamera.commonName}</h2>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {featuredCamera.available === "true" ? "Live Feed" : "Offline"}
              </span>
            </div>
            <p className="text-sm text-stone-100/90">{featuredCamera.view || "Traffic Camera"}</p>
          </div>
        </div>

        <div className="border-t border-stone-200/70 bg-stone-50/80 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Latitude</p>
              <p className="mt-1 font-mono text-sm text-stone-900">
                {featuredCamera.lat.toFixed(5)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Longitude</p>
              <p className="mt-1 font-mono text-sm text-stone-900">
                {featuredCamera.lng.toFixed(5)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Video Feed</p>
              {featuredCamera.videoUrl ? (
                <a
                  href={featuredCamera.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm font-medium text-olive-700 hover:text-olive-800"
                >
                  Open stream
                </a>
              ) : (
                <p className="mt-1 text-sm text-stone-500">Unavailable</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-col rounded-2xl border border-stone-200/70 bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-4">
          <div>
            <h2>Camera Index</h2>
            <p className="text-sm font-light text-stone-600">
              Curated selection of London traffic feeds
            </p>
          </div>
          {selectedCamera && (
            <button
              type="button"
              onClick={() => setSelectedCamera(null)}
              className="rounded-full bg-stone-100 p-2 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>

        <div className="grid gap-3 overflow-y-auto p-4">
          {visibleCameras.map((camera) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              isSelected={featuredCamera.id === camera.id}
              onSelect={setSelectedCamera}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
