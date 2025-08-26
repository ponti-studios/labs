import * as d3 from "d3";
import type React from "react";
import { useEffect, useRef } from "react";
import type { Vote } from "~/db/schema";

// Use the canonical Vote type from the updated schema

interface VoteChartProps {
	votes: Vote[];
}

const VoteChart: React.FC<VoteChartProps> = ({ votes }) => {
	const chartRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		if (!votes || !votes.length || !chartRef.current) {
			// Clear chart if no votes or ref not available
			if (chartRef.current) {
				d3.select(chartRef.current).selectAll("*").remove();
			}
			return;
		}

		d3.select(chartRef.current).selectAll("*").remove(); // Clear previous chart

		const width = 300;
		const height = 200;
		const radius = Math.min(width, height) / 2.5;
		const svg = d3
			.select(chartRef.current)
			.append("svg")
			.attr("viewBox", `0 0 ${width} ${height}`)
			.attr("preserveAspectRatio", "xMidYMid meet")
			.attr("width", "100%")
			.attr("height", "100%")
			.append("g")
			.attr("transform", `translate(${width / 2},${height / 2})`);

		const data = [
			{ label: "Stay", value: votes.filter((v) => v.value === "stay").length },
			{ label: "Go", value: votes.filter((v) => v.value === "dump").length },
		];

		// Using hardcoded hex color values for simplicity
		// Future improvement: Use CSS variables or Tailwind theme colors if reliably defined
		const stayColor = "#22c55e"; // Tailwind's green-500
		const goColor = "#ef4444"; // Tailwind's red-500

		const color = d3
			.scaleOrdinal<string>()
			.domain(data.map((d) => d.label))
			.range([stayColor, goColor]);

		const pie = d3
			.pie<any>()
			.value((d: any) => d.value)
			.sort(null);

		const arc = d3
			.arc<any>()
			.innerRadius(radius * 0.6)
			.outerRadius(radius);

		svg
			.selectAll("path")
			.data(pie(data))
			.enter()
			.append("path")
			.attr("d", arc)
			.attr("fill", (d) => color(d.data.label))
			.attr("stroke", "white") // Or use a Tailwind bg color for the parent to simulate stroke
			.style("stroke-width", "2px");

		const totalVotes = votes.length;
		const stayVotes = data.find((d) => d.label === "Stay")?.value || 0;
		const percentage =
			totalVotes > 0 ? Math.round((stayVotes / totalVotes) * 100) : 0;

		svg
			.append("text")
			.attr("text-anchor", "middle")
			.attr("dy", "0.05em")
			.style("font-size", "2em")
			.style("font-weight", "bold")
			.style("fill", "currentColor") // Uses Tailwind's text color
			.text(`${percentage}%`);

		svg
			.append("text")
			.attr("text-anchor", "middle")
			.attr("dy", "1.7em")
			.style("font-size", "0.9em")
			.style("fill", "currentColor") // Uses Tailwind's text color (e.g., text-gray-500)
			.classed("text-gray-500 dark:text-gray-400", true) // Example Tailwind classes
			.text("Stay Together");
	}, [votes]);

	return (
		<div
			ref={chartRef as any}
			className="flex justify-center items-center w-full h-[200px] text-gray-900 dark:text-white"
		/>
	);
};

export default VoteChart;
