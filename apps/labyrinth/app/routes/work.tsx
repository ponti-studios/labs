import { SelectedWork } from "~/components/studio/selected-work";
import { t } from "~/translations";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: "Selected Work | Ponti Studios" },
    { name: "description", content: t.services.proof.intro },
  ];
}

export default function Work() {
  return (
    <div className="flex w-full flex-col px-4 sm:px-6">
      <SelectedWork bordered={false} />
    </div>
  );
}
