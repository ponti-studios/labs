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
      <h3 className="font-bold text-lg">Hello!</h3>
      {place && (
        <p className="py-4">
          {place.name} {place.formatted_address}
        </p>
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
