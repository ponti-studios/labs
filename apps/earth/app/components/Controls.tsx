import { Link } from "react-router";
import { activeTab } from "../lib/signals/earth";

const tabs = [
  { id: "covid", label: "COVID", path: "/covid" },
  { id: "satellites", label: "Satellites", path: "/satellites" },
  { id: "tfl", label: "TfL", path: "/tfl" },
  { id: "geospatial", label: "Geospatial", path: "/geospatial" },
] as const;

export default function Controls() {
  return (
    <div className="border-b border-border-default">
      <div className="flex">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`flex-1 py-3 text-xs font-medium text-center uppercase tracking-wider transition-colors ${
              activeTab.value === tab.id
                ? "bg-bg-panel-1 text-primary border-b-2 border-primary"
                : "text-text-muted hover:text-primary hover:bg-bg-panel-1"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
