import Link from "next/link";
import { RiAlarmWarningFill } from "react-icons/ri";

export default function NotFoundPage() {
	return (
		<section className="bg-bg-app text-primary">
			<div className="flex min-h-screen flex-col items-center justify-center text-center px-6">
				<RiAlarmWarningFill
					size={60}
					className="animate-pulse text-primary opacity-80"
				/>
				<h1 className="mt-8 text-4xl md:text-6xl font-mono font-bold uppercase tracking-tighter">
					404 // NOT FOUND
				</h1>
				<p className="mt-4 text-text-muted font-mono uppercase tracking-widest text-sm">
					The requested resource could not be localized.
				</p>
				<Link
					className="mt-12 font-mono text-sm uppercase tracking-[0.2em] border-b border-primary pb-1 hover:bg-primary hover:text-bg-panel-0 transition-all px-2"
					href="/"
				>
					Return to Root
				</Link>
			</div>
		</section>
	);
}
