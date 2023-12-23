import { SyntheticEvent, useCallback, useState } from "react";

import AlertError from "ui/AlertError";
import Button from "ui/Button";

import { useCreateListInvite } from "src/services/api";
import { ListInvite } from "src/services/types";
import { AxiosError } from "axios";

type ListInviteFormProps = {
  listId: string;
  onCreate: (invite: ListInvite) => void;
};
export default function ListInviteForm({
  listId,
  onCreate,
}: ListInviteFormProps) {
  const [email, setEmail] = useState("");
  const {
    error,
    isLoading,
    isSuccess,
    mutateAsync: createListInvite,
  } = useCreateListInvite();

  const onFormSubmit = useCallback(
    async (e: SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      const invite = await createListInvite({ email, id: listId });

      if (isSuccess) {
        onCreate(invite);
      }
    },
    [createListInvite, email, isSuccess, listId, onCreate],
  );

  const onEmailChange = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      setEmail(e.currentTarget.value);
    },
    [setEmail],
  );

  return (
    <div className="mb-8">
      <div className="my-4">
        {error && <AlertError error={(error as AxiosError).message} />}
      </div>
      <form onSubmit={onFormSubmit}>
        <div className="form-control w-full">
          <label className="label" htmlFor="email">
            <span className="label-text text-primary-focus font-bold">
              Invite someone
            </span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="What's their email?"
            className="input w-full text-lg p-2 border-stone-300 rounded placeholder:text-zinc-400"
            value={email}
            onChange={onEmailChange}
          />
        </div>
        {!!email.length && (
          <Button className="mt-2 float-right w-2/5" loading={isLoading}>
            Submit
          </Button>
        )}
      </form>
    </div>
  );
}
