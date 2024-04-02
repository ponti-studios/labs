import styled from "@emotion/styled";
import { useState } from "react";
import { useGetLists } from "src/services/api";
import { useAddPlaceToList } from "src/services/api/places";
import type { Place } from "src/services/types";
import Button from "ui/Button";

const ListItem = styled.li`
  padding: 8px;

  &:first-of-type {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-of-type {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

const Checkbox = styled.label`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
`;
const AddPlaceToList = ({
	cancel,
	onSuccess,
	place,
}: {
	cancel: () => void;
	onSuccess: () => void;
	place: Place;
}) => {
	const { isLoading, data: lists } = useGetLists();
	const [listIds, setListIds] = useState<string[]>([]);
	const { mutate: addToList, isLoading: isAddingToList } = useAddPlaceToList({
		onSuccess: () => {
			onSuccess?.();
		},
	});

	const onAddToList = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();

		addToList({
			listIds,
			place,
		});
	};

	const onListSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setListIds([...listIds, e.target.value]);
	};

	// List of lists displaying their name and a round checkbox that when clicked adds the list to the listIds array
	return (
		<div>
			<h2 className="text-xl font-bold">Add to lists</h2>
			<p>Select the lists you want to add this place to.</p>
			<hr className="my-6" />
			{isLoading ? (
				<div className="flex items-center justify-center h-16">
					<div className="loading loading-infinity w-14" />
				</div>
			) : (
				<ul className="list-none">
					{lists.map((list) => (
						<ListItem key={list.id} className="border hover:cursor-pointer">
							<Checkbox htmlFor={list.id} className="hover:cursor-pointer">
								<input
									type="checkbox"
									id={list.id}
									value={list.id}
									onChange={onListSelectChange}
								/>
								{list.name}
							</Checkbox>
						</ListItem>
					))}
					<div className="flex items-center justify-between mt-4">
						<Button className="btn-outline" onClick={cancel}>
							Back
						</Button>
						<Button
							className="float-right"
							isLoading={isAddingToList}
							onClick={onAddToList}
						>
							Add to lists
						</Button>
					</div>
				</ul>
			)}
		</div>
	);
};

export default AddPlaceToList;
