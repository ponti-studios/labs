import styled from "@emotion/styled";
import { Combobox } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { AxiosError } from "axios";
import React, { useCallback, useRef, useState } from "react";
import { useQuery } from "react-query";
import Loading from "ui/Loading";

import FeedbackBlock from "src/components/FeedbackBlock";
import api from "src/services/api";
import { Place, PlaceLocation } from "src/services/types";

const Wrapper = styled.div`
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
  center: PlaceLocation;
  setSelected: (place: Place) => void;
}) {
  const [value, setValue] = useState<Place["googleMapsId"]>("");
  const { data, error, isLoading, refetch } = useQuery<Place[], AxiosError>({
    queryKey: ["placeDetails", center, value],
    queryFn: async () => {
      if (value.length < 3 || !center) return Promise.resolve([]);

      const response = await api.get<Place[]>(`/places/search`, {
        params: {
          query: value,
          latitude: center.latitude,
          longitude: center.longitude,
          radius: 100,
        },
      });

      return response.data;
    },
    enabled: !!value,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // This debounce prevents excess API requests.
  const timeoutId = useRef(null);
  const DEBOUNCE_TIME_MS = 1000;
  const onInputChange = useCallback(
    (e) => {
      setValue(e.target.value);

      clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(async () => {
        refetch();
      }, DEBOUNCE_TIME_MS);
    },
    [refetch, setValue],
  );

  const handleSelect = useCallback(
    async (googleMapsId: Place["googleMapsId"]) => {
      setSelected(data.find((p) => p.googleMapsId === googleMapsId));
    },
    [data, setSelected],
  );

  return (
    <Wrapper>
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
        {(isLoading || data) && (
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
        )}
      </Combobox>
      {error && <FeedbackBlock>{error.message}</FeedbackBlock>}
    </Wrapper>
  );
}

export default PlacesAutocomplete;
