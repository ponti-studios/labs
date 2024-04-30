import { BadgeAlert } from "lucide-react";
import type { PropsWithChildren } from "react";

function Alert({
	children,
	type,
}: PropsWithChildren<{
	type?: "success" | "error" | "warning" | "info";
}>) {
	if (type === "success") {
		return (
			<div className="rounded-md alert alert-success text-success-content p-4 text-md mb-4">
				{children}
			</div>
		);
	}

	if (type === "error") {
		return (
			<div className="flex alert alert-error rounded-md text-error-content p-4 text-md mb-4">
				<BadgeAlert size={16} />
				<div className="flex-1 ml-4">{children}</div>
			</div>
		);
	}

	if (type === "warning") {
		return (
			<div className="rounded-md bg-yellow-400 text-warning-content p-4 text-md mb-4">
				{children}
			</div>
		);
	}

	if (type === "info") {
		return (
			<div className="rounded-md bg-gray-100 text-info-content p-4 text-md mb-4">
				{children}
			</div>
		);
	}

	return (
		<div className="rounded-md bg-gray-400 text-default-content p-4 text-md mb-4">
			{children}
		</div>
	);
}

export default Alert;
