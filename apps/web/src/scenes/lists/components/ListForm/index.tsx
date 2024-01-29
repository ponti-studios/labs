import { SyntheticEvent, useCallback, useState } from "react";
import { useMutation } from "react-query";
import AlertError from "ui/AlertError";
import Input from "ui/Input";

import { api, URLS } from "src/services/api/base";
import Button from "ui/Button";
import { AxiosError } from "axios";

const MIN_LENGTH = 3;

type ListFormProps = {
  onCancel: () => void;
  onCreate: () => void;
};
export default function ListForm({ onCreate, onCancel }: ListFormProps) {
  const [name, setName] = useState("");
  const { error, isLoading, mutate } = useMutation({
    mutationFn: async () => api.post(URLS.lists, { name }),
    onSuccess: () => {
      setName("");
      onCreate();
    },
  });

  const onCancelClick = useCallback(
    (e: SyntheticEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setName("");
      onCancel();
    },
    [onCancel],
  );

  const onSubmit = useCallback(
    (e: SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      return mutate();
    },
    [mutate],
  );

  const onNameChange = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      setName(e.currentTarget.value);
    },
    [setName],
  );

  return (
    <>
      {error && <AlertError error={(error as AxiosError).message} />}

      <form onSubmit={onSubmit}>
        <Input
          name="listName"
          type="text"
          label="List name"
          onChange={onNameChange}
          value={name}
        />
        <div className="btn-group-horizontal float-right">
          <Button
            className="btn-outline px-12 bordered"
            onClick={onCancelClick}
          >
            Cancel
          </Button>
          <Button
            className="px-12"
            disabled={name.length < MIN_LENGTH}
            isLoading={isLoading}
          >
            Submit
          </Button>
        </div>
      </form>
    </>
  );
}
