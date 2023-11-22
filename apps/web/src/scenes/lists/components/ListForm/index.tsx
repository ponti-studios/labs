import { SyntheticEvent, useCallback, useState } from "react";
import { useMutation } from "react-query";
import AlertError from "ui/AlertError";

import api, { URLS } from "src/services/api";

type ListFormProps = {
  onCreate: () => void;
};
export default function ListForm({ onCreate }: ListFormProps) {
  const [name, setName] = useState("");
  const {
    error,
    isLoading,
    mutate: createList,
  } = useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post(URLS.lists, {
        name,
      });
      return res.data;
    },
    onSuccess: () => {
      onCreate();
    },
  });
  const onNameChange = useCallback(
    (e: SyntheticEvent<HTMLInputElement>) => {
      setName(e.currentTarget.value);
    },
    [setName],
  );
  const onFormSubmit = useCallback(
    async (e: SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      createList(name);
    },
    [createList, name],
  );

  return (
    <>
      {error && <AlertError error={error as string} />}

      <form onSubmit={onFormSubmit}>
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
        {!!name.length && (
          <button
            className={`btn btn-primary w-full mb-4 rounded box-border ${
              isLoading ? "loading" : ""
            }`}
          >
            Submit
          </button>
        )}
      </form>
    </>
  );
}
