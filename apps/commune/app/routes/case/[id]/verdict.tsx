import { useLoaderData, useNavigate, useFetcher } from "react-router";
import VerdictScreen from "~/components/verdict/VoteScreen";
import { getCase, getVerdictsByCase } from "~/lib/server/queries";
import { createVerdict } from "~/lib/server/mutations";
import type { Route } from "../../../+types/root";

export const loader = async (loaderData: Route.LoaderArgs) => {
  const caseId = loaderData.params.id;
  if (!caseId) throw new Response("Missing caseId", { status: 400 });

  const caseRecord = await getCase(caseId);
  if (!caseRecord) throw new Response("Not found", { status: 404 });

  const verdicts = await getVerdictsByCase(caseId);
  return { caseRecord, verdicts };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const caseId = params.id;
  if (!caseId) throw new Response("Missing caseId", { status: 400 });

  const formData = await request.formData();
  const value = formData.get("value") as "stay" | "dump";
  const fingerprint = formData.get("fingerprint") as string;
  const userId = formData.get("userId") as string | null;
  const comment = formData.get("comment") as string | null;

  if (!value || !fingerprint) return { error: "Missing required fields" };

  try {
    const verdict = await createVerdict({ value, fingerprint, userId, caseId, comment });
    return { success: true, verdict };
  } catch (error) {
    console.error("Error creating verdict:", error);
    return { error: "Failed to create verdict" };
  }
};

export default function CaseVerdictRoute() {
  const { caseRecord, verdicts } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const handleVerdictCast = (caseId: string, _updatedVerdicts: typeof verdicts) => {
    navigate(`/case/${caseId}`);
  };

  return (
    <VerdictScreen
      caseRecord={caseRecord}
      votes={verdicts}
      onBack={() => navigate(`/case/${caseRecord.id}`)}
      onVoteCasted={handleVerdictCast}
      fetcher={fetcher}
    />
  );
}
