import { BadgeAlert } from "lucide-react";
import type { HTMLProps, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

function Alert({
	className,
	children,
	type,
}: PropsWithChildren<
	HTMLProps<HTMLDivElement> & {
		type?: "success" | "error" | "warning" | "info";
	}
>) {
	if (type === "success") {
		return (
			<div
				className={twMerge(
					"rounded-md alert alert-success text-success-content p-4 text-md",
					className,
				)}
			>
				{children}
			</div>
		);
	}

	if (type === "error") {
		return (
			<div
				className={twMerge(
					"flex alert alert-error rounded-md text-error-content p-4 text-md",
					className,
				)}
			>
				<BadgeAlert size={16} />
				<div className="flex-1 ml-4">{children}</div>
			</div>
		);
	}

	if (type === "warning") {
		return (
			<div
				className={twMerge(
					"rounded-md bg-yellow-400 text-warning-content p-4 text-md",
					className,
				)}
			>
				{children}
			</div>
		);
	}

	return (
		<div
			className={twMerge(
				"rounded-md bg-gray-100 text-info-content p-4 text-md",
				className,
			)}
		>
			{children}
		</div>
	);
}

export default Alert;
