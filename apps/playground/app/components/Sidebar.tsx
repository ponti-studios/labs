import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { routes } from "../lib/routes";

interface SidebarProps {
	isSidebarOpen: boolean;
	toggleSidebar: () => void;
}

export default function Sidebar({
	isSidebarOpen,
	toggleSidebar,
}: SidebarProps) {
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
					className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg p-4 fixed left-6 top-10 bottom-6 w-64 overflow-y-auto z-[100]"
					initial={{ opacity: 0, scale: 0.95, x: -20 }}
					animate={{ opacity: 1, scale: 1, x: 0 }}
					exit={{ opacity: 0, scale: 0.95, x: -20 }}
					transition={{
						duration: 0.25,
						ease: "easeOut",
					}}
				>
					<nav className="flex flex-col space-y-2">
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
									className={cn(
										"flex px-4 py-3 rounded-lg text-sm font-light transition-all duration-300 text-stone-700 hover:bg-white/40 hover:text-stone-900 mx-1",
										{
											"bg-olive-100/80 text-olive-800 font-medium":
												isActiveRoute(route.path),
										},
									)}
								>
									<div className="flex flex-col">
										<span>{route.label}</span>
										<span className="text-xs opacity-70">
											{route.description}
										</span>
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
