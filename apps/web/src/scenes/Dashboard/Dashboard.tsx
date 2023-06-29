import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import styled from "@emotion/styled";
import React, { useState } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";
import { Combobox } from "@headlessui/react";

import Loading from "ui/Loading";

import styles from "./Dashboard.module.css";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const PlacesAutocompleteWrap = styled.div`
  margin-bottom: 1rem;
`;

const Dashboard = ({ isMapLoaded }: { isMapLoaded: boolean }) => {
  const [selected, setSelected] = useState(null);
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Default center (San Francisco)

  if (!isMapLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Wrap>
      <PlacesAutocompleteWrap>
        <PlacesAutocomplete setSelected={setSelected} />
      </PlacesAutocompleteWrap>
      <GoogleMap
        zoom={10}
        center={center}
        mapContainerClassName={styles.mapContainer}
      >
        {selected && <Marker position={selected} />}
      </GoogleMap>
    </Wrap>
  );
};

function PlacesAutocomplete({ setSelected }) {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data, loading },
    clearSuggestions,
  } = usePlacesAutocomplete({});

  return (
    <Combobox value={value} onChange={setSelected}>
      <Combobox.Input onChange={(event) => setValue(event.target.value)} />
      <Combobox.Options>
        {!ready || loading ? (
          <Loading />
        ) : (
          data.map((suggestion: google.maps.places.AutocompletePrediction) => (
            <Combobox.Option key={suggestion.place_id} value={suggestion}>
              {suggestion.description}
            </Combobox.Option>
          ))
        )}
      </Combobox.Options>
    </Combobox>
  );
}

export default Dashboard;

// const MapComponent = () => {
//   const [map, setMap] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [marker, setMarker] = useState(null);

//   useEffect(() => {
//     // Load the Google Maps JavaScript API script
//     const googleMapScript = document.createElement('script');
//     googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${VITE_GOOGLE_API_KEY}&libraries=places`;
//     googleMapScript.async = true;
//     window.document.body.appendChild(googleMapScript);
//     googleMapScript.addEventListener('load', initMap);

//     return () => {
//       googleMapScript.removeEventListener('load', initMap);
//     };
//   }, []);

//   const initMap = () => {
//     const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
//       center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
//       zoom: 12, // Default zoom level
//     });
//     setMap(mapInstance);
//   };

//   const handleSearch = () => {
//     if (map) {
//       const geocoder = new window.google.maps.Geocoder();
//       geocoder.geocode({ address: searchTerm }, (results, status) => {
//         if (status === window.google.maps.GeocoderStatus.OK) {
//           const { location } = results[0].geometry;
//           map.panTo(location);

//           if (marker) {
//             marker.setMap(null);
//           }

//           const newMarker = new window.google.maps.Marker({
//             position: location,
//             map,
//           });
//           setMarker(newMarker);
//         }
//       });
//     }
//   };

//   return (
//     <div>
//       <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//       <button onClick={handleSearch}>Search</button>
//       <div id="map" style={{ height: '400px', width: '100%' }}></div>
//     </div>
//   );
// };

// export default MapComponent;
