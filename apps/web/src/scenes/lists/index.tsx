import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "ui/Button";
import FeedbackBlock from "ui/FeedbackBlock";
import LoadingScene from "ui/Loading";

import { useGetLists } from "src/services/api";
import { useAuth } from "src/services/store";

import ListForm from "./components/ListForm";

const NoResults = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-6">
      <p className="text-2xl font-bold">No lists found.</p>
      <p className="text-gray-400">
        Your lists will appear here once you create them.
      </p>
    </div>
  );
};

const Lists = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isListFormOpen, setIsListFormOpen] = useState(false);
  const { data, error, refetch, status: listsStatus } = useGetLists();

  const onAddListClick = useCallback(() => {
    setIsListFormOpen(true);
  }, [setIsListFormOpen]);

  const onListCreate = useCallback(() => {
    setIsListFormOpen(false);
    refetch();
  }, [setIsListFormOpen, refetch]);

  const onListFormCancel = useCallback(() => {
    setIsListFormOpen(false);
  }, [setIsListFormOpen]);

  if (!user) {
    navigate("/");
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Lists</h1>
      {!isListFormOpen ? (
        <div className="flex justify-end w-full mb-2">
          <Button onClick={onAddListClick} disabled={isListFormOpen}>
            Create new list
          </Button>
        </div>
      ) : null}
      {isListFormOpen ? (
        <div className="mb-4">
          <ListForm onCancel={onListFormCancel} onCreate={onListCreate} />
        </div>
      ) : null}
      <div>
        {listsStatus === "loading" && <LoadingScene />}
        {error && <FeedbackBlock type="error">{error.message}</FeedbackBlock>}
        {data?.length === 0 ? <NoResults /> : null}
        {data && data.length > 0 && (
          <ul className="space-y-2">
            {data.map((list) => (
              <li key={list.id} className="flex">
                <Link
                  className="flex justify-between items-center p-3 text-lg border rounded-md w-full"
                  to={`/list/${list.id}`}
                >
                  {list.name}
                  {/* Only display list owner if the list does not belong to current user */}
                  {list.createdBy && list.createdBy.email !== user?.email ? (
                    <p className="text-xs text-gray-400">
                      {list.createdBy.email}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Lists;
