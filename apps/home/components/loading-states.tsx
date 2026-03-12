// Global loading component for navigation transitions
export function NavigationLoader() {
	return (
		<div className="fixed top-0 left-0 right-0 z-50">
			<div className="h-1 bg-gradient-to-r from-bg-panel-2 via-bg-panel-1 to-bg-panel-0 animate-pulse" />
		</div>
	);
}

// Page transition loading state
export function PageTransitionLoader() {
	return (
		<div className="flex items-center justify-center min-h-[400px]">
			<div className="text-center">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
				<p className="text-text-secondary">Loading page...</p>
			</div>
		</div>
	);
}

// Quick loading state for immediate feedback
export function QuickLoader() {
	return (
		<div className="animate-pulse space-y-4">
			<div className="h-4 bg-bg-panel-2/50 rounded w-3/4" />
			<div className="h-4 bg-bg-panel-2/50 rounded w-1/2" />
			<div className="h-32 bg-bg-panel-2/50 rounded" />
		</div>
	);
}
