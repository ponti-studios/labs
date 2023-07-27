import { Bold } from "ui/Text";
import PlaceType from "./PlaceType";

const PlaceTypes = ({ types }: { types: string[] }) => {
 return (
  <p className="py-[4px]">
   <Bold>Types</Bold>
   {/* Div that places a 8px gap between text wrap lines */}
   <div style={{ lineHeight: 2 }}>
    {types.map((type) => {
     // type
     // Capitalize and replace underscores with spaces and render as tags
     const tag = type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
     // Render as tags with a hashtag and rounded corners and a purple background
     return <PlaceType key={type}>{tag.join(" ")}</PlaceType>;
    })}
   </div>
  </p>
 );
};

export default PlaceTypes;
