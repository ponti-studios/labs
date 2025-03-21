"use client";

import { useState } from "react";

export default function Home() {
	const [els, setEls] = useState(
		new Array(6).fill(0).map((_, i) => ({ name: `Image ${i}` })),
	);

	const handleLeftClick = () => {
		setEls((prev) => {
			// return [...prev.slice(0, 1), prev[0]];
			return [...prev.slice(1, prev.length), prev[0]];
		});
	};

	const handleRightClick = () => {
		setEls((prev) => {
			const len = prev.length;
			return [prev[len - 1], ...prev.slice(0, prev.length - 1)];
		});
	};

	return (
		<div>
			<main className="flex gap-8">
				{els.map((el, i) => (
					<div
						key={el.name}
						className="w-[300px] h-[400px] border border-black flex items-center justify-center"
						style={{ marginTop: i * 70 + 20 }}
					>
						{el.name}
					</div>
				))}
			</main>
			<div className="flex justify-center gap-8 ">
				<button type="button" className="btn" onClick={handleLeftClick}>
					Left
				</button>
				<button type="button" onClick={handleRightClick}>
					Right
				</button>
			</div>
		</div>
	);
}
