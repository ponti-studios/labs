import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { useTflCameras } from "../lib/hooks/useOrbitData";

const LONDON_CENTER: [number, number] = [51.5074, -0.1278];

export default function LeafletViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const [ready, setReady] = useState(false);
  const { data: cameras } = useTflCameras();
  const navigate = useNavigate();

  // Initialize map
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    try {
      const map = L.map(container, {
        center: LONDON_CENTER,
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
        minZoom: 3,
      }).addTo(map);

      mapRef.current = map;
      setReady(true);

      // Cleanup on unmount
      return () => {
        markersRef.current.clear();
        map.remove();
        mapRef.current = null;
      };
    } catch (error) {
      console.error("Failed to initialize Leaflet map:", error);
      setReady(true);
    }
  }, []);

  // Add camera markers when data loads
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !cameras || cameras.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.remove();
    });
    markersRef.current.clear();

    // Add new markers
    cameras.forEach((camera) => {
      const isOnline = camera.available === "true";
      const markerColor = isOnline ? "#10b981" : "#6b7280";

      // Create a simple circle marker for each camera
      const marker = L.circleMarker([camera.lat, camera.lng], {
        radius: 6,
        fillColor: markerColor,
        color: markerColor,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.7,
      });

      // Add popup
      marker.bindPopup(
        `<div class="leaflet-popup-content">
          <div class="font-mono text-sm font-semibold">${camera.commonName}</div>
          <div class="text-xs text-gray-600">
            ${camera.view && camera.view !== "" ? `Direction: ${camera.view}` : ""}
          </div>
          <div class="text-xs text-gray-600">
            ${camera.lat.toFixed(4)}, ${camera.lng.toFixed(4)}
          </div>
          <div class="text-xs font-mono mt-1">
            ${isOnline ? '<span class="text-green-600">● ONLINE</span>' : '<span class="text-gray-500">● OFFLINE</span>'}
          </div>
        </div>`,
        {
          className: "leaflet-popup-tfl",
          minWidth: 200,
        },
      );

      // Add click handler to navigate to detail page
      marker.on("click", () => {
        navigate(`/tfl/${camera.id}`);
      });

      marker.addTo(map);
      markersRef.current.set(camera.id, marker);
    });
  }, [cameras, navigate]);

  if (!ready) {
    return (
      <div className="earth-viewport">
        <div className="cesium-loading-overlay">Loading map…</div>
        <div ref={containerRef} className="earth-viewport-canvas" />
      </div>
    );
  }

  return (
    <div className="earth-viewport">
      <div ref={containerRef} className="earth-viewport-canvas" />
    </div>
  );
}
