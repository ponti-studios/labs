import { useLoaderData } from "react-router";
import type { Route } from "./+types/profile";
import { COLOR_THEMES } from "~/components/verdict/card-theme-picker";
import { PersonCardDisplay } from "~/components/verdict/person-card-display";
import { PERSONALITY_TYPES } from "~/components/verdict/personality-type-picker";
import { getCurrentUser } from "~/lib/auth-server";
import { getCasesByUser } from "~/lib/server/queries";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getCurrentUser(request);
  const userId = user?.id ?? "demo-user-id";
  const cases = await getCasesByUser(userId);
  return { cases };
}

export function ProfilePage() {
  const { cases } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Cases</h2>
        {cases.length === 0 ? (
          <p className="text-gray-500">You haven&apos;t created any cases yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => {
              const cardData = {
                name: c.name,
                hp: c.hp,
                cardType: c.cardType,
                description: c.description,
                attacks: c.attacks ?? [],
                flaws: Array.isArray(c.flaws) ? c.flaws : [],
                strengths: Array.isArray(c.strengths) ? c.strengths : [],
                commitmentLevel: c.commitmentLevel,
              };
              const selectedTheme = COLOR_THEMES.find((t) => t.value === c.colorTheme) || COLOR_THEMES[0];
              const selectedType = PERSONALITY_TYPES.find((t) => t.value === c.cardType) || PERSONALITY_TYPES[0];
              return (
                <div key={c.id} className="flex justify-center">
                  <PersonCardDisplay
                    cardData={cardData}
                    selectedTheme={selectedTheme}
                    selectedType={selectedType}
                    image={c.photoUrl}
                    imageScale={c.imageScale || 1}
                    imagePosition={c.imagePosition || { x: 0, y: 0 }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Cases You&apos;ve Weighed In On</h2>
        <p className="text-gray-500">Coming soon...</p>
      </div>
    </div>
  );
}
