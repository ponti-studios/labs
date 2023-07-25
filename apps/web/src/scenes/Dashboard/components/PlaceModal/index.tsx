import { RefObject, forwardRef } from "react";
import Modal from "src/components/Modal";

type PlaceModalProps = {
  isOpen: boolean;
  onModalClose: () => void;
  place: google.maps.places.PlaceResult;
};
function PlaceModal(
  { place, isOpen, onModalClose }: PlaceModalProps,
  ref: RefObject<HTMLDialogElement | null>
) {
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose} ref={ref}>
      {place && (
        <>
          <h3 className="font-bold text-lg">{place.name}</h3>
          <p className="py-4">{place.formatted_address}</p>
        </>
      )}
      <div className="modal-action">
        <button className="btn" onClick={onModalClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}

export default forwardRef(PlaceModal);
