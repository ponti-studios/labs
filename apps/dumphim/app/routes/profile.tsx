"use client";

import { useEffect, useState } from "react";
import { useAuth } from "~/components/AuthProvider";
import { COLOR_THEMES } from "~/components/voter/card-theme-picker";
import { PersonCardDisplay } from "~/components/voter/person-card-display";
import { PERSONALITY_TYPES } from "~/components/voter/personality-type-picker";
import { supabase } from "~/lib/supabaseClient";

// Assuming a similar structure for trackers as in all-trackers.tsx
interface FetchedTracker {
	id: string;
	name: string;
	hp: string | null;
	card_type: string | null;
	description: string | null;
	attacks: Array<{ name: string; damage: number }> | null;
	strengths: string[];
	flaws: string[];
	commitment_level: string | null;
	color_theme: string | null;
	photo_url: string | null;
	image_scale: number | null;
	image_position: { x: number; y: number } | null;
	user_id: string;
	created_at: string;
}

export function ProfilePage() {
	const { user } = useAuth();
	const [createdTrackers, setCreatedTrackers] = useState<FetchedTracker[]>([]);
	// Placeholder for voted trackers - implement when voting is saved to DB
	// const [votedTrackers, setVotedTrackers] = useState<FetchedTracker[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!user) {
			setLoading(false);
			return;
		}

		const fetchUserData = async () => {
			setLoading(true);
			setError(null);
			try {
				// Fetch trackers created by the user
				const { data: createdData, error: createdError } = await supabase
					.from("trackers")
					.select("*")
					.eq("user_id", user.id);

				if (createdError) {
					throw createdError;
				}
				setCreatedTrackers(createdData as FetchedTracker[]);

				// Placeholder for fetching voted trackers
				// const { data: votedData, error: votedError } = await supabase
				// .from("votes") // Assuming a 'votes' table
				// .select("tracker_id(*)") // Adjust based on your schema
				// .eq("user_id", user.id);
				// if (votedError) throw votedError;
				// setVotedTrackers(votedData.map(v => v.tracker_id) as FetchedTracker[]);
			} catch (e: any) {
				console.error("Error fetching profile data:", e);
				setError(e.message);
				setCreatedTrackers([]);
				// setVotedTrackers([]);
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [user]);

	if (loading) {
		return <div className="text-center py-10">Loading profile...</div>;
	}

	if (!user) {
		return (
			<div className="text-center py-10">
				Please log in to view your profile.
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-10 text-red-500">
				Error loading profile: {error}
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
			<div className="mb-10 p-6 bg-white shadow rounded-lg">
				<h1 className="text-3xl font-bold mb-4">My Profile</h1>
				<p className="text-lg">
					<span className="font-semibold">Email:</span> {user.email || "N/A"}
				</p>
				{/* Add other user profile details here as needed */}
			</div>

			<section className="mb-12">
				<h2 className="text-2xl font-semibold mb-6">Trackers I've Created</h2>
				{createdTrackers.length === 0 ? (
					<p>You haven't created any trackers yet.</p>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{createdTrackers.map((tracker) => {
							const cardData = {
								name: tracker.name,
								hp: tracker.hp ?? undefined,
								cardType: tracker.card_type ?? undefined,
								description: tracker.description ?? undefined,
								attacks: tracker.attacks ?? [],
								flaws: Array.isArray(tracker.flaws) ? tracker.flaws : [],
								strengths: Array.isArray(tracker.strengths)
									? tracker.strengths
									: [],
								commitmentLevel: tracker.commitment_level ?? undefined,
							};
							const selectedTheme =
								COLOR_THEMES.find(
									(theme) => theme.value === tracker.color_theme,
								) || COLOR_THEMES[0];
							const selectedType =
								PERSONALITY_TYPES.find(
									(type) => type.value === tracker.card_type,
								) || PERSONALITY_TYPES[0];

							return (
								<div key={tracker.id} className="flex justify-center">
									<PersonCardDisplay
										cardData={cardData}
										selectedTheme={selectedTheme}
										selectedType={selectedType}
										image={tracker.photo_url}
										imageScale={tracker.image_scale || 1}
										imagePosition={tracker.image_position || { x: 0, y: 0 }}
									/>
								</div>
							);
						})}
					</div>
				)}
			</section>

			<section>
				<h2 className="text-2xl font-semibold mb-6">Trackers I've Voted On</h2>
				<p className="text-gray-500">
					(Feature coming soon: Display trackers you've voted on here.)
				</p>
				{/* Placeholder for displaying voted trackers
				{votedTrackers.length === 0 ? (
					<p>You haven't voted on any trackers yet.</p>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{votedTrackers.map((tracker) => (
							// ... display logic for voted trackers ...
						))}
					</div>
				)}
				*/}
			</section>
		</div>
	);
}

export default ProfilePage;
