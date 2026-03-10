/**
 * Profile Page Route
 *
 * IMPROVEMENTS:
 * - Uses auth utilities (~60% less code)
 * - Cleaner, more maintainable
 */

import { useLoaderData } from "react-router";
import type { Route } from "./+types/profile";
import { COLOR_THEMES } from "~/components/voter/card-theme-picker";
import { PersonCardDisplay } from "~/components/voter/person-card-display";
import { PERSONALITY_TYPES } from "~/components/voter/personality-type-picker";
import { getCurrentUser } from "~/lib/api/auth";
import { getTrackersByUser } from "~/lib/server/queries";

export async function loader({ request }: Route.LoaderArgs) {
  // Get authenticated user (or null if not logged in)
  const user = await getCurrentUser(request);
  const userId = user?.userId ?? "demo-user-id"; // Fallback for demo

  const trackers = await getTrackersByUser(userId);
  return { trackers };
}

export function ProfilePage() {
  const { trackers } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Trackers</h2>
        {trackers.length === 0 ? (
          <p className="text-gray-500">You haven&apos;t created any trackers yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackers.map((tracker) => {
              const cardData = {
                name: tracker.name,
                hp: tracker.hp ?? undefined,
                cardType: tracker.cardType ?? undefined,
                description: tracker.description ?? undefined,
                attacks: tracker.attacks ?? [],
                flaws: Array.isArray(tracker.flaws) ? tracker.flaws : [],
                strengths: Array.isArray(tracker.strengths) ? tracker.strengths : [],
                commitmentLevel: tracker.commitmentLevel ?? undefined,
              };

              const selectedTheme =
                COLOR_THEMES.find((theme) => theme.value === tracker.colorTheme) || COLOR_THEMES[0];
              const selectedType =
                PERSONALITY_TYPES.find((type) => type.value === tracker.cardType) ||
                PERSONALITY_TYPES[0];

              return (
                <div key={tracker.id} className="flex justify-center">
                  <PersonCardDisplay
                    cardData={cardData}
                    selectedTheme={selectedTheme}
                    selectedType={selectedType}
                    image={tracker.photoUrl}
                    imageScale={tracker.imageScale || 1}
                    imagePosition={tracker.imagePosition || { x: 0, y: 0 }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TODO: Add voted trackers section once auth is implemented */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Trackers You&apos;ve Rated</h2>
        <p className="text-gray-500">Coming soon...</p>
      </div>
    </div>
  );
}
