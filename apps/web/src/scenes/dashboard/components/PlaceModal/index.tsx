import { RefObject, forwardRef, useState } from "react";

import Modal from "src/components/Modal";
import Button from "ui/Button";
import Typography from "ui/Typography";

import PlaceTypes from "src/components/places/PlaceTypes";
import PlaceStatus from "src/components/PlaceModal/PlaceStatus";
import PlaceAddress from "src/components/PlaceModal/PlaceAddress";
import PlacePriceLevel from "src/components/PlaceModal/PlacePriceLevel";
import PlaceWebsite from "src/components/PlaceModal/PlaceWebsite";

import PlacePhotos from "src/components/places/PlacePhotos";
import AddPlaceToList from "./AddPlaceToList";

const PlaceRating = ({ place }: { place: google.maps.places.PlaceResult }) => {
  return (
    <p className="py-[4px]">
      <Typography variant="bold">Rating:</Typography>{" "}
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
  const [isListSelectOpen, setIsListSelectOpen] = useState(false);

  const onAddToList = () => {
    setIsListSelectOpen(true);
  };

  const onAddToListSuccess = () => {
    setIsListSelectOpen(false);
    onModalClose();
  };

  if (!place) return null;

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose} ref={ref}>
      {!isListSelectOpen && (
        <>
          <PlacePhotos alt={place.name} photos={place.photos} />
          <div className="mt-4">
            <p className="font-bold text-xl">{place.name}</p>
            <PlaceTypes types={place.types} />
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
                <Typography variant="bold">Phone Number:</Typography>{" "}
                {place.international_phone_number}
              </p>
            )}
            {place.website && <PlaceWebsite website={place.website} />}
          </div>
          <div className="modal-action">
            <Button onClick={onAddToList}>Add to list</Button>
          </div>
        </>
      )}
      {isListSelectOpen && (
        <AddPlaceToList
          cancel={() => setIsListSelectOpen(false)}
          place={place}
          onSuccess={onAddToListSuccess}
        />
      )}
    </Modal>
  );
}

export default forwardRef(PlaceModal);
