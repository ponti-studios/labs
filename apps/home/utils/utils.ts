import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * This utility function ensures that overlapping Tailwind classes are merged
 * correctly while providing the flexibility of clsx.
 */
export function cn(...classes: ClassValue[]) {
	return twMerge(clsx(...classes));
}
