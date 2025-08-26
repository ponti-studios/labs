import { useEffect, useState } from "react";

export const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		// Check if we're on the client-side before using window
		if (typeof window !== "undefined") {
			const checkIfMobile = () => {
				setIsMobile(window.innerWidth < 768); // 768px is a common breakpoint for mobile
			};

			// Initial check
			checkIfMobile();

			// Add event listener for resize
			window.addEventListener("resize", checkIfMobile);

			// Clean up
			return () => window.removeEventListener("resize", checkIfMobile);
		}
	}, []);

	return { isMobile };
};
