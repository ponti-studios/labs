import Typography from "ui/Typography";

const PlacePriceLevel = ({ priceLevel }: { priceLevel: number }) => {
  return (
    <p className="py-0">
      <Typography variant="bold">Price Level: </Typography>
      {
        // Render price level as dollar signs
        priceLevel &&
          [...Array(priceLevel)].map((_, i) => (
            <span key={i} className="text-green-500 px-[4px]">
              🤑
            </span>
          ))
      }
    </p>
  );
};

export default PlacePriceLevel;
