type LoadingSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
type LoadingProps = {
	size?: LoadingSize;
};

const sizes = {
	sm: "1rem",
	md: "2rem",
	lg: "3rem",
	xl: "4rem",
	"2xl": "5rem",
	"3xl": "6rem",
};

export default function Loading({ size = "md" }: LoadingProps) {
	return (
		<div data-testid="loading-spinner" role="status">
			<span
				className="loading loading-infinity"
				style={{ width: sizes[size] }}
			/>
			<span className="sr-only">Loading...</span>
		</div>
	);
}

export function LoadingScene() {
	return (
		<div className="flex items-center justify-center max-w-[300px] mx-auto min-h-full">
			<Loading size="xl" />
		</div>
	);
}
