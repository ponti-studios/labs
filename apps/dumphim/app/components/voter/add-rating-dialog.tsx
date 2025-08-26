import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

interface AddRatingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	newRating: {
		name: string;
		verdict: "stay" | "dump" | "";
		comment: string;
	};
	handleNewRatingChange: (field: string, value: string) => void;
	submitRating: () => void;
}

export function AddRatingDialog({
	open,
	onOpenChange,
	newRating,
	handleNewRatingChange,
	submitRating,
}: AddRatingDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Rate This Relationship</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="rater-name" className="text-gray-700">
							Your Name
						</Label>
						<Input
							id="rater-name"
							value={newRating.name}
							onChange={(e) => handleNewRatingChange("name", e.target.value)}
							placeholder="Enter your name"
							className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
						/>
					</div>

					<div className="space-y-2">
						<Label className="text-gray-700">Your Verdict</Label>
						<div className="grid grid-cols-2 gap-3">
							<Button
								type="button"
								variant={newRating.verdict === "stay" ? "default" : "outline"}
								className={cn(
									"h-auto py-3",
									newRating.verdict === "stay"
										? "bg-green-600 hover:bg-green-700 text-white"
										: "border-green-200 text-green-700 hover:bg-green-50",
								)}
								onClick={() => handleNewRatingChange("verdict", "stay")}
							>
								<ThumbsUp className="h-5 w-5 mr-2" />
								Stay Together
							</Button>
							<Button
								type="button"
								variant={newRating.verdict === "dump" ? "default" : "outline"}
								className={cn(
									"h-auto py-3",
									newRating.verdict === "dump"
										? "bg-red-600 hover:bg-red-700 text-white"
										: "border-red-200 text-red-700 hover:bg-red-50",
								)}
								onClick={() => handleNewRatingChange("verdict", "dump")}
							>
								<ThumbsDown className="h-5 w-5 mr-2" />
								Dump Them
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="rating-comment" className="text-gray-700">
							Comment (Optional)
						</Label>
						<Textarea
							id="rating-comment"
							value={newRating.comment}
							onChange={(e) => handleNewRatingChange("comment", e.target.value)}
							placeholder="Share your thoughts about this relationship..."
							className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 min-h-[100px]"
						/>
					</div>

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button
							onClick={submitRating}
							disabled={!newRating.name || !newRating.verdict}
							className={cn(
								newRating.verdict === "stay"
									? "bg-green-600 hover:bg-green-700"
									: newRating.verdict === "dump"
										? "bg-red-600 hover:bg-red-700"
										: "bg-gray-600 hover:bg-gray-700",
								"text-white",
							)}
						>
							Submit Rating
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
