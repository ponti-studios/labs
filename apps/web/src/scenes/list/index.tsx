import { Link, useNavigate, useParams } from "react-router-dom";
import { TrashIcon } from "@radix-ui/react-icons";

import AlertError from "ui/AlertError";
import UserPlus from "ui/Icons/UserPlus";
import LoadingScene from "ui/Loading";

import DashboardWrap from "src/components/DashboardWrap";
import api, { ListPlace, useGetList } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { getUser } from "src/services/store";
import { useMutation } from "react-query";
import { baseURL } from "src/services/api/base";

const ListItem = ({
  listId,
  onDelete,
  place,
}: {
  listId: string;
  onDelete: () => void;
  place: ListPlace;
}) => {
  const { mutateAsync } = useMutation({
    mutationKey: ["deleteListItem", listId, place.id],
    mutationFn: () =>
      api.delete(`${baseURL}/lists/${listId}/place/${place.itemId}`),
    onSuccess: () => {
      onDelete();
    },
  });

  const onDeleteClick = async (e: React.MouseEvent) => {
    if (e.button !== 0) {
      return;
    }

    await mutateAsync();
  };

  const onDeleteKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      await mutateAsync();
    }
  };

  return (
    <div className="card p-2 py-3 rounded-md flex flex-row text-primary mb-10 border-2 glass">
      <div className="flex flex-col flex-1">
        <span className="mb-2 text-lg font-semibold uppercase">
          {place.name}
        </span>
        <div className="flex gap-2">
          {place.types.map((type) => (
            <span
              key={type}
              className="bg-secondary rounded px-2 py-1 text-secondary-content text-xs capitalize"
            >
              {type.replace(/_/gi, " ")}
            </span>
          ))}
        </div>
      </div>
      <button
        data-testid="delete-place-button"
        className="flex items-center px-4 rounded-md hover:cursor-pointer hover:bg-neutral-content hover:bg-opacity-10 "
        onClick={onDeleteClick}
        onKeyDown={onDeleteKeyDown}
      >
        <TrashIcon width={24} height={24} />
      </button>
    </div>
  );
};

const List = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const user = useAppSelector(getUser);
  const listId = params.id;
  const { data, refetch, status: listStatus } = useGetList(listId);

  if (!user) {
    navigate("/");
    return null;
  }

  if (listStatus === "loading") {
    return <LoadingScene />;
  }

  return (
    <DashboardWrap>
      {!data && <AlertError error="We could not find this list." />}
      {data && (
        <div className="flex flex-col px-0.5">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-white">{data.name}</h1>
            {/* Only list owners can invite others. */}
            {data.userId === user.id && (
              <Link
                to={`/lists/${data.id}/invites`}
                className="flex gap-2 btn btn-primary"
              >
                <span className="text-lg hover:cursor-pointer">
                  <UserPlus />
                </span>
                Invite others
              </Link>
            )}
          </div>
          {data.items.map((place) => (
            <ListItem
              key={place.id}
              listId={data.id}
              place={place}
              onDelete={refetch}
            />
          ))}
        </div>
      )}
    </DashboardWrap>
  );
};

export default List;
