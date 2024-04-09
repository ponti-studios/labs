import PlaceType from "src/components/places/PlaceType";

const PlaceTypes = ({ limit, types }: { limit?: number; types: string[] }) => {
	const excludedTypes = [
		"establishment",
		"food",
		"point_of_interest",
		"political",
	];
	const filterExcludedTypes = (type: string) => !excludedTypes.includes(type);

	const isPointOfInterest =
		types.length === 2 &&
		types.includes("establishment") &&
		types.includes("point_of_interest");

	return (
		<p className="flex justify-start flex-wrap gap-2">
			{isPointOfInterest ? (
				<PlaceType>Point of Interest</PlaceType>
			) : (
				types
					.slice(0, limit)
					.filter(filterExcludedTypes)
					.filter((type, index, arr) => {
						if (type === "store" && arr.length > 1) {
							return false;
						}

						return true;
					})
					.map((type) => (
						<PlaceType key={type}>{type.replace(/_/gi, " ")}</PlaceType>
					))
			)}
		</p>
	);
};

export default PlaceTypes;
