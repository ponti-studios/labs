import { motion } from "framer-motion";

interface MorphingMenuIconProps {
	isOpen: boolean;
}

export default function MorphingMenuIcon({ isOpen }: MorphingMenuIconProps) {
	return (
		<motion.svg
			className="w-5 h-5 text-stone-700"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			{/* Top line - morphs to X */}
			<motion.path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d={isOpen ? "M18 6L6 18" : "M4 6h16"}
				animate={{
					d: isOpen ? "M18 6L6 18" : "M4 6h16",
				}}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			/>

			{/* Middle line - fades out when open */}
			<motion.path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M4 12h16"
				animate={{
					opacity: isOpen ? 0 : 1,
					scale: isOpen ? 0 : 1,
				}}
				transition={{ duration: 0.2, ease: "easeInOut" }}
			/>

			{/* Bottom line - morphs to X */}
			<motion.path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d={isOpen ? "M6 6L18 18" : "M4 18h16"}
				animate={{
					d: isOpen ? "M6 6L18 18" : "M4 18h16",
				}}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			/>
		</motion.svg>
	);
}
