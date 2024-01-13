import styled from "@emotion/styled";
import { useState } from "react";
import { useAddLocationToList } from "src/services/api/locations";
import { List } from "src/services/types";

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
  lists,
  onSuccess,
  place,
}: {
  lists: List[];
  onSuccess: () => void;
  place: google.maps.places.PlaceResult;
}) => {
  const [listIds, setListIds] = useState<string[]>([]);
  const { mutate: addToList } = useAddLocationToList({
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
    <ul className="list-none mt-8">
      {lists.map((list) => (
        <ListItem
          key={list.id}
          className="border-accent border hover:cursor-pointer"
        >
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
      <button
        className="btn btn-primary float-right mt-4"
        onClick={onAddToList}
      >
        Add to list
      </button>
    </ul>
  );
};

export default AddPlaceToList;
