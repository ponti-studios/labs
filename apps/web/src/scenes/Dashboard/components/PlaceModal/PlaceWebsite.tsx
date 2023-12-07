import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Bold } from "ui/Text";

const PlaceWebsite = ({ website }: { website: string }) => {
  return (
    <p className="py-[4px]">
      <Bold>Website: </Bold>
      <a
        href={website}
        target="_blank"
        rel="noreferrer"
        className="text-primary font-medium"
      >
        {website.replace(/(^\w+:|^)\/\//, "").split("/")[0]}
        <OpenInNewWindowIcon className="inline-block ml-1" />
      </a>
    </p>
  );
};

export default PlaceWebsite;
