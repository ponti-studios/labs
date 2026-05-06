import { Link } from "react-router";
import MorphingMenuIcon from "./MorphingMenuIcon";

interface NavigationProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Navigation({ toggleSidebar, isSidebarOpen }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-panel-0 border-b border-border-default shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-md bg-bg-panel-1 hover:bg-bg-panel-2 border border-border-default transition-all duration-160"
            aria-label="Toggle sidebar"
          >
            <MorphingMenuIcon isOpen={isSidebarOpen} />
          </button>

          <Link to="/" className="flex items-center space-x-3 group">
            <span className="font-body text-lg font-semibold text-text-primary group-hover:text-text-secondary transition-colors duration-160">
              Playground
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
