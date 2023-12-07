import { RefObject, forwardRef, useState } from "react";

import Modal from "src/components/Modal";
import { Bold } from "ui/Text";

import AddPlaceToList from "./AddPlaceToList";
import PlaceStatus from "./PlaceStatus";
import PlacePhotos from "./PlacePhotos";
import PlaceAddress from "./PlaceAddress";
import { useGetLists } from "src/services/api";
import PlacePriceLevel from "./PlacePriceLevel";
import PlaceWebsite from "./PlaceWebsite";

const PlaceRating = ({ place }: { place: google.maps.places.PlaceResult }) => {
  return (
    <p className="py-[4px]">
      <Bold>Rating:</Bold>{" "}
      {[...Array(Math.floor(place.rating))].map((_, i) => (
        <span key={i} className="text-yellow-500">
          ★
        </span>
      ))}
    </p>
  );
};

type PlaceModalProps = {
  isOpen: boolean;
  onModalClose: () => void;
  place: google.maps.places.PlaceResult;
};
function PlaceModal(
  { place, isOpen, onModalClose }: PlaceModalProps,
  ref: RefObject<HTMLDialogElement | null>,
) {
  const type = place && place.types[0] && place.types[0].split("_")[0];
  const [isListSelectOpen, setIsListSelectOpen] = useState(false);
  const { isLoading: isListsLoading, data: lists } = useGetLists({
    options: {
      enabled: isListSelectOpen,
    },
  });

  const onAddToList = () => {
    setIsListSelectOpen(true);
  };

  const onAddToListSuccess = () => {
    setIsListSelectOpen(false);
    onModalClose();
  };

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose} ref={ref}>
      {place && (
        <div className="mt-3">
          <PlacePhotos alt={place.name} photos={place.photos} />
          <div className="mt-4">
            <p className="font-bold text-xl">{place.name}</p>
            <p className="text-gray-400 italic">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </p>
          </div>
          <PlaceAddress place={place} />
          <div className="hidden">
            <PlaceStatus className="py-[4px]" place={place} />
            {place.rating && place.rating > 0 && <PlaceRating place={place} />}
            {place.price_level && (
              <PlacePriceLevel priceLevel={place.price_level} />
            )}
            {place.international_phone_number && (
              <p className="py-[4px]">
                <Bold>Phone Number:</Bold> {place.international_phone_number}
              </p>
            )}
            {place.website && <PlaceWebsite website={place.website} />}
          </div>
        </div>
      )}
      {!isListSelectOpen && (
        <div className="modal-action">
          <button className="btn" onClick={onAddToList}>
            Add to list
          </button>
        </div>
      )}
      {isListSelectOpen && !isListsLoading && (
        <AddPlaceToList
          lists={lists}
          place={place}
          onSuccess={onAddToListSuccess}
        />
      )}
    </Modal>
  );
}

export default forwardRef(PlaceModal);
