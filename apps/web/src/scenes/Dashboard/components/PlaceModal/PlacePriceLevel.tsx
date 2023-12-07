import { Bold } from "ui/Text";

const PlacePriceLevel = ({ priceLevel }: { priceLevel: number }) => {
  return (
    <p className="py-0">
      <Bold>Price Level: </Bold>
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
