import type { PropsWithChildren } from "react";
import { Link, useMatch } from "react-router-dom";
import { twMerge } from "tailwind-merge";

const AppLink = ({
	btn,
	to,
	className,
	children,
}: PropsWithChildren<{ btn?: boolean; className?: string; to: string }>) => {
	if (btn) {
		return (
			<Link to={to}>
				<span
					className={twMerge(
						"btn btn-primary text-white px-4 py-3 hover:cursor-pointer",
						className,
					)}
				>
					{children}
				</span>
			</Link>
		);
	}

	return (
		<Link
			to={to}
			className={twMerge(
				"text-black",
				useMatch(to) ? "bg-blue-100" : null,
				className,
			)}
		>
			{children}
		</Link>
	);
};

export default AppLink;
