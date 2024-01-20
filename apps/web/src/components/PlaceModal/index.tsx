import { RefObject, forwardRef, useState } from "react";
import Typography from "ui/Typography";

import Modal from "src/components/Modal";
import { closePlaceModal } from "src/services/store";
import { useAppDispatch } from "src/services/hooks";

import AddPlaceToList from "./AddPlaceToList";
import PlaceStatus from "./PlaceStatus";
import PlacePhotos from "./PlacePhotos";
import PlaceAddress from "./PlaceAddress";
import PlacePriceLevel from "./PlacePriceLevel";
import PlaceWebsite from "./PlaceWebsite";
import { useToast } from "src/services/toast/toast.slice";
import Button from "ui/Button";

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
  const dispatch = useAppDispatch();
  const { openToast } = useToast();
  const type = place && place.types[0] && place.types[0].split("_")[0];
  const [isListSelectOpen, setIsListSelectOpen] = useState(false);

  const onAddToList = () => {
    setIsListSelectOpen(true);
  };

  const closeModal = () => {
    dispatch(closePlaceModal());
    setIsListSelectOpen(false);
    onModalClose?.();
  };

  const onAddToListSuccess = () => {
    openToast({
      type: "success",
      text: `${place.name} added to list!`,
    });
    setIsListSelectOpen(false);
    closeModal();
  };

  if (!place) return null;

  return (
    <Modal isOpen={isOpen} onModalClose={closeModal} ref={ref}>
      {!isListSelectOpen && (
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
                <Typography variant="bold">Phone Number:</Typography>{" "}
                {place.international_phone_number}
              </p>
            )}
            {place.website && <PlaceWebsite website={place.website} />}
          </div>
          <div className="modal-action">
            <Button onClick={onAddToList}>Add to list</Button>
          </div>
        </div>
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
