import { X } from "lucide-react";
import { KeyboardEvent, MouseEvent } from "react";
import { useMutation } from "react-query";
import { generatePath, useNavigate } from "react-router-dom";
import PlaceTypes from "src/components/places/PlaceTypes";
import { PLACE } from "src/constants/routes";
import api from "src/services/api";
import { ListPlace } from "src/services/types";

const ListItem = ({
  listId,
  place,
  onError,
  onDelete,
}: {
  listId: string;
  onError: () => void;
  onDelete: () => void;
  place: ListPlace;
}) => {
  const navigate = useNavigate();
  const { mutateAsync } = useMutation(() =>
    api
      .delete(`/lists/${listId}/items/${place.itemId}`)
      .then(onDelete)
      .catch(onError),
  );
  const onPlaceNameClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    navigator.vibrate?.(10);

    navigate(generatePath(PLACE, { id: place.googleMapsId }));
  };

  const onDeleteClick = async (
    e: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>,
  ) => {
    e.stopPropagation();
    e.preventDefault();

    // Only delete on Enter key
    if (
      e.type === "keydown" &&
      (e as React.KeyboardEvent<HTMLSpanElement>).key !== "Enter"
    ) {
      return;
    }

    navigator.vibrate?.(10);

    mutateAsync();
  };

  return (
    <button
      data-testid="place-item"
      className="flex card rounded-lg size-full"
      onClick={onPlaceNameClick}
    >
      <div className="rounded-lg p-[2px] border border-slate-200 w-full h-[200px]">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="rounded-lg object-cover w-full h-full"
        />
      </div>
      <div className="flex">
        <div className="flex flex-col flex-1 mt-1 pl-1 h-full justify-between text-wrap break-words">
          <p className="flex-1 mb-1 font-semibold justify-start underline-offset-4 focus-visible:underline focus-visible:outline-none">
            {place.name}
          </p>
          <PlaceTypes limit={1} types={place.types} />
        </div>
        <span
          data-testid="delete-place-button"
          role="button"
          tabIndex={0}
          className="text-slate-700 cursor-pointer mt-2"
          onKeyDown={onDeleteClick}
          onClick={onDeleteClick}
        >
          <X size={16} />
        </span>
      </div>
    </button>
  );
};

export default ListItem;
