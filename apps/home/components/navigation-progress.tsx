"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

export function NavigationProgress() {
	const pathname = usePathname();
	const [isLoading, setIsLoading] = useState(false);
	const prevPathnameRef = useRef(pathname);

	if (prevPathnameRef.current !== pathname) {
		prevPathnameRef.current = pathname;
		if (!isLoading) {
			setIsLoading(true);
			setTimeout(() => setIsLoading(false), 300);
		}
	}

	if (!isLoading) return null;

	return (
		<div className="fixed top-0 left-0 right-0 z-50">
			<div className="h-1 bg-gradient-to-r from-bg-panel-2 via-bg-panel-1 to-bg-panel-0">
				<div className="h-full bg-primary/30 animate-pulse" />
			</div>
		</div>
	);
}
