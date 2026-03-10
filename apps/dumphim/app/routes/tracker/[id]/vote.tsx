import { eq } from "drizzle-orm";
import { useLoaderData, useNavigate, useFetcher } from "react-router";
import VoteScreen from "~/components/voter/VoteScreen";
import { db } from "~/lib/db";
import { trackers, votes } from "@pontistudios/db/schema";
import { createVote } from "~/lib/server/mutations";
import type { Route } from "../../../+types/root";

export const loader = async (loaderData: Route.LoaderArgs) => {
  const trackerId = loaderData.params.id;
  if (!trackerId) throw new Response("Missing trackerId", { status: 400 });

  const tracker = await db.query.trackers.findFirst({
    where: eq(trackers.id, trackerId),
  });
  if (!tracker) throw new Response("Not found", { status: 404 });

  const trackerVotes = await db.query.votes.findMany({
    where: eq(votes.trackerId, trackerId),
  });

  return { tracker, votes: trackerVotes };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const trackerId = params.id;
  if (!trackerId) throw new Response("Missing trackerId", { status: 400 });

  const formData = await request.formData();
  const value = formData.get("value") as "stay" | "dump";
  const fingerprint = formData.get("fingerprint") as string;
  const userId = formData.get("userId") as string | null;
  const raterName = (formData.get("raterName") as string) || "Anonymous";
  const comment = formData.get("comment") as string | null;

  if (!value || !fingerprint) {
    return { error: "Missing required fields" };
  }

  try {
    const vote = await createVote({
      value,
      fingerprint,
      userId,
      trackerId,
      raterName,
      comment,
    });
    return { success: true, vote };
  } catch (error) {
    console.error("Error creating vote:", error);
    return { error: "Failed to create vote" };
  }
};

export default function TrackerVoteRoute() {
  const { tracker, votes } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const handleVoteCasted = (trackerId: string, _updatedVotes: typeof votes) => {
    navigate(`/tracker/${trackerId}`);
  };

  return (
    <VoteScreen
      tracker={tracker}
      votes={votes}
      onBack={() => navigate(`/tracker/${tracker.id}`)}
      onVoteCasted={handleVoteCasted}
      fetcher={fetcher}
    />
  );
}
