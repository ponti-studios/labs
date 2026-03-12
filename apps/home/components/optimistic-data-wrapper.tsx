"use client";

import { useEffect, useState } from "react";

interface OptimisticDataWrapperProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	delay?: number;
}

export function OptimisticDataWrapper({
	children,
	fallback,
	delay = 100,
}: OptimisticDataWrapperProps) {
	const [showFallback, setShowFallback] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowFallback(false);
		}, delay);

		return () => clearTimeout(timer);
	}, [delay]);

	if (showFallback && fallback) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
