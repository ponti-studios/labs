// Performance monitoring component for development
export function PerformanceMonitor({
	children,
	label,
}: { children: React.ReactNode; label: string }) {
	if (process.env.NODE_ENV === "development") {
		console.time(`${label} - Server Component Render`);

		// In development, log performance metrics
		const result = children;

		console.timeEnd(`${label} - Server Component Render`);
		return result;
	}

	return children;
}
