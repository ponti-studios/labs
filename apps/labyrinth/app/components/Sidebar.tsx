import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { routes } from "../lib/routes";

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname === path;
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.aside
          className="bg-bg-panel-0 border border-border-default shadow-md p-4 fixed left-4 top-16 bottom-4 w-64 overflow-y-auto z-[100] rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            duration: 0.26,
            ease: "easeOut",
          }}
        >
          <nav className="flex flex-col space-y-1">
            {routes.map((route, index) => (
              <motion.div
                key={route.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.1 + index * 0.05,
                  duration: 0.3,
                }}
              >
                <Link
                  to={route.path}
                  onClick={toggleSidebar}
                  rel="prefetch"
                  className={cn(
                    "flex px-3 py-2 rounded-md text-sm transition-all duration-160 text-text-secondary hover:bg-bg-panel-2 hover:text-text-primary",
                    {
                      "bg-bg-panel-2 text-text-primary border border-border-accent font-medium":
                        isActiveRoute(route.path),
                    },
                  )}
                >
                  <div className="flex flex-col">
                    <span>{route.label}</span>
                    <span className="text-xs text-text-muted">{route.description}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
