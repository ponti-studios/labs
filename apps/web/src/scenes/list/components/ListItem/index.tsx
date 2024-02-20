import { Link } from "react-router-dom";

import PlaceTypes from "src/components/places/PlaceTypes";
import { ListPlace } from "src/services/api";
import { usePlaceModal, usePlacesService } from "src/services/places";

const ListItem = ({ place }: { place: ListPlace }) => {
  const { openPlaceModal } = usePlaceModal();
  const placesService = usePlacesService();

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
    <div className="flex card rounded-lg size-full">
      <Link
        to="#"
        className="rounded-lg p-[2px] border border-slate-200 w-full h-[200px]"
        onClick={onPlaceNameClick}
      >
        <img
          src={place.imageUrl}
          alt={place.name}
          className="rounded-lg object-cover w-full h-full"
        />
      </Link>
      <div className="flex flex-col flex-1 mt-1 pl-1 h-full justify-between text-wrap break-words">
        <Link
          to="#"
          className="flex-1 mb-1 font-semibold justify-start underline-offset-4 focus-visible:underline focus-visible:outline-none"
          onClick={onPlaceNameClick}
        >
          {place.name}
        </Link>
        <PlaceTypes types={place.types} />
      </div>
    </div>
  );
};

export default ListItem;
