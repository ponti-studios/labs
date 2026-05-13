interface MorphingMenuIconProps {
	isOpen: boolean;
}

export default function MorphingMenuIcon({ isOpen }: MorphingMenuIconProps) {
	return (
		<span className="relative block h-4 w-4" aria-hidden="true">
			<span
				className={[
					"absolute left-0 top-0 block h-0.5 w-4 rounded bg-current transition-transform duration-200",
					isOpen ? "translate-y-[7px] rotate-45" : "translate-y-[1px]",
				].join(" ")}
			/>
			<span
				className={[
					"absolute left-0 top-1/2 block h-0.5 w-4 -translate-y-1/2 rounded bg-current transition-opacity duration-200",
					isOpen ? "opacity-0" : "opacity-100",
				].join(" ")}
			/>
			<span
				className={[
					"absolute left-0 bottom-0 block h-0.5 w-4 rounded bg-current transition-transform duration-200",
					isOpen ? "-translate-y-[7px] -rotate-45" : "-translate-y-[1px]",
				].join(" ")}
			/>
		</span>
	);
}
