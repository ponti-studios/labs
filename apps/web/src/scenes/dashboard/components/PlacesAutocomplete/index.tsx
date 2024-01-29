import styled from "@emotion/styled";
import { Combobox } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import React, { useCallback, useState } from "react";
import { useQuery } from "react-query";

import Loading from "ui/Loading";
import { usePlacesService } from "src/services/google-maps";

const Wrapper = styled.div`
  max-height: 48px; // This is the maximum height of the input field.
  position: relative;
`;

const Options = styled(Combobox.Options)`
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
    background-color: #037afb;
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

const LoadingWrap = styled.div`
  display: flex;
  place-content: center;
  align-items: center;
  padding: 24px;
  border-radius: 4px;
`;

function PlacesAutocomplete({
  setSelected,
}: {
  setSelected: (place: google.maps.places.PlaceResult) => void;
}) {
  const placesService = usePlacesService();
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState<
    google.maps.places.PlaceResult[]
  >([]);
  const { isLoading, refetch } = useQuery<google.maps.places.PlaceResult[]>({
    queryKey: ["placeDetails", value],
    queryFn: () =>
      new Promise((resolve) => {
        placesService.findPlaceFromQuery(
          {
            query: value,
            fields: ["formatted_address", "geometry", "name", "place_id"],
          },
          (response) => {
            if (!response) resolve([]);
            resolve(response);
          },
        );
      }),
    onSuccess: (data) => {
      setSuggestions(data);
    },
    enabled: !!value,
    retry: false,
    onError: (err) => {
      setError(err);
    },
  });

  const onInputChange = useCallback(
    (e) => {
      if (!placesService) return;

      if (!e.target.value) {
        setSuggestions([]);
        return;
      }

      setValue(e.target.value);

      refetch();
    },
    [placesService, refetch, setValue],
  );

  const handleSelect = useCallback(
    async (suggestion) => {
      setValue(suggestion.description);
      try {
        const details =
          await new Promise<google.maps.places.PlaceResult | null>(
            (resolve) => {
              placesService.getDetails(
                { placeId: suggestion.place_id },
                (place) => {
                  if (!place) resolve(null);
                  resolve(place);
                },
              );
            },
          );

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
    [placesService, setSelected, setValue],
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
          <MagnifyingGlassIcon
            height={24}
            width={24}
            className="text-primary"
          />
        </InputWrap>
        {
          <Options className="bg-white">
            {isLoading ? (
              <LoadingWrap>
                <Loading />
              </LoadingWrap>
            ) : (
              suggestions.map((suggestion) => (
                <Option
                  key={suggestion.place_id}
                  value={suggestion}
                  className="truncate text-primary"
                >
                  {suggestion.name},{" "}
                  <span className="text-primary-content">
                    {suggestion.formatted_address}
                  </span>
                </Option>
              ))
            )}
          </Options>
        }
      </Combobox>
    </Wrapper>
  );
}

export default PlacesAutocomplete;
