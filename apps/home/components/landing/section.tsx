"use client";

import cn from "classnames";
import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";

interface SectionProps extends HTMLMotionProps<"section"> {
	children: React.ReactNode;
	className?: string;
	fullWidth?: boolean;
}

export function Section({
	children,
	className,
	fullWidth = false,
	...props
}: SectionProps) {
	return (
		<motion.section
			className={cn(
				"w-full flex flex-col items-center justify-center py-16 md:py-24 px-6 md:px-0",
				className,
			)}
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-100px" }}
			transition={{ duration: 0.8, ease: "easeOut" }}
			{...props}
		>
			<div
				className={cn(
					"w-full flex flex-col gap-8 md:gap-12",
					fullWidth ? "max-w-full" : "max-w-2xl",
				)}
			>
				{children}
			</div>
		</motion.section>
	);
}
