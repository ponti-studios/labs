import {
  OpenInNewWindowIcon,
  SewingPinFilledIcon,
} from "@radix-ui/react-icons";

export function CustomPlaceAddress({ place }: Props) {
  const placeAddress =
    place.address_components &&
    // Only show the subpremise, street number, and route
    place.address_components
      .filter(
        (component) =>
          component.types.includes("subpremise") ||
          component.types.includes("street_number") ||
          component.types.includes("route"),
      )
      .sort((a, b) => {
        // Sort by the order of the address_components array
        return (
          place.address_components.indexOf(a) -
          place.address_components.indexOf(b)
        );
      })
      .map((component) => (
        <span key={component.long_name}>{component.long_name} </span>
      ));

  if (placeAddress) {
    return <span className="flex-1">{placeAddress}</span>;
  }

  return (
    <span
      className="flex-1"
      dangerouslySetInnerHTML={{ __html: place.adr_address }}
    ></span>
  );
}

type Props = {
  place: google.maps.places.PlaceResult;
};
const PlaceAddress = ({ place }: Props) => {
  return (
    <p className="flex justify-between py-[4px] w-full items-center">
      <SewingPinFilledIcon className="inline-block mr-2" />
      <CustomPlaceAddress place={place} />
      <span>
        {
          // Add a link to Google Maps
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.name}&query_place_id=${place.place_id}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary font-medium"
          >
            <OpenInNewWindowIcon className="inline-block ml-1" />
          </a>
        }
      </span>
    </p>
  );
};

export default PlaceAddress;
