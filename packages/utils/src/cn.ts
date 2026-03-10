import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper precedence
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Assert a condition, throw error if false
 * Useful for runtime type checking
 */
export function invariant(
  condition: any,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Assert a condition, return fallback if false
 */
export function invariantResponse(
  condition: any,
  message: string,
  response: { status?: number } = {}
): asserts condition {
  if (!condition) {
    throw new Response(message, { status: response.status || 400 });
  }
}
