import { MapPin } from "lucide-react";

type Props = {
	address: string;
	name: string;
	place_id: string;
};
const PlaceAddress = ({ address, name, place_id }: Props) => {
	return (
		<a
			href={`https://www.google.com/maps/search/?api=1&query=${name}&query_place_id=${place_id}`}
			target="_blank"
			rel="noreferrer"
			className="flex items-center text-primary font-medium"
		>
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
			<span dangerouslySetInnerHTML={{ __html: address }} />
			<span className="inline-block ml-3">
				<MapPin size={16} />
			</span>
		</a>
	);
};

export default PlaceAddress;
