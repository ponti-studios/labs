import styled from "@emotion/styled";
import { Combobox } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import React, { useCallback, useRef, useState } from "react";
import { useQuery } from "react-query";
import Loading from "ui/Loading";

import { usePlacesService } from "src/services/places";
import { Place } from "src/services/types";
import { AxiosError } from "axios";

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
  center,
  setSelected,
}: {
  center: google.maps.LatLngLiteral;
  setSelected: (place: Place) => void;
}) {
  const { getPlace, textSearch } = usePlacesService();
  const [value, setValue] = useState("");
  const [error, setError] = useState<AxiosError>();
  const { data, isLoading, refetch } = useQuery<Place[]>({
    queryKey: ["placeDetails", center, value],
    queryFn: () => {
      if (value.length < 3 || !center) return Promise.resolve([]);

      return textSearch({
        query: value,
        location: center,
        radius: 100,
      });
    },
    enabled: !!value,
    retry: false,
    onError: (err) => {
      setError(err as AxiosError);
    },
  });

  const onInputChange = useCallback(
    (e) => {
      if (!textSearch) return;

      setValue(e.target.value);

      refetch();
    },
    [textSearch, refetch, setValue],
  );

  // This debounce prevents excess API requests.
  const timeoutId = useRef(null);
  const DEBOUNCE_TIME_MS = 1000;

  const handleSelect = useCallback(
    async (googleMapsId: Place["googleMapsId"]) => {
      clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(async () => {
        try {
          const place = await getPlace({
            googleMapsId,
          });

          if (!place || typeof place === "string") {
            throw new Error("This location could not be found.");
          }

          if (typeof place !== "string") {
            setSelected(place);
          }
        } catch (err) {
          setError(err);
        }
      }, DEBOUNCE_TIME_MS);
    },
    [getPlace, setSelected],
  );

  return (
    <Wrapper>
      {error && <div>{error.message}</div>}
      <Combobox value={value} onChange={handleSelect}>
        <InputWrap>
          <Combobox.Input
            className="input input-bordered w-full"
            value={value}
            onChange={onInputChange}
          />
          <MagnifyingGlassIcon
            height={24}
            width={24}
            className="text-primary"
          />
        </InputWrap>
        {isLoading ||
          (data && (
            <Options className="bg-white overflow-y-scroll">
              {isLoading ? (
                <LoadingWrap>
                  <Loading />
                </LoadingWrap>
              ) : (
                data.map((suggestion) => (
                  <Option
                    key={suggestion.googleMapsId}
                    value={suggestion.googleMapsId}
                    className="truncate text-primary"
                  >
                    <span className="font-medium">{suggestion.name}</span>,{" "}
                    <span className="text-slate-400 font-light">
                      {suggestion.address}
                    </span>
                  </Option>
                ))
              )}
            </Options>
          ))}
      </Combobox>
    </Wrapper>
  );
}

export default PlacesAutocomplete;
