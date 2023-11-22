import { Link, useNavigate } from "react-router-dom";
import LoadingScene from "ui/Loading";

import DashboardNav from "src/components/DashboardNav";
import { useGetLists } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

import ListForm from "./components/ListForm";
import FeedbackBlock from "src/components/FeedbackBlock";

const Lists = () => {
  const navigate = useNavigate();
  const user = useAppSelector(getUser);
  const { data, error, refetch, status: listsStatus } = useGetLists();

  if (!user) {
    navigate("/");
  }

  return (
    <div className="flex flex-col flex-1 px-4 sm:max-w-2xl mx-auto">
      <DashboardNav />
      <ListForm onCreate={refetch} />
      <div>
        {listsStatus === "loading" && <LoadingScene />}
        {error && <FeedbackBlock>{error.message}</FeedbackBlock>}
        {data?.length === 0 && "Your lists will appear here."}
        {data && data.length > 0 && (
          <ul className="space-y-2">
            {data.map((list) => (
              <li key={list.id} className="card shadow-md p-4 text-lg">
                <Link to={`/list/${list.id}`}>{list.name}</Link>
                {/* Only display list owner if the list does not belong to current user */}
                {list.createdBy.email !== user?.email && (
                  <p className="text-xs text-gray-400">{user.email}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Lists;
