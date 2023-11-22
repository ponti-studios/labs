import { Link, useNavigate } from "react-router-dom";

import AlertError from "ui/AlertError";
import UserPlus from "ui/Icons/UserPlus";
import LoadingScene from "ui/Loading";

import DashboardNav from "src/components/DashboardNav";
import { useGetList } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";
import { useParams } from "@reach/router";

const List = () => {
  const navigate = useNavigate();
  const params = useParams();
  const user = useAppSelector(getUser);
  const listId = params.id as string;
  const { data, status: listStatus } = useGetList(listId);

  if (!user) {
    navigate("/");
  }

  if (listStatus === "loading") {
    return <LoadingScene />;
  }

  return (
    <>
      <DashboardNav />
      {!data && <AlertError error="We could not find this list." />}
      {data && (
        <div className="flex flex-col px-0.5">
          <h1 className="mb-1">{data.name}</h1>
          {/* Only the owner of the list can invite other users */}
          {data.userId === user.id && (
            <Link to={`/list/${data.id}/invites`}>
              <span className="text-blue-500 text-lg hover:cursor-pointer">
                <UserPlus stroke="black" className="w-6 h-6" />
              </span>
            </Link>
          )}
        </div>
      )}
    </>
  );
};

export default List;
