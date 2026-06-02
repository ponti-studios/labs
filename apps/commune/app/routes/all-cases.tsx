import { useLoaderData } from "react-router";
import type { Route } from "./+types/all-cases";
import { COLOR_THEMES } from "~/components/verdict/card-theme-picker";
import { PersonCardDisplay } from "~/components/verdict/person-card-display";
import { PERSONALITY_TYPES } from "~/components/verdict/personality-type-picker";
import { getCasesWithStats } from "~/lib/server/queries";
import { withCache, CACHE_TTL } from "~/lib/server/cache";

export async function loader(_args: Route.LoaderArgs) {
  const cases = await withCache("cases:list:all", () => getCasesWithStats(), CACHE_TTL.CASE_LIST);
  return { cases };
}

export default function AllCasesPage() {
  const { cases } = useLoaderData<typeof loader>();

  if (cases.length === 0) {
    return <div className="text-center py-10">No cases found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-10">All Cases</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cases.map((c) => {
          const cardData = {
            name: c.name,
            hp: c.hp,
            cardType: c.cardType,
            description: c.description,
            attacks: c.attacks,
            flaws: c.flaws,
            strengths: c.strengths,
            commitmentLevel: c.commitmentLevel,
          };
          const selectedTheme =
            COLOR_THEMES.find((t) => t.value === c.colorTheme) || COLOR_THEMES[0];
          const selectedType =
            PERSONALITY_TYPES.find((t) => t.value === c.cardType) || PERSONALITY_TYPES[0];
          return (
            <div key={c.id} className="flex justify-center">
              <PersonCardDisplay
                cardData={cardData}
                selectedTheme={selectedTheme}
                selectedType={selectedType}
                image={c.photoUrl}
                imageScale={c.imageScale ?? 1}
                imagePosition={c.imagePosition ?? { x: 0, y: 0 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
