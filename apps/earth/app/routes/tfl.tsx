import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useTflCameras } from "../lib/hooks/useOrbitData";

const MAX_RESULTS = 20;

export default function Tfl() {
  const { data: cameras, isLoading } = useTflCameras();
  const [query, setQuery] = useState("");

  const online = useMemo(
    () => (cameras ?? []).filter((c) => c.available === "true").length,
    [cameras],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !cameras) return [];
    return cameras.filter((c) => c.commonName.toLowerCase().includes(q)).slice(0, MAX_RESULTS);
  }, [cameras, query]);

  return (
    <div className="space-y-5">
      <div>
        <p className="ui-eyebrow mb-1">TfL Traffic Network</p>
        <p className="text-secondary text-sm leading-relaxed">
          Click a camera on the map, or search by location.
        </p>
      </div>

      <input
        type="search"
        placeholder="Search cameras…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-panel border-default text-primary placeholder:text-secondary focus:border-focus w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none"
      />

      {query.trim() ? (
        <div>
          {results.length === 0 ? (
            <p className="text-secondary py-2 text-xs">No cameras match "{query}"</p>
          ) : (
            <ul className="space-y-1">
              {results.map((camera) => (
                <li key={camera.id}>
                  <Link
                    to={`/tfl/${camera.id}`}
                    className="bg-panel border-default hover:border-focus flex items-center gap-3 rounded-md border p-3 transition-colors"
                  >
                    <span
                      className={`size-2 flex-shrink-0 rounded-full ${camera.available === "true" ? "bg-green-500" : "bg-inset-foreground"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-primary truncate text-sm font-medium">
                        {camera.commonName}
                      </div>
                      <div className="text-secondary font-mono text-[10px]">
                        {camera.lat.toFixed(4)}, {camera.lng.toFixed(4)}
                      </div>
                    </div>
                    <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-wider">
                      {camera.available === "true" ? (
                        <span className="text-green-500">LIVE</span>
                      ) : (
                        <span className="text-secondary">OFF</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
              {cameras &&
                cameras.filter((c) =>
                  c.commonName.toLowerCase().includes(query.trim().toLowerCase()),
                ).length > MAX_RESULTS && (
                  <p className="text-secondary pt-1 text-center text-[10px]">
                    Showing {MAX_RESULTS} of{" "}
                    {
                      cameras.filter((c) =>
                        c.commonName.toLowerCase().includes(query.trim().toLowerCase()),
                      ).length
                    }{" "}
                    — refine your search
                  </p>
                )}
            </ul>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-panel border-default rounded-md border p-3">
            <p className="ui-data-label">Cameras</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">
              {isLoading ? "—" : (cameras?.length ?? 0)}
            </p>
          </div>
          <div className="bg-panel border-default rounded-md border p-3">
            <p className="ui-data-label">Online</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-green-600">
              {isLoading ? "—" : online}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
