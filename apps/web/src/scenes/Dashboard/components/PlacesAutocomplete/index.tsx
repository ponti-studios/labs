import React, { useCallback, useState } from "react";
import { Combobox } from "@headlessui/react";
import usePlacesAutocomplete, { getDetails } from "use-places-autocomplete";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

import Loading from "ui/Loading";
import styled from "@emotion/styled";

const Wrapper = styled.div`
  max-height: 48px; // This is the maximum height of the input field.
  position: relative;
`;

const Options = styled(Combobox.Options)`
  background-color: white;
  margin-top: 8px;
  border-radius: 4px;
  width: 100%;
  max-height: 200px;
  position: absolute;
  z-index: 1;
`;

const Option = styled(Combobox.Option)`
  padding: 8px 20px;

  &:focus,
  &:hover,
  &[aria-selected="true"],
  &[data-headlessui-state="active"] {
    background-color: slateblue;
    color: white;
    font-weight: 600;
  }

  &:focus,
  &:hover {
    cursor: pointer;
  }

  &:first-of-type {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-of-type {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const InputWrap = styled.div`
  display: flex;
  place-content: center;
  position: relative;
  align-items: center;
  margin: 0 auto;

  svg {
    margin-left: -30px;
  }
`;

function PlacesAutocomplete({
  setSelected,
}: {
  setSelected: (place: google.maps.places.PlaceResult) => void;
}) {
  const {
    ready,
    value,
    setValue,
    suggestions: { data, loading },
  } = usePlacesAutocomplete({
    debounce: 500,
  });
  const [error, setError] = useState(null);

  const onInputChange = useCallback(
    (e) => {
      setValue(e.target.value);
    },
    [setValue]
  );

  const handleSelect = useCallback(
    async (suggestion) => {
      setValue(suggestion.description, false);
      try {
        const details = await getDetails({ placeId: suggestion.place_id });
        if (!details || typeof details === "string") {
          throw new Error("This location could not be found.");
        }

        if (typeof details !== "string") {
          setSelected(details);
        }
      } catch (err) {
        setError(err);
      }
    },
    [setSelected, setValue]
  );

  return (
    <Wrapper>
      {error && <div>{error}</div>}
      <Combobox value={value} onChange={handleSelect}>
        <InputWrap>
          <Combobox.Input
            className="input input-bordered w-full"
            onChange={onInputChange}
          />
          <MagnifyingGlassIcon height={24} width={24} />
        </InputWrap>
        {
          <Options>
            {!ready || loading ? (
              <Loading />
            ) : (
              data.map(
                (suggestion: google.maps.places.AutocompletePrediction) => (
                  <Option
                    key={suggestion.place_id}
                    value={suggestion}
                    className="truncate"
                  >
                    {suggestion.description}
                  </Option>
                )
              )
            )}
          </Options>
        }
      </Combobox>
    </Wrapper>
  );
}

export default PlacesAutocomplete;
