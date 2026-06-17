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
        <p className="text-sm text-muted-foreground leading-relaxed">
          Click a camera on the map, or search by location.
        </p>
      </div>

      <input
        type="search"
        placeholder="Search cameras…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
      />

      {query.trim() ? (
        <div>
          {results.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No cameras match "{query}"</p>
          ) : (
            <ul className="space-y-1">
              {results.map((camera) => (
                <li key={camera.id}>
                  <Link
                    to={`/tfl/${camera.id}`}
                    className="bg-card border border-border rounded-md flex items-center gap-3 p-3 hover:border-ring transition-colors"
                  >
                    <span
                      className={`size-2 rounded-full flex-shrink-0 ${camera.available === "true" ? "bg-green-500" : "bg-muted-foreground"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm truncate">
                        {camera.commonName}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {camera.lat.toFixed(4)}, {camera.lng.toFixed(4)}
                      </div>
                    </div>
                    <span className="font-mono text-[9px] tracking-wider uppercase flex-shrink-0">
                      {camera.available === "true" ? (
                        <span className="text-green-500">LIVE</span>
                      ) : (
                        <span className="text-muted-foreground">OFF</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
              {cameras &&
                cameras.filter((c) =>
                  c.commonName.toLowerCase().includes(query.trim().toLowerCase()),
                ).length > MAX_RESULTS && (
                  <p className="text-[10px] text-muted-foreground text-center pt-1">
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
          <div className="bg-card border border-border rounded-md p-3">
            <p className="ui-data-label">Cameras</p>
            <p className="text-sm font-semibold tabular-nums mt-1">
              {isLoading ? "—" : (cameras?.length ?? 0)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-md p-3">
            <p className="ui-data-label">Online</p>
            <p className="text-sm font-semibold tabular-nums text-green-600 mt-1">
              {isLoading ? "—" : online}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
