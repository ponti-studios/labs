import {
  OpenInNewWindowIcon,
  SewingPinFilledIcon,
} from "@radix-ui/react-icons";

type Props = {
  address: string;
  name: string;
  place_id: string;
};
const PlaceAddress = ({ address, name, place_id }: Props) => {
  return (
    <p className="flex justify-end py-[4px] w-full items-center">
      <SewingPinFilledIcon className="inline-block mr-2" />
      <span dangerouslySetInnerHTML={{ __html: address }}></span>
      <span>
        {
          // Add a link to Google Maps
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${name}&query_place_id=${place_id}`}
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
