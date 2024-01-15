import { Link, useNavigate } from "react-router-dom";
import LoadingScene from "ui/Loading";

import DashboardWrap from "src/components/DashboardWrap";
import FeedbackBlock from "src/components/FeedbackBlock";
import { useGetLists } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

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
  const user = useAppSelector(getUser);
  const { data, error, refetch, status: listsStatus } = useGetLists();

  if (!user) {
    navigate("/");
  }

  return (
    <DashboardWrap className="flex gap-4">
      <h1 className="text-3xl font-bold">Lists</h1>
      <ListForm onCreate={refetch} />
      <div>
        {listsStatus === "loading" && <LoadingScene />}
        {error && <FeedbackBlock>{error.message}</FeedbackBlock>}
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
    </DashboardWrap>
  );
};

export default Lists;
