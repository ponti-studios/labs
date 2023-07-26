import { RefObject, forwardRef } from "react";
import Modal from "src/components/Modal";

const Bold = ({ children, ...props }: { children: React.ReactNode }) => (
  <span className="font-semibold" {...props}>
    {children}
  </span>
);

type PlaceModalProps = {
  isOpen: boolean;
  onModalClose: () => void;
  place: google.maps.places.PlaceResult;
};
function PlaceModal(
  { place, isOpen, onModalClose }: PlaceModalProps,
  ref: RefObject<HTMLDialogElement | null>
) {
  const opertional = place?.business_status === "OPERATIONAL";
  const permanentlyClosed = place?.business_status === "CLOSED_PERMANENTLY";
  const temporarilyClosed = place?.business_status === "CLOSED_TEMPORARILY";

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose} ref={ref}>
      {place && (
        <>
          <h3 className="font-bold text-lg">{place.name}</h3>
          {place.photos?.length > 1 && (
            // Display photos in a side-scrolling container while maintaining aspect ratio
            // Style the container to hide the scrollbar and make it responsive
            <div className="flex overflow-x-auto w-full">
              {place.photos.map((photo) => (
                <img
                  key={photo.getUrl()}
                  src={photo.getUrl()}
                  alt={place.name}
                  className="w-64 h-64 object-cover object-top"
                />
              ))}
            </div>
          )}
          {
            <p className="py-[4px]">
              <Bold>Status:</Bold>{" "}
              {
                // If operational, show funny message
                opertional && (
                  <>
                    <span>Open for business!</span> 🎉
                  </>
                )
              }
              {
                // If permanently closed, show sad message
                permanentlyClosed && (
                  <>
                    <span className="font-semibold">Permanently Closed</span> 😢
                  </>
                )
              }
              {
                // If temporarily closed, show a uplifting message
                temporarilyClosed && (
                  <>
                    <span className="font-semibold">
                      Temporarily Closed but will return
                    </span>
                    🤞
                  </>
                )
              }
            </p>
          }
          {place?.opening_hours?.isOpen() ? (
            <p>
              <span>Open today from </span>{" "}
              {
                // Only show opening hours for today
                place.opening_hours?.weekday_text &&
                  place.opening_hours.weekday_text[new Date().getDay()]
                    .replace(/[a-zA-Z]+: /, "")
                    .replace(/–/g, " to ")
              }
            </p>
          ) : (
            <>
              <p className="text-red-500">Closed</p>
              <p>
                {/* Display "Opens <day they are next open> from" */}
                <span>Opens again </span>
                {
                  // Display the the opening hours for the next day they are open
                  place.opening_hours?.weekday_text &&
                    place.opening_hours.weekday_text[
                      (new Date().getDay() + 1) % 7
                    ]
                      .replace(/[a-zA-Z]+: /, "")
                      .replace(/–/g, " to ")
                }
              </p>
            </>
          )}

          {
            <p className="py-[4px]">
              <Bold>Rating:</Bold>{" "}
              {
                // Render rating as stars
                [...Array(Math.floor(place.rating))].map((_, i) => (
                  <span key={i} className="text-yellow-500">
                    ★
                  </span>
                ))
              }
            </p>
          }
          {
            <p className="py-0">
              Price Level:{" "}
              {
                // Render price level as dollar signs
                place.price_level &&
                  [...Array(place.price_level)].map((_, i) => (
                    <span key={i} className="text-green-500">
                      $
                    </span>
                  ))
              }
            </p>
          }
          {
            <p className="py-[4px]">
              Address:
              <br />
              {
                // Write address in multiple lines for better readability in standard address format and add a link to Google Maps
                place.formatted_address.split(",").map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))
              }
            </p>
          }
          {
            <p className="py-[4px]">
              Phone Number: {place.international_phone_number}
            </p>
          }
          {
            <p className="py-[4px]">
              Website:{" "}
              <a
                href={place.website}
                target="_blank"
                rel="noreferrer"
                className="text-primary font-medium"
              >
                {place.website}
              </a>
            </p>
          }
          {
            <p className="py-[4px]">
              <Bold>Types:</Bold>
              <br />
              {/* Div that places a 8px gap between text wrap lines */}
              <div style={{ lineHeight: 2 }}>
                {place.types.map((type) => {
                  // type
                  // Capitalize and replace underscores with spaces and render as tags
                  const tag = type
                    .split("_")
                    .map(
                      (word) => word.charAt(0).toUpperCase() + word.slice(1)
                    );
                  // Render as tags with a hashtag and rounded corners and a purple background
                  return (
                    <span
                      key={type}
                      className="inline-block bg-secondary rounded-md px-3 py-1 text-sm font-semibold text-primary-content mr-2"
                    >
                      # {tag.join(" ")}
                    </span>
                  );
                })}
              </div>
            </p>
          }
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
