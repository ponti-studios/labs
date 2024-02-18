import { TrashIcon } from "@radix-ui/react-icons";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";

import PlaceTypes from "src/components/places/PlaceTypes";
import api, { ListPlace } from "src/services/api";
import { baseURL } from "src/services/api/base";
import { usePlaceModal, usePlacesService } from "src/services/places";

const ListItem = ({
  listId,
  onDelete,
  place,
}: {
  listId: string;
  onDelete: () => void;
  place: ListPlace;
}) => {
  const { openPlaceModal } = usePlaceModal();
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

  const onPlaceNameClick = async (e) => {
    e.preventDefault();
    if (!placesService) return;

    openPlaceModal({
      place: await placesService.getPlaceDetails({
        placeId: place.googleMapsId,
      }),
    });
  };

  return (
    <div className="card glass px-2 py-3 rounded-md flex mb-4">
      <div className="flex flex-row">
        <Link to="#" className="w-16 h-16" onClick={onPlaceNameClick}>
          <img src={place.imageUrl} alt={place.name} className="w-16 h-16" />
        </Link>
        <div className="flex flex-col flex-1 h-full justify-between pl-2">
          <Link
            to="#"
            className="flex-1 mb-2 text-xl md:text-2xl font-medium justify-start underline-offset-4 focus-visible:underline focus-visible:outline-none"
            onClick={onPlaceNameClick}
          >
            {place.name}
          </Link>
          <PlaceTypes types={place.types} />
        </div>
        <button
          data-testid="delete-place-button"
          className="flex items-center px-4 rounded-md hover:cursor-pointer hover:bg-neutral-content hover:bg-opacity-10 focus:bg-neutral-content focus:bg-opacity-10 transition-colors"
          onClick={onDeleteClick}
          onKeyDown={onDeleteKeyDown}
        >
          <TrashIcon width={24} height={24} className="text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default ListItem;
