import { Link } from 'react-router';
import MorphingMenuIcon from './MorphingMenuIcon';

interface NavigationProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Navigation({ toggleSidebar, isSidebarOpen }: NavigationProps) {
  return (
    <nav className="fixed py-3 top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/30 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-1 px-2 xl:px-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className="px-2 xl:pl-0 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-200 border border-white/30"
            aria-label="Toggle sidebar"
          >
            <MorphingMenuIcon isOpen={isSidebarOpen} />
          </button>

          <Link to="/" className="flex items-center space-x-3 group">
            <span className="font-serif text-lg font-medium text-stone-800 group-hover:text-olive-700 transition-colors duration-200">
              Playground
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
