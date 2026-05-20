import type { LoaderFunctionArgs } from "react-router";
import { getRandomCards, TAROT_SPREADS } from "~/lib/tarot-cards";
import type { TarotSpreadType } from "~/lib/tarot-spreads";

const SPREAD_TYPES = new Set(Object.keys(TAROT_SPREADS) as TarotSpreadType[]);

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const spreadType = url.searchParams.get("spreadType") as TarotSpreadType | null;
  const resolvedSpreadType = spreadType && SPREAD_TYPES.has(spreadType) ? spreadType : "three_card";
  const positions = TAROT_SPREADS[resolvedSpreadType].positions.length;

  return Response.json({
    spreadType: resolvedSpreadType,
    cards: getRandomCards(positions),
  });
}
