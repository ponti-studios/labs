import { RefObject, forwardRef } from "react";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import Modal from "src/components/Modal";
import { Bold } from "ui/Text";

import PlaceStatus from "./PlaceStatus";
import PlacePhotos from "./PlacePhotos";
import PlaceAddress from "./PlaceAddress";

type PlaceModalProps = {
  isOpen: boolean;
  onModalClose: () => void;
  place: google.maps.places.PlaceResult;
};
function PlaceModal(
  { place, isOpen, onModalClose }: PlaceModalProps,
  ref: RefObject<HTMLDialogElement | null>
) {
  const type = place && place.types[0] && place.types[0].split("_")[0];
  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose} ref={ref}>
      {place && (
        <>
          <h3 className="font-bold text-4xl my-4">{place.name}</h3>
          <PlacePhotos alt={place.name} photos={place.photos} />
          <p className="py-[4px] mt-3 text-gray-400 italic">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </p>
          <PlaceAddress place={place} />
          <PlaceStatus className="py-[4px]" place={place} />
          {place.rating && place.rating > 0 && (
            <p className="py-[4px]">
              <Bold>Rating:</Bold>{" "}
              {[...Array(Math.floor(place.rating))].map((_, i) => (
                <span key={i} className="text-yellow-500">
                  ★
                </span>
              ))}
            </p>
          )}
          {place.price_level && (
            <p className="py-0">
              <Bold>Price Level: </Bold>
              {
                // Render price level as dollar signs
                place.price_level &&
                  [...Array(place.price_level)].map((_, i) => (
                    <span key={i} className="text-green-500 px-[4px]">
                      🤑
                    </span>
                  ))
              }
            </p>
          )}
          {
            <p className="py-[4px]">
              <Bold>Phone Number:</Bold> {place.international_phone_number}
            </p>
          }
          {place.website && (
            <p className="py-[4px]">
              <Bold>Website: </Bold>
              <a
                href={place.website}
                target="_blank"
                rel="noreferrer"
                className="text-primary font-medium"
              >
                {place.website.replace(/(^\w+:|^)\/\//, "").split("/")[0]}
                <OpenInNewWindowIcon className="inline-block ml-1" />
              </a>
            </p>
          )}
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
