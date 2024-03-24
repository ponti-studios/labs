import { MouseEvent } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import PlaceTypes from "src/components/places/PlaceTypes";
import { PLACE } from "src/constants/routes";
import { ListPlace } from "src/services/types";

const ListItem = ({ place }: { place: ListPlace }) => {
  const navigate = useNavigate();
  const onPlaceNameClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    navigator.vibrate?.(10);

    navigate(generatePath(PLACE, { id: place.googleMapsId }));
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
      <div className="flex flex-col flex-1 mt-1 pl-1 h-full justify-between text-wrap break-words">
        <p className="flex-1 mb-1 font-semibold justify-start underline-offset-4 focus-visible:underline focus-visible:outline-none">
          {place.name}
        </p>
        <PlaceTypes limit={1} types={place.types} />
      </div>
    </button>
  );
};

export default ListItem;
