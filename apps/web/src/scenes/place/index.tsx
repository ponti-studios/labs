import Alert from "@hominem/components/Alert";
import Button from "@hominem/components/Button";
import { LoadingScreen } from "@hominem/components/Loading";
import type { AxiosError } from "axios";
import { ListPlus } from "lucide-react";
import {
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react";
import { useParams } from "react-router-dom";

import AddPlaceToList from "src/components/places/AddPlaceToList";
import PlaceAddress from "src/components/places/PlaceAddress";
import PlacePhotos from "src/components/places/PlacePhotos";
import PlaceTypes from "src/components/places/PlaceTypes";
import PlaceWebsite from "src/components/places/PlaceWebsite";
import { Sheet, SheetContent, SheetTrigger } from "src/components/ui/sheet";
import { useGetPlace } from "src/lib/api/places";
import { useToast } from "src/lib/toast/hooks";
import type { SearchPlace } from "src/lib/types";
import { withAuth } from "src/lib/utils";
import { PlaceProvider, usePlaceContext } from "./place-context";

function PlaceError({ error }: { error: AxiosError }) {
	if (!error || !error.response) {
		return "An error occurred while fetching the place. Please try again later.";
	}

	if (error.response.status === 404) {
		return "Place not found.";
	}

	if (error.response?.status === 403) {
		return "You do not have permission to view this place.";
	}

	if (error.response?.status === 500) {
		return "An error occurred while fetching the place. Please try again later.";
	}

	return error.message;
}

function PlaceRoute() {
	const { openToast } = useToast();
	const { openSaveSheet, isSaveSheetOpen } = usePlaceContext();
	const params = useParams<{ id: string }>();
	const { data: place, error, isLoading } = useGetPlace(params.id);

	const onAddToListSuccess = useCallback(() => {
		openToast({
			type: "success",
			text: `${place.name} added to list!`,
		});
	}, [openToast, place]);

	const onSaveClick = useCallback(() => {
		openSaveSheet();
	}, [openSaveSheet]);

	if (isLoading) {
		return <LoadingScreen />;
	}

	if (error) {
		return (
			<Alert type="error">
				<PlaceError error={error} />
			</Alert>
		);
	}

	return (
		<div className="mt-3 w-full">
			<PlacePhotos alt={place.name} photos={place.photos} />
			<div className="rounded-box bg-slate-100 mt-4 px-4 py-6">
				<div className="mb-4">
					<p className="font-bold text-xl mb-2">{place.name}</p>
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
				<Button onClick={onSaveClick}>
					<ListPlus size={16} />
					Save
				</Button>
			</div>
			{isSaveSheetOpen && (
				<AddPlaceToList place={place} onSuccess={onAddToListSuccess} />
			)}
		</div>
	);
}

export const Component = withAuth(() => {
	return (
		<PlaceProvider>
			<PlaceRoute />
		</PlaceProvider>
	);
});
