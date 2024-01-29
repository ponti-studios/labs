import { TrashIcon } from "@radix-ui/react-icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "react-query";
import AlertError from "ui/AlertError";
import UserPlus from "ui/Icons/UserPlus";
import LoadingScene from "ui/Loading";

import PlaceTypes from "src/components/places/PlaceTypes";
import api, { ListPlace, useGetList } from "src/services/api";
import { baseURL } from "src/services/api/base";
import { usePlacesService } from "src/services/google-maps";
import { useAppDispatch } from "src/services/hooks";
import { useAuth, openPlaceModal } from "src/services/store";

const ListItem = ({
  listId,
  onDelete,
  place,
}: {
  listId: string;
  onDelete: () => void;
  place: ListPlace;
}) => {
  const dispatch = useAppDispatch();
  const placesService = usePlacesService();
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

  const onPlaceNameClick = (e) => {
    e.preventDefault();
    if (!placesService) return;
    placesService.getDetails({ placeId: place.googleMapsId }, (res) => {
      if (!res) return;
      dispatch(openPlaceModal({ place: res }));
    });
  };

  return (
    <div className="card glass px-2 py-3 rounded-md flex mb-4">
      <div className="flex flex-row mb-2">
        <Link
          to="#"
          className="flex-1 mb-2 text-lg font-semibold justify-start underline-offset-4 focus-visible:underline focus-visible:outline-none"
          onClick={onPlaceNameClick}
        >
          {place.name}
        </Link>
        <button
          data-testid="delete-place-button"
          className="flex items-center px-4 rounded-md hover:cursor-pointer hover:bg-neutral-content hover:bg-opacity-10 focus:bg-neutral-content focus:bg-opacity-10 transition-colors"
          onClick={onDeleteClick}
          onKeyDown={onDeleteKeyDown}
        >
          <TrashIcon width={24} height={24} className="text-red-500" />
        </button>
      </div>
      <PlaceTypes types={place.types} />
    </div>
  );
};

const List = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
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
    <>
      {!data && <AlertError error="We could not find this list." />}
      {data && (
        <div className="flex flex-col px-0.5">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-semibold">{data.name}</h1>
            {/* Only list owners can invite others. */}
            {data.userId === user.id && (
              <Link
                to={`/lists/${data.id}/invites`}
                className="flex gap-2 btn btn-secondary bg-black text-white hover:bg-opacity-80 focus:bg-opacity-80"
              >
                <span className="hover:cursor-pointer">
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
    </>
  );
};

export default List;
