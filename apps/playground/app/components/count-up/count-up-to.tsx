import { type ReactNode, useEffect, useState } from "react";

interface CountUpToProps {
	value: number;
	duration?: number;
	separator?: string;
	start?: number;
	decimals?: number;
	prefix?: string;
	suffix?: string;
}

function useCountUp(endValue: number, duration = 1.5, startValue = 0) {
	const [currentValue, setCurrentValue] = useState(startValue);

	useEffect(() => {
		if (endValue === startValue) {
			setCurrentValue(endValue);
			return;
		}

		const startTime = Date.now();
		const difference = endValue - startValue;

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / (duration * 1000), 1);

			// Easing function for smooth animation (ease-out)
			const easeOut = 1 - (1 - progress) ** 3;
			const currentCount = startValue + difference * easeOut;

			setCurrentValue(currentCount);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				setCurrentValue(endValue);
			}
		};

		const animationId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(animationId);
		};
	}, [endValue, duration, startValue]);

	return currentValue;
}

function formatNumber(value: number, decimals = 0, separator = ","): string {
	const fixedValue = value.toFixed(decimals);
	const parts = fixedValue.split(".");
	const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);

	return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
}

function CountUpTo({
	value,
	duration = 1.5,
	separator = ",",
	start = 0,
	decimals = 0,
	prefix = "",
	suffix = "",
}: CountUpToProps): ReactNode {
	const currentValue = useCountUp(value, duration, start);
	const formattedValue = formatNumber(currentValue, decimals, separator);

	return (
		<span>
			{prefix}
			{formattedValue}
			{suffix}
		</span>
	);
}

export default CountUpTo;
