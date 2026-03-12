import { ArrowRight } from "lucide-react";

export const ArrowListItem = ({ children }: { children: React.ReactNode }) => (
	<li className="flex items-center gap-2">
		<ArrowRight size={16} /> {children}
	</li>
);
