import Alert from "@hominem/components/Alert";
import Button from "@hominem/components/Button";
import Loading from "@hominem/components/Loading";
import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import AddPlaceToList from "src/components/places/AddPlaceToList";
import PlaceAddress from "src/components/places/PlaceAddress";
import PlacePhotos from "src/components/places/PlacePhotos";
import PlaceTypes from "src/components/places/PlaceTypes";
import PlaceWebsite from "src/components/places/PlaceWebsite";
import { useGetPlace } from "src/services/api/places";
import { useToast } from "src/services/toast/toast.slice";

function PlaceScene() {
	const { openToast } = useToast();
	const params = useParams<{ id: string }>();
	const [isListSelectOpen, setIsListSelectOpen] = useState<boolean>(false);
	const { data: place, formattedError, isLoading } = useGetPlace(params.id);
	const onAddToListSuccess = useCallback(() => {
		openToast({
			type: "success",
			text: `${place.name} added to list!`,
		});
		setIsListSelectOpen(false);
	}, [openToast, place]);
	const onAddToList = useCallback(() => setIsListSelectOpen(true), []);

	if (isLoading) {
		return <Loading />;
	}

	if (formattedError) {
		return <Alert type="error">{formattedError}</Alert>;
	}

	return (
		<div className="mt-3">
			<PlacePhotos alt={place.name} photos={place.photos} />
			<div className="rounded-box bg-slate-100 mt-4 px-4 py-6">
				<div className="mb-4">
					<p className="font-bold text-xl mb-4">{place.name}</p>
					<PlaceTypes types={place.types} />
				</div>
				{place.address && (
					<div className="flex justify-end mt-2">
						<PlaceAddress
							address={place.address}
							name={place.name}
							place_id={place.googleMapsId}
						/>
					</div>
				)}
				{place.websiteUri && (
					<div className="flex justify-end mt-2">
						<PlaceWebsite website={place.websiteUri} />
					</div>
				)}
			</div>
			<div className="modal-action">
				<Button onClick={onAddToList}>Add to list</Button>
			</div>
			{isListSelectOpen && (
				<AddPlaceToList
					cancel={() => setIsListSelectOpen(false)}
					place={place}
					onSuccess={onAddToListSuccess}
				/>
			)}
		</div>
	);
}

export default PlaceScene;
