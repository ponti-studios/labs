import { MessageSquare, Share2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { AddRatingDialog } from "~/components/voter/add-rating-dialog";
import { ShareDialog } from "~/components/voter/share-dialog";
import { supabase } from "~/lib/supabaseClient";
import { cn } from "~/lib/utils";

// Define Rating type here if not imported
interface Rating {
	id: string;
	name: string;
	verdict: "stay" | "dump";
	comment: string;
	date: Date;
}

export function CardRatingsPage() {
	const { id: trackerId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	// Tracker name fetched from DB
	const [cardName, setCardName] = useState<string>("Partner");
	// Fetch the tracker name when the ID changes
	useEffect(() => {
		if (!trackerId) return;
		const fetchTracker = async () => {
			const { data, error } = await supabase
				.from("trackers")
				.select("name")
				.eq("id", trackerId)
				.single();
			if (!error && data?.name) {
				setCardName(data.name);
			}
		};
		fetchTracker();
	}, [trackerId]);

	const [ratings, setRatings] = useState<Rating[]>([
		{
			id: "1",
			name: "Jamie",
			verdict: "stay",
			comment: "They seem really caring and thoughtful. Definitely a keeper!",
			date: new Date(Date.now() - 86400000 * 2),
		},
		{
			id: "2",
			name: "Taylor",
			verdict: "dump",
			comment:
				"Too stubborn for my taste. You deserve someone who listens more.",
			date: new Date(Date.now() - 86400000),
		},
		{
			id: "3",
			name: "Jordan",
			verdict: "stay",
			comment:
				"You two are perfect together! Love how they surprise you with gifts.",
			date: new Date(),
		},
	]);

	const [newRating, setNewRating] = useState({
		name: "",
		verdict: "" as "stay" | "dump" | "",
		comment: "",
	});

	const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
	const [shareDialogOpen, setShareDialogOpen] = useState(false);

	const [stayCountFetched, setStayCountFetched] = useState(0);
	const [dumpCountFetched, setDumpCountFetched] = useState(0);
	const [totalRatingsFetched, setTotalRatingsFetched] = useState(0);
	const [stayPercentageFetched, setStayPercentageFetched] = useState(0);
	const [loadingResults, setLoadingResults] = useState(false);
	const [errorResults, setErrorResults] = useState<string | null>(null);

	useEffect(() => {
		if (!trackerId) {
			setStayCountFetched(0);
			setDumpCountFetched(0);
			setTotalRatingsFetched(0);
			setStayPercentageFetched(0);
			setErrorResults(null);
			setLoadingResults(false);
			return;
		}

		const fetchResults = async () => {
			setLoadingResults(true);
			setErrorResults(null);
			try {
				const { count: fetchedStayCount, error: stayError } = await supabase
					.from("votes")
					.select("*", { count: "exact", head: true })
					.eq("tracker_id", trackerId)
					.eq("value", "stay");

				if (stayError) throw stayError;

				const { count: fetchedDumpCount, error: dumpError } = await supabase
					.from("votes")
					.select("*", { count: "exact", head: true })
					.eq("tracker_id", trackerId)
					.eq("value", "dump");

				if (dumpError) throw dumpError;

				const currentStayCount = fetchedStayCount || 0;
				const currentDumpCount = fetchedDumpCount || 0;
				const total = currentStayCount + currentDumpCount;
				const percentage =
					total > 0 ? Math.round((currentStayCount / total) * 100) : 0;

				setStayCountFetched(currentStayCount);
				setDumpCountFetched(currentDumpCount);
				setTotalRatingsFetched(total);
				setStayPercentageFetched(percentage);
			} catch (err: any) {
				setErrorResults(err.message || "Failed to fetch results");
				setStayCountFetched(0);
				setDumpCountFetched(0);
				setTotalRatingsFetched(0);
				setStayPercentageFetched(0);
			} finally {
				setLoadingResults(false);
			}
		};

		fetchResults();
	}, [trackerId]);

	const handleNewRatingChange = (field: string, value: string) => {
		setNewRating((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const submitRating = () => {
		if (!newRating.name || !newRating.verdict) return;

		const newRatingObj: Rating = {
			id: Date.now().toString(),
			name: newRating.name,
			verdict: newRating.verdict as "stay" | "dump",
			comment: newRating.comment,
			date: new Date(),
		};

		setRatings((prev) =>
			[...prev, newRatingObj].sort(
				(a, b) => b.date.getTime() - a.date.getTime(),
			),
		);
		setNewRating({ name: "", verdict: "", comment: "" });
		setRatingDialogOpen(false);
	};

	const copyShareLink = () => {
		if (!trackerId) return;
		const link = `${window.location.origin}/tracker/${trackerId}`;
		navigator.clipboard.writeText(link);
		alert(`Share link copied to clipboard: ${link}`);
	};

	return (
		<div className="container mx-auto p-4 md:p-8">
			<Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
				Back to Card Editor
			</Button>
			<div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="text-lg sm:text-xl font-semibold text-gray-900">
							Friend Ratings for {cardName}
						</h3>
						<p className="text-sm text-gray-500">
							{totalRatingsFetched > 0
								? `${totalRatingsFetched} ${totalRatingsFetched === 1 ? "vote has" : "votes have"} been cast`
								: "No votes cast yet"}
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							className="text-xs"
							onClick={() => setShareDialogOpen(true)}
						>
							<Share2 className="h-3 w-3 mr-1" />
							Share
						</Button>
					</div>
				</div>

				<div className="space-y-4 mb-6">
					{loadingResults ? (
						<div className="text-center py-4">Loading results...</div>
					) : errorResults ? (
						<div className="text-center py-4 text-red-500">
							Error: {errorResults}
						</div>
					) : totalRatingsFetched > 0 ? (
						<>
							<div className="bg-white p-4 rounded-lg border border-gray-200">
								<h3 className="text-lg font-semibold text-center mb-2">
									Overall Verdict
								</h3>
								<div className="flex justify-center mb-4">
									<div
										className={cn(
											"text-center px-4 py-2 rounded-full font-bold",
											stayPercentageFetched >= 50
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800",
										)}
									>
										{stayPercentageFetched >= 50
											? "Stay Together"
											: "Consider Breaking Up"}
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="font-medium">Stay</span>
										<span>{stayPercentageFetched}%</span>
									</div>
									<Progress
										value={stayPercentageFetched}
										className="h-2 bg-green-500"
									/>

									<div className="flex justify-between text-sm">
										<span className="font-medium">Dump</span>
										<span>{100 - stayPercentageFetched}%</span>
									</div>
									<Progress
										value={100 - stayPercentageFetched}
										className="h-2 bg-red-500"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<h3 className="font-medium">Rating Breakdown</h3>
								<div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
									<div className="flex justify-between mb-1">
										<span>Total Votes</span>
										<span className="font-medium">{totalRatingsFetched}</span>
									</div>
									<div className="flex justify-between mb-1">
										<span>Stay Votes</span>
										<span className="font-medium text-green-600">
											{stayCountFetched}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Dump Votes</span>
										<span className="font-medium text-red-600">
											{dumpCountFetched}
										</span>
									</div>
								</div>
							</div>
							<div className="pt-2 flex justify-start">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setRatingDialogOpen(true);
									}}
								>
									Add Your Rating
								</Button>
							</div>
						</>
					) : (
						<div className="text-center py-4 text-gray-500">
							No ratings submitted yet. Be the first!
							<div className="mt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setRatingDialogOpen(true);
									}}
								>
									Add Your Rating
								</Button>
							</div>
						</div>
					)}
				</div>

				<h4 className="text-md font-semibold mb-3">
					Individual Comments ({ratings.length})
				</h4>
				<div className="space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2">
					{ratings.length > 0 ? (
						ratings.map((rating) => (
							<div
								key={rating.id}
								className="p-3 bg-white rounded-lg border border-gray-200"
							>
								<div className="flex justify-between items-start mb-2">
									<div className="flex items-center">
										<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
											{rating.name.charAt(0).toUpperCase()}
										</div>
										<div className="ml-2">
											<p className="font-medium text-gray-900">{rating.name}</p>
											<p className="text-xs text-gray-500">
												{rating.date.toLocaleDateString(undefined, {
													month: "short",
													day: "numeric",
												})}
											</p>
										</div>
									</div>
									<div
										className={cn(
											"px-2 py-1 rounded-full text-xs font-medium",
											rating.verdict === "stay"
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800",
										)}
									>
										{rating.verdict === "stay" ? "Stay" : "Dump"}
									</div>
								</div>
								<p className="text-sm text-gray-700">{rating.comment}</p>
							</div>
						))
					) : (
						<div className="text-center py-6">
							<MessageSquare className="h-8 w-8 mx-auto text-gray-400 mb-2" />
							<p className="text-gray-500">No ratings yet for {cardName}</p>
						</div>
					)}
				</div>

				<div className="mt-6">
					<Button
						className="w-full bg-black hover:bg-gray-800 text-white"
						onClick={() => setRatingDialogOpen(true)}
					>
						<Users className="h-4 w-4 mr-2" />
						Add Friend Rating
					</Button>
				</div>
			</div>

			<AddRatingDialog
				open={ratingDialogOpen}
				onOpenChange={setRatingDialogOpen}
				newRating={newRating}
				handleNewRatingChange={handleNewRatingChange}
				submitRating={submitRating}
			/>

			<ShareDialog
				open={shareDialogOpen}
				onOpenChange={setShareDialogOpen}
				copyShareLink={copyShareLink}
				cardName={cardName}
			/>
		</div>
	);
}

export default CardRatingsPage;
