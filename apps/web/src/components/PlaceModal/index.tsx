import { RefObject, forwardRef, useState } from "react";
import Button from "ui/Button";

import Modal from "src/components/Modal";
import { usePlaceModal } from "src/services/places";
import { useToast } from "src/services/toast/toast.slice";
import { Place } from "src/services/types";

import AddPlaceToList from "./components/AddPlaceToList";
import PlacePhotos from "./components/PlacePhotos";
import PlaceAddress from "./components/PlaceAddress";
import PlaceWebsite from "./components/PlaceWebsite";

type PlaceModalProps = {
  isOpen: boolean;
  onModalClose: () => void;
  place: Place;
};
function PlaceModal(
  { place, isOpen, onModalClose }: PlaceModalProps,
  ref: RefObject<HTMLDialogElement | null>,
) {
  const { closePlaceModal } = usePlaceModal();
  const { openToast } = useToast();
  const type = place && place.types[0] && place.types[0].split("_")[0];
  const [isListSelectOpen, setIsListSelectOpen] = useState(false);

  const onAddToList = () => {
    setIsListSelectOpen(true);
  };

  const closeModal = () => {
    closePlaceModal();
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
          <div className="rounded-box bg-slate-100 mt-4 px-4 py-6">
            <div>
              <p className="font-bold text-xl">{place.name}</p>
              <p className="text-gray-400 italic">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </p>
            </div>
            <PlaceAddress
              address={place.address}
              name={place.name}
              place_id={place.googleMapsId}
            />
            {place.websiteUri && (
              <div className="flex justify-end mt-2">
                <PlaceWebsite website={place.websiteUri} />
              </div>
            )}
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
