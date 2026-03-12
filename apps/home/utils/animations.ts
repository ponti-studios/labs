import type { Transition } from "framer-motion";

export const fadeInUp: {
	initial: { opacity: number; y: number };
	whileInView: { opacity: number; y: number };
	viewport: { once: boolean };
	transition: Transition;
} = {
	initial: { opacity: 0, y: 20 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true },
	transition: { duration: 1.0, ease: "easeInOut" },
};
