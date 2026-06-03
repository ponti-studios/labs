import { Link } from "react-router";

const tabs = [
  {
    id: "covid",
    label: "COVID",
    path: "covid",
    description: "Cases, mortality, country drilldowns",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "satellites",
    label: "SATELLITES",
    path: "satellites",
    description: "Orbiting assets and telemetry",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 15l5-5m1-5l4 4m1 1l5 5M8 16l8-8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "tfl",
    label: "TFL",
    path: "tfl",
    description: "City cameras and street coverage",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 9.5h14M7 15h10M8 18h8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="9.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "geospatial",
    label: "GEOSPATIAL",
    path: "geospatial",
    description: "Search, overlays, and layer analysis",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7l8-3 8 3-8 3-8-3zm0 5l8 3 8-3M4 17l8 3 8-3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

interface ControlsProps {
  currentTab: string;
}

export default function Controls({ currentTab }: ControlsProps) {
  return (
    <nav className="earth-nav" aria-label="Earth data layers">
      <div className="earth-nav-header">
        <div className="earth-kicker">Mission layers</div>
        <div className="earth-nav-caption">
          Switch the left-rail workspace without leaving the globe.
        </div>
      </div>

      <div className="earth-nav-list">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <Link
              key={tab.id}
              to={`/${tab.path}`}
              className={`earth-nav-item ${isActive ? "earth-nav-item--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="earth-nav-icon">{tab.icon}</span>
              <span className="earth-nav-copy">
                <span className="earth-nav-label">{tab.label}</span>
                <span className="earth-nav-description">{tab.description}</span>
              </span>
              <span className="earth-nav-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
