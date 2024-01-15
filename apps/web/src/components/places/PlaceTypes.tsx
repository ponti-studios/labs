import PlaceType from "src/components/places/PlaceType";

const PlaceTypes = ({ types }: { types: string[] }) => {
  const excludedTypes = ["establishment", "food", "point_of_interest"];
  const filterExcludedTypes = (type: string) => !excludedTypes.includes(type);

  const isPointOfInterest =
    types.length === 2 &&
    types.includes("establishment") &&
    types.includes("point_of_interest");

  return (
    <p className="flex gap-2 pt-2 pb-6">
      {isPointOfInterest ? (
        <PlaceType>Point of Interest</PlaceType>
      ) : (
        types
          .filter(filterExcludedTypes)
          .map((type) => (
            <PlaceType key={type}>{type.replace(/_/gi, " ")}</PlaceType>
          ))
      )}
    </p>
  );
};

export default PlaceTypes;
