import { Link } from "react-router";

const tabs = [
  { id: "tfl", label: "TFL", path: "tfl" },
] as const;

interface ControlsProps {
  currentTab: string;
}

export default function Controls({ currentTab }: ControlsProps) {
  return (
    <nav className="earth-pill-nav" aria-label="Earth data layers">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          to={`/${tab.path}`}
          className={`earth-pill-tab ${currentTab === tab.id ? "earth-pill-tab--active" : ""}`}
          aria-current={currentTab === tab.id ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
