import { LinkIcon } from "lucide-react";

const PlaceWebsite = ({ website }: { website: string }) => {
	return (
		<a
			href={website}
			target="_blank"
			rel="noreferrer"
			className="text-primary font-medium"
		>
			{website.replace(/(^\w+:|^)\/\//, "").split("/")[0]}
			<LinkIcon size={14} className="inline-block ml-3" />
		</a>
	);
};

export default PlaceWebsite;
