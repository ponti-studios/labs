import Alert from "@hominem/components/Alert";
import Loading from "@hominem/components/Loading";
import { PlusCircle, Share } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, generatePath, useNavigate, useParams } from "react-router-dom";

import { useGetList } from "src/lib/api";
import { useAuth } from "src/lib/auth";
import type { SearchPlace } from "src/lib/types";
import { PLACE } from "src/lib/utils/routes";

import PlacesAutocomplete from "../dashboard/components/PlacesAutocomplete";
import PlaceItem from "./components/PlaceItem";

const List = () => {
	const { currentLocation, user } = useAuth();
	const navigate = useNavigate();
	const [isAddToListOpen, setIsAddToListOpen] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const { id: listId } = useParams<{ id: string }>();
	const { data, error, status, refetch } = useGetList(listId);

	const onSelectedChanged = useCallback(
		(place: SearchPlace) =>
			navigate(generatePath(PLACE, { id: place.googleMapsId })),
		[navigate],
	);

	const handleDeleteError = () => {
		setDeleteError("Could not delete place. Please try again.");
	};

	if (!user) {
		navigate("/");
		return null;
	}

	if (status === "pending") {
		return <Loading />;
	}

	if (error) {
		return <Alert type="error">We could not find this list.</Alert>;
	}

	if (deleteError) {
		return <Alert type="error">{deleteError}</Alert>;
	}

	return (
		data && (
			<div className="flex flex-col px-0.5">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-semibold">{data.name}</h1>
					<div className="flex gap-4">
						{/* Only list owners can invite others. */}
						{data.userId === user.id && (
							<button
								type="button"
								data-testid="add-to-list-button"
								onClick={() => setIsAddToListOpen(!isAddToListOpen)}
								className="flex gap-2 text-black hover:bg-opacity-80 focus:bg-opacity-80 cursor-pointer"
							>
								<PlusCircle />
							</button>
						)}
						{data.userId === user.id && (
							<Link
								to={`/lists/${data.id}/invites`}
								className="flex gap-2 text-black hover:bg-opacity-80 focus:bg-opacity-80"
							>
								<span className="hover:cursor-pointer">
									<Share />
								</span>
							</Link>
						)}
					</div>
				</div>
				{(data.items.length === 0 || isAddToListOpen) && (
					<div
						data-testid="add-to-list"
						className="mb-6 bg-slate-100 rounded-lg p-4 pb-8"
					>
						<label className="label font-semibold" htmlFor="search">
							Add a place
						</label>
						<PlacesAutocomplete
							setSelected={onSelectedChanged}
							center={currentLocation}
						/>
					</div>
				)}
				{data.items.length === 0 && (
					<Alert type="info">
						This list is empty. Start adding places with the search bar above.
					</Alert>
				)}
				<div className="grid gap-x-6 gap-y-14 grid-cols-2 sm:grid-cols-3">
					{data.items.map((place) => (
						<PlaceItem
							key={place.id}
							onError={handleDeleteError}
							onDelete={refetch}
							place={place}
							listId={listId}
						/>
					))}
				</div>
			</div>
		)
	);
};

export default List;
