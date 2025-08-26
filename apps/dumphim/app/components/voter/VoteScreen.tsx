import { AlertTriangle, Heart, ThumbsDown, ThumbsUp, User } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "~/components/AuthProvider";
import type { Tracker, Vote } from "~/db/schema";
import { supabase } from "~/lib/supabaseClient";
import { generateFingerprint } from "~/lib/voter.utils";
import VoteChart from "./VoteChart";

interface VoteScreenProps {
	tracker: Tracker;
	votes: Vote[];
	onBack: () => void;
	onVoteCasted: (trackerId: string, updatedVotes: Vote[]) => void;
}

const VoteScreen: React.FC<VoteScreenProps> = ({
	tracker,
	votes,
	onBack,
	onVoteCasted,
}) => {
	const { user } = useAuth();
	const [currentVotes, setCurrentVotes] = useState<Vote[]>(votes);
	const [hasVoted, setHasVoted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fingerprint = generateFingerprint();
		let userHasVotedThisSession = false;
		if (user) {
			userHasVotedThisSession = currentVotes.some(
				(vote) => vote.userId === user.id,
			);
		} else {
			userHasVotedThisSession = currentVotes.some(
				(vote) => vote.fingerprint === fingerprint && !vote.userId,
			);
		}
		setHasVoted(userHasVotedThisSession);
	}, [currentVotes, user]);

	const handleVote = async (value: "stay" | "dump") => {
		if (hasVoted || isSubmitting) return;

		setIsSubmitting(true);
		setError(null);
		const fingerprint = generateFingerprint();
		const userId = user?.id;

		const newVotePayload: Omit<Vote, "id" | "createdAt"> = {
			value,
			fingerprint,
			userId: userId ?? null,
			trackerId: tracker.id,
			raterName: "Anonymous", // or get from user if available
			comment: null,
		};

		const optimisticVote: Vote = {
			...newVotePayload,
			id: `temp-${Date.now()}`,
			createdAt: new Date(),
		};
		const newVotesArray = [...currentVotes, optimisticVote];
		setCurrentVotes(newVotesArray);
		setHasVoted(true);

		try {
			const { data: insertedVote, error: insertError } = await supabase
				.from("votes")
				.insert({
					...newVotePayload,
					createdAt: new Date(),
				})
				.select()
				.single();

			if (insertError) {
				throw insertError;
			}

			if (insertedVote) {
				const finalVotesArray = currentVotes.map((v) =>
					v.id === optimisticVote.id ? insertedVote : v,
				);
				if (!currentVotes.find((v) => v.id === optimisticVote.id)) {
					finalVotesArray.push(insertedVote);
				}
				setCurrentVotes(finalVotesArray);
				onVoteCasted(tracker.id, finalVotesArray);
			} else {
				throw new Error("Vote not saved: No data returned from server.");
			}
		} catch (e: any) {
			console.error("Error submitting vote to Supabase:", e);
			setError(`Failed to save vote: ${e.message}. Please try again.`);
			setCurrentVotes(currentVotes);
			setHasVoted(
				currentVotes.some((vote) =>
					user
						? vote.userId === user.id
						: vote.fingerprint === fingerprint && !vote.userId,
				),
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6 p-2 md:p-4 max-w-2xl mx-auto">
			<button
				type="button"
				onClick={onBack}
				className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
			>
				<Heart size={20} className="mr-2 fill-current" />
				Back to Trackers
			</button>

			<div className="text-center space-y-4">
				{tracker.photoUrl ? (
					<img
						src={tracker.photoUrl}
						alt={tracker.name}
						className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mx-auto shadow-lg border-4 border-white dark:border-gray-700"
					/>
				) : (
					<div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto shadow-lg text-gray-500 dark:text-gray-400">
						<User size={64} />
					</div>
				)}
				<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
					{tracker.name}
				</h2>
				<p className="text-gray-600 dark:text-gray-300 px-4 text-lg">
					{tracker.description}
				</p>
			</div>

			{currentVotes.length > 0 && (
				<div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 md:p-6">
					<div className="space-y-4">
						<h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100">
							Based on {currentVotes.length} vote
							{currentVotes.length === 1 ? "" : "s"}
						</h3>
						<VoteChart votes={currentVotes} />
						{currentVotes.length < 3 && (
							<div className="flex items-center justify-center gap-2 text-sm text-yellow-700 dark:text-yellow-300 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700">
								<AlertTriangle
									size={20}
									className="text-yellow-500 dark:text-yellow-400"
								/>
								<span>Get more votes for better insights!</span>
							</div>
						)}
					</div>
				</div>
			)}

			{currentVotes.length === 0 && (
				<div className="text-center py-8 text-gray-500 dark:text-gray-400">
					<p className="text-lg">No votes yet for {tracker.name}.</p>
					<p>Be the first to share your opinion!</p>
				</div>
			)}

			{error && (
				<p className="text-center text-sm text-red-500 dark:text-red-400 py-2">
					{error}
				</p>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
				<button
					type="button"
					onClick={() => handleVote("stay")}
					disabled={hasVoted || isSubmitting}
					className="w-full flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold text-white bg-green-500 hover:bg-green-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
				>
					<ThumbsUp size={20} className="mr-2" />
					Stay Together
				</button>
				<button
					type="button"
					onClick={() => handleVote("dump")}
					disabled={hasVoted || isSubmitting}
					className="w-full flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
				>
					<ThumbsDown size={20} className="mr-2" />
					Time to Go
				</button>
			</div>

			{hasVoted && !isSubmitting && !error && (
				<p className="text-center text-sm text-gray-500 dark:text-gray-400 italic py-4">
					Thanks for voting on {tracker.name}'s situation!
				</p>
			)}
			{isSubmitting && (
				<p className="text-center text-sm text-blue-500 dark:text-blue-400 py-4">
					Submitting your vote...
				</p>
			)}
		</div>
	);
};

export default VoteScreen;
