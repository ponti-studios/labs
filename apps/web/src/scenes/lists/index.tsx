import { Link, useNavigate } from "react-router-dom";
import LoadingScene from "ui/Loading";

import DashboardNav from "src/components/DashboardNav";
import { useGetLists } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

import ListForm from "./components/ListForm";

const Lists = () => {
  const navigate = useNavigate();
  const user = useAppSelector(getUser);
  const { data, refetch, status: listsStatus } = useGetLists();

  if (!user) {
    navigate("/");
  }

  return (
    <>
      <DashboardNav />
      <h1>Lists</h1>
      <ListForm onCreate={refetch} />
      <div>
        {listsStatus === "loading" && <LoadingScene />}
        {data?.length === 0 && "Your lists will appear here."}
        {data && data.length > 0 && (
          <ul className="space-y-2">
            {data.map((list) => (
              <li key={list.listId} className="card shadow-md p-4 text-lg">
                <Link to={`/list/${list.listId}`}>{list.list.name}</Link>
                {/* Only display list owner if the list does not belong to current user */}
                {list.user.email !== user?.email && (
                  <p className="text-xs text-gray-400">{user.email}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Lists;
