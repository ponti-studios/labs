import { TrashIcon } from "@radix-ui/react-icons";
import React, { useCallback } from "react";
import { useDeleteIdea } from "src/services/api/ideas";
import { Idea } from "src/services/types";

import Button from "ui/Button";

type IdeaListItemProps = {
  idea: Idea;
  onDelete: () => void;
};
function IdeaListItem({ idea, onDelete }: IdeaListItemProps) {
  const mutation = useDeleteIdea();

  const deleteIdea = useCallback(async () => {
    await mutation.mutateAsync(idea.id);
    onDelete();
  }, [idea.id, mutation, onDelete]);

  return (
    <li
      key={idea.id}
      className="border-y-zinc-900 border-b-2 pt-4 pb-2 text-primary grid grid-cols-12"
    >
      <p className="col-start-7 col-span-6 md:col-start-10 md:col-span-3 text-end text-zinc-500">
        {idea.createdAt.toISOString().split("T")[0]}
      </p>
      <p className="row-start-2 col-span-12 whitespace-pre-wrap">
        {idea.description}
      </p>
      <Button
        isLoading={mutation.isLoading}
        className="btn btn-ghost col-start-12 flex justify-end text-red-500"
        onClick={deleteIdea}
      >
        {!mutation.isLoading && <TrashIcon />}
      </Button>
    </li>
  );
}

export default React.memo(IdeaListItem);
