import { SyntheticEvent, useCallback, useState } from "react";
import { useMutation } from "react-query";

import AlertError from "ui/AlertError";

import api, { URLS } from "src/services/api";

const MIN_LENGTH = 3;

type ListFormProps = {
  onCreate: () => void;
};
export default function ListForm({ onCreate }: ListFormProps) {
  const [name, setName] = useState("");
  const { error, isLoading, mutate } = useMutation({
    mutationFn: async (e: SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      return api.post(URLS.lists, {
        name,
      });
    },
    onSuccess: () => {
      setName("");
      onCreate();
    },
  });
  const onNameChange = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      setName(e.currentTarget.value);
    },
    [setName],
  );

  return (
    <>
      {error && <AlertError error={error as string} />}

      <form onSubmit={mutate}>
        <div className="form-control w-full mb-2">
          <label className="label hidden" htmlFor="name">
            <span className="label-text">Name of list</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="What should we call this list?"
            className="input w-full text-lg p-2 border-stone-300 rounded placeholder:text-zinc-400"
            value={name}
            onChange={onNameChange}
          />
        </div>
        {name.length > MIN_LENGTH ? (
          <button
            className={`btn btn-primary w-full mb-4 rounded box-border ${
              isLoading ? "loading" : ""
            }`}
          >
            Submit
          </button>
        ) : null}
      </form>
    </>
  );
}
