import React, { useCallback } from "react";
import { Combobox } from "@headlessui/react";
import usePlacesAutocomplete, { getGeocode } from "use-places-autocomplete";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

import Loading from "ui/Loading";
import styled from "@emotion/styled";

const Options = styled(Combobox.Options)`
  margin-top: 8px;
  border: 0.5px solid slateblue;
  border-radius: 8px;
  width: 100%;
  position: absolute;
  top: 3rem;
  left: 4px;
  z-index: 1;
  background-color: white;
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
  setSelected: React.Dispatch<google.maps.LatLng>;
}) {
  const {
    ready,
    value,
    setValue,
    suggestions: { data, loading },
    clearSuggestions,
  } = usePlacesAutocomplete({});

  const onInputChange = useCallback(
    (e) => {
      setValue(e.target.value);
      clearSuggestions();
    },
    [clearSuggestions, setValue]
  );

  const handleSelect = useCallback(
    async (suggestion) => {
      setValue(suggestion.description, false);
      clearSuggestions();
      const geocode = await getGeocode({ address: suggestion.description });
      setSelected(geocode[0].geometry.location);
    },
    [clearSuggestions, setSelected, setValue]
  );

  return (
    <Combobox value={value} onChange={handleSelect}>
      <InputWrap>
        <Combobox.Input
          className="input input-bordered w-full"
          onChange={onInputChange}
        />
        <MagnifyingGlassIcon height={24} width={24} />
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
      </InputWrap>
    </Combobox>
  );
}

export default PlacesAutocomplete;
