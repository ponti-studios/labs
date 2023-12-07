import { Link, useNavigate, useParams } from "react-router-dom";

import AlertError from "ui/AlertError";
import UserPlus from "ui/Icons/UserPlus";
import LoadingScene from "ui/Loading";

import DashboardWrap from "src/components/DashboardWrap";
import { useGetList } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";

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
    <DashboardWrap>
      {!data && <AlertError error="We could not find this list." />}
      {data && (
        <div className="flex flex-col px-0.5">
          <h1 className="mb-8 text-3xl font-semibold">{data.name}</h1>
          {data.items.map((place) => (
            <div key={place.id} className="flex flex-col mb-10">
              <span className="mb-1 text-lg text-primary font-medium">
                {place.name}
              </span>
              <span className="mb-1 text-sm text-gray-500">
                {place.googleMapsId}
              </span>
              <div className="flex gap-2">
                {place.types.map((type) => (
                  <span
                    key={type}
                    className="text-sm text-gray-200 bg-accent rounded p-1"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          ))}
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
    </DashboardWrap>
  );
};

export default List;
