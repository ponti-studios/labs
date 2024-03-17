import { Link, MapPin } from "lucide-react";

type Props = {
  address: string;
  name: string;
  place_id: string;
};
const PlaceAddress = ({ address, name, place_id }: Props) => {
  return (
    <p className="flex justify-end w-full items-center hover:bg-primary hover:text-white">
      <MapPin size={16} className="inline-block mr-2" />
      <span dangerouslySetInnerHTML={{ __html: address }}></span>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${name}&query_place_id=${place_id}`}
        target="_blank"
        rel="noreferrer"
        className="text-primary font-medium ml-3"
      >
        <Link size={16} className="inline-block mt-[6px] align-baseline" />
      </a>
    </p>
  );
};

export default PlaceAddress;
