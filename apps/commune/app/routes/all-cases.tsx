import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/all-cases";
import { COLOR_THEMES } from "~/components/verdict/card-theme-picker";
import { PersonCardCompact } from "~/components/verdict/person-card-compact";
import { PERSONALITY_TYPES } from "~/components/verdict/personality-type-picker";
import { getCasesWithStats } from "~/lib/server/queries";
import { withCache, CACHE_TTL } from "~/lib/server/cache";

export async function loader(_args: Route.LoaderArgs) {
  const cases = await withCache("cases:list:all", () => getCasesWithStats(), CACHE_TTL.CASE_LIST);
  return { cases };
}

export default function RosterPage() {
  const { cases } = useLoaderData<typeof loader>();

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-5">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">Your roster is empty</p>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Add someone you're talking to and let your friends weigh in anonymously.
          </p>
        </div>
        <Link
          to="/case/create"
          className="bg-foreground text-background px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add someone
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">The Roster</h1>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
            {cases.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cases.map((c) => {
          const selectedTheme = COLOR_THEMES.find((t) => t.value === c.colorTheme) ?? COLOR_THEMES[0];
          const selectedType = PERSONALITY_TYPES.find((t) => t.value === c.cardType?.toLowerCase()) ?? PERSONALITY_TYPES[0];
          const vibes = c.voteStats.stay;
          const icks = c.voteStats.total - c.voteStats.stay;

          return (
            <Link key={c.id} to={`/case/${c.id}`} className="block">
              <PersonCardCompact
                name={c.name}
                hp={c.hp}
                photoUrl={c.photoUrl}
                imageScale={c.imageScale ?? 1}
                imagePosition={c.imagePosition ?? { x: 0, y: 0 }}
                selectedTheme={selectedTheme}
                selectedType={selectedType}
                vibes={vibes}
                icks={icks}
              />
            </Link>
          );
        })}

        <div className="flex flex-col gap-2">
          <Link
            to="/case/create"
            className="border border-dashed border-green-400 rounded-xl flex flex-col items-center justify-center gap-2 text-green-600 hover:bg-green-50 hover:border-green-500 transition-colors"
            style={{ height: 160 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-xs">Add someone</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
