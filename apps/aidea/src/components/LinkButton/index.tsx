import Link from "next/link";
import React, { type PropsWithChildren } from "react";

type LinkButtonProps = {
	href: string;
};
export default function LinkButton({
	children,
	href,
}: PropsWithChildren<LinkButtonProps>) {
	return (
		<Link href={href}>
			<span className="border-primary border-[1px] px-2 py-3 rounded-md hover:cursor-pointer">
				{children}
			</span>
		</Link>
	);
}
