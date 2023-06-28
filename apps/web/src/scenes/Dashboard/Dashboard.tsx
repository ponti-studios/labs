import React, { useState, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
const { VITE_GOOGLE_API_KEY } = process.env;

const Dashboard = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: VITE_GOOGLE_API_KEY,
  });

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return <div>Dashboard</div>;
};

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
