import { useParams } from "react-router-dom";
import FeedbackBlock from "src/components/FeedbackBlock";
import PlaceAddress from "src/components/PlaceModal/components/PlaceAddress";
import PlacePhotos from "src/components/PlaceModal/components/PlacePhotos";
import PlaceWebsite from "src/components/PlaceModal/components/PlaceWebsite";
import PlaceTypes from "src/components/places/PlaceTypes";
import { useGetPlace } from "src/services/api/places";
import { LoadingScene } from "ui/Loading";

function PlaceScene() {
  const params = useParams<{ id: string }>();
  const { data: place, formattedError, isLoading } = useGetPlace(params.id);

  if (isLoading) {
    return <LoadingScene />;
  }

  if (formattedError) {
    return <FeedbackBlock>{formattedError}</FeedbackBlock>;
  }

  return (
    <div className="mt-3">
      <PlacePhotos alt={place.name} photos={place.photos} />
      <div className="rounded-box bg-slate-100 mt-4 px-4 py-6">
        <div>
          <p className="font-bold text-xl mb-4">{place.name}</p>
          <PlaceTypes types={place.types} />
        </div>
        <PlaceAddress
          address={place.address}
          name={place.name}
          place_id={place.googleMapsId}
        />
        {place.websiteUri && (
          <div className="flex justify-end mt-2">
            <PlaceWebsite website={place.websiteUri} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaceScene;
