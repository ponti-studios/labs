import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useState } from "react";
import Map, {
  Layer,
  NavigationControl,
  Popup,
  Source,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import { useNavigate } from "react-router";
import { useTflCameras, type TflCamera } from "../lib/hooks/useOrbitData";

const LONDON_CENTER = { longitude: -0.1278, latitude: 51.5074, zoom: 12 };

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

interface PopupInfo {
  camera: TflCamera;
  longitude: number;
  latitude: number;
}

function cameraToGeoJSON(cameras: TflCamera[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: cameras.map((c) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [c.lng, c.lat] },
      properties: {
        id: c.id,
        commonName: c.commonName,
        view: c.view,
        available: c.available,
        lat: c.lat,
        lng: c.lng,
      },
    })),
  };
}

export default function MapLibreViewer() {
  const { data: cameras } = useTflCameras();
  const navigate = useNavigate();
  const [popup, setPopup] = useState<PopupInfo | null>(null);

  const geojson = cameras ? cameraToGeoJSON(cameras) : null;

  const onClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature || feature.layer.id !== "cameras") return;

    const props = feature.properties as {
      id: string;
      commonName: string;
      view: string;
      available: string;
      lat: number;
      lng: number;
    };
    const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates as number[];

    setPopup({
      camera: {
        id: props.id,
        commonName: props.commonName,
        view: props.view,
        available: props.available,
        lat: props.lat,
        lng: props.lng,
      } as TflCamera,
      longitude: lng,
      latitude: lat,
    });
  }, []);

  return (
    <div className="earth-viewport">
      <Map
        initialViewState={LONDON_CENTER}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={geojson ? ["cameras"] : []}
        onClick={onClick}
        cursor="auto"
      >
        <NavigationControl position="bottom-right" />

        {geojson && (
          <Source id="cameras" type="geojson" data={geojson}>
            <Layer
              id="cameras"
              type="circle"
              paint={{
                "circle-radius": 6,
                "circle-color": [
                  "case",
                  ["==", ["get", "available"], "true"],
                  "#10b981",
                  "#6b7280",
                ],
                "circle-opacity": 0.8,
                "circle-stroke-width": 1.5,
                "circle-stroke-color": [
                  "case",
                  ["==", ["get", "available"], "true"],
                  "#10b981",
                  "#6b7280",
                ],
                "circle-stroke-opacity": 0.6,
              }}
            />
          </Source>
        )}

        {popup && (
          <Popup
            longitude={popup.longitude}
            latitude={popup.latitude}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => setPopup(null)}
          >
            <div style={{ minWidth: 180 }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
                {popup.camera.commonName}
              </div>
              {popup.camera.view && (
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>
                  {popup.camera.view}
                </div>
              )}
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>
                {popup.camera.lat.toFixed(4)}, {popup.camera.lng.toFixed(4)}
              </div>
              <div style={{ fontSize: 11 }}>
                {popup.camera.available === "true" ? (
                  <span style={{ color: "#10b981" }}>● ONLINE</span>
                ) : (
                  <span style={{ color: "#6b7280" }}>● OFFLINE</span>
                )}
              </div>
              <button
                onClick={() => navigate(`/tfl/${popup.camera.id}`)}
                style={{
                  marginTop: 8,
                  padding: "3px 8px",
                  fontSize: 11,
                  background: "rgba(212,165,116,0.15)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 3,
                  color: "var(--accent)",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                View camera →
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
