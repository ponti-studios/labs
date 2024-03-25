import { SyntheticEvent, useCallback, useState } from "react";
import FeedbackBlock from "ui/FeedbackBlock";
import Button from "ui/Button";

import { useCreateIdea } from "src/services/api/ideas";

type IdeaFormProps = {
  onCreate: () => void;
};
export default function IdeaForm({ onCreate }: IdeaFormProps) {
  const [description, setDescription] = useState("");
  const {
    error,
    isLoading,
    isSuccess,
    mutateAsync: createIdea,
  } = useCreateIdea();

  const onFormSubmit = useCallback(
    async (e: SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      await createIdea(description);

      if (isSuccess) {
        onCreate();
      }
    },
    [createIdea, isSuccess, description, onCreate],
  );

  const onDescriptionChange = useCallback(
    (e: SyntheticEvent<HTMLTextAreaElement>) => {
      setDescription(e.currentTarget.value);
    },
    [setDescription],
  );

  return (
    <>
      {error && <FeedbackBlock type="error">{error as string}</FeedbackBlock>}

      <form onSubmit={onFormSubmit}>
        <div className="form-control w-full mb-2">
          <label className="label hidden" htmlFor="idea">
            <span className="label-text">Description</span>
          </label>
          <textarea
            id="idea"
            placeholder="What's happening?"
            className="textarea w-full text-lg p-2 border-stone-300 rounded placeholder:text-zinc-400"
            value={description}
            onChange={onDescriptionChange}
          />
        </div>
        {!!description.length && <Button isLoading={isLoading}>Submit</Button>}
      </form>
    </>
  );
}
