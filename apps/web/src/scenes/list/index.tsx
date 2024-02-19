import { Share } from "lucide-react";
import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AlertError from "ui/AlertError";
import LoadingScene from "ui/Loading";

import { useGetList } from "src/services/api";
import { useAppSelector } from "src/services/hooks";
import { usePlaceModal } from "src/services/places";
import { useAuth } from "src/services/store";
import { Place } from "src/services/types";

import PlacesAutocomplete from "../dashboard/components/PlacesAutocomplete";

import ListItem from "./components/ListItem";

const List = () => {
  const { openPlaceModal } = usePlaceModal();
  const navigate = useNavigate();
  const currentLocation = useAppSelector((state) => state.auth.currentLocation);
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const listId = params.id;
  const { data, refetch, status: listStatus } = useGetList(listId);

  const onSelectedChanged = useCallback(
    (place: Place) => {
      openPlaceModal({ place, onClose: refetch });
    },
    [openPlaceModal, refetch],
  );

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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold">{data.name}</h1>
            {/* Only list owners can invite others. */}
            {data.userId === user.id && (
              <Link
                to={`/lists/${data.id}/invites`}
                className="flex gap-2 text-black hover:bg-opacity-80 focus:bg-opacity-80"
              >
                <span className="hover:cursor-pointer">
                  <Share />
                </span>
              </Link>
            )}
          </div>
          <div className="mb-6">
            <label className="label" htmlFor="search">
              Add a place
            </label>
            <PlacesAutocomplete
              setSelected={onSelectedChanged}
              center={currentLocation}
            />
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
