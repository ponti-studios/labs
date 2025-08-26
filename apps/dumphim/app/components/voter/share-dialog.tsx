import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

interface ShareDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	cardName: string;
	copyShareLink: () => void;
}

export function ShareDialog({
	open,
	onOpenChange,
	cardName,
	copyShareLink,
}: ShareDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share for Friend Ratings</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<p className="text-sm text-gray-600">
						Share this link with friends to get their opinion on your
						relationship with {cardName}.
					</p>

					<div className="flex items-center space-x-2">
						<Input
							readOnly
							value={`https://partner-cards.example.com/share/${cardName.toLowerCase()}-123456`}
							className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
						/>
						<Button onClick={copyShareLink} className="shrink-0">
							Copy
						</Button>
					</div>

					<div className="flex flex-col space-y-2">
						<p className="text-sm font-medium text-gray-700">Share via</p>
						<div className="flex space-x-2">
							<Button variant="outline" className="flex-1">
								<svg
									className="h-5 w-5 mr-2"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
										clipRule="evenodd"
									/>
								</svg>
								Facebook
							</Button>
							<Button variant="outline" className="flex-1">
								<svg
									className="h-5 w-5 mr-2"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
								</svg>
								Twitter
							</Button>
							<Button variant="outline" className="flex-1">
								<svg
									className="h-5 w-5 mr-2"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M18.042 13.046c0-2.67-2.4-4.838-5.354-4.838-2.954 0-5.354 2.167-5.354 4.838 0 2.394 2.124 4.392 4.992 4.77.194.033.472.1.54.229.062.117.04.3.02.42l-.087.52c-.027.156-.126.607.532.331.658-.276 3.555-2.094 4.853-3.585.896-.823 1.858-1.962 1.858-3.685zm-5.354-6.354c3.64 0 6.604 2.851 6.604 6.354 0 2.07-1.17 3.43-2.158 4.378-1.436 1.382-4.506 3.525-5.246 3.838-.74.314-1.737.03-1.615-.917l.04-.245c.02-.12.044-.25.044-.372 0-.12-.036-.283-.095-.363-.142-.196-.498-.295-.662-.325-3.35-.44-5.866-2.896-5.866-5.755 0-3.503 2.964-6.354 6.604-6.354z"
										clipRule="evenodd"
									/>
								</svg>
								Messages
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
