import cn from "classnames";

interface BentoBoxProps {
	title?: string;
	children: React.ReactNode;
	className?: string;
	accent?: "lime" | "blue" | "purple" | "gray" | "black";
	spotlight?: boolean;
}

export function BentoBox({
	title,
	children,
	className = "",
	accent,
	spotlight,
}: BentoBoxProps) {
	return (
		<div
			className={cn(
				"p-8 py-12 rounded-2xl border backdrop-blur-sm transition-all duration-300",
				"hover:transform hover:scale-[1.02]",
				{
					"bg-bg-panel-0 border-border-default hover:border-border-strong":
						!accent || accent === "gray",
					"bg-bg-panel-0 border-border-default hover:border-border-strong text-primary":
						accent === "black",
				},
				className,
			)}
		>
			{title ? (
				<h3 className="text-2xl font-medium mb-6 text-primary">{title}</h3>
			) : null}
			{children}
		</div>
	);
}
