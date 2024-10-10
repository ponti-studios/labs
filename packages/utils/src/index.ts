import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Slices an array into chunks of a given size
 * @param arr
 * @param chunkSize
 * @returns
 */
const sliceIntoChunks = <T>(arr: T[], chunkSize: number) =>
	Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
		arr.slice(i * chunkSize, (i + 1) * chunkSize),
	);

export const getEnv = (key: string): string => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`${key} environment variable not set`);
	}
	return value;
};

const validateEnvironmentVariables = (envVariables: string[]) => {
	for (const envVariable of envVariables) {
		getEnv(envVariable);
	}
};

export { sliceIntoChunks, validateEnvironmentVariables };
