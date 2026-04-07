// Type declaration for the Google Maps API
declare global {
  interface Window {
    gm_authFailure: () => void;
  }
}

/**
 * Initialize the Google Maps application
 */
function initialize(): void {
  // DOM elements
  const directionsList = document.getElementById('directions') as HTMLUListElement;
  const directionsContainer = document.getElementById('directionsContainer') as HTMLDivElement;
  const directionsSummary = document.getElementById('directions-summary') as HTMLDivElement;
  const mapEl = document.getElementById('map-canvas') as HTMLDivElement;
  const mapLoading = document.getElementById('map-loading') as HTMLDivElement;
  const locationForm = document.getElementById('locationForm') as HTMLFormElement;
  const directionsForm = document.getElementById('directionsForm') as HTMLFormElement;

  // Google Maps services
  const geocoder = new google.maps.Geocoder();
  const directionsService = new google.maps.DirectionsService();
  
  // Store markers for later management
  let markers: google.maps.Marker[] = [];
  
  // Initialize map with default location
  const mapOptions: google.maps.MapOptions = {
    center: new google.maps.LatLng(40.7128, -74.0060), // New York City
    zoom: 12,
    mapTypeControl: true,
    streetViewControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    fullscreenControl: true,
    zoomControl: true
  };

  // Show the map and hide the loading spinner
  mapEl.classList.remove('hidden');
  mapLoading.classList.add('hidden');
  
  const map = new google.maps.Map(mapEl, mapOptions);

  /**
   * Clear existing markers from the map
   */
  const clearMarkers = (): void => {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
  };

  /**
   * Generate markers for geocoded locations
   * @param locations - Array of geocoded locations
   * @returns Array of Google Maps markers
   */
  const generateMarkers = (locations: google.maps.GeocoderResult[]): google.maps.Marker[] => {
    // Clear existing markers
    clearMarkers();
    
    return locations.map((locale: google.maps.GeocoderResult) => {
      if (!locale.geometry || !locale.geometry.location) {
        console.error('Invalid location data:', locale);
        return null;
      }
      
      const marker = new google.maps.Marker({
        position: locale.geometry.location,
        map: map,
        title: locale.formatted_address || 'Unknown location',
        animation: google.maps.Animation.DROP
      });
      
      // Store marker for future cleanup
      markers.push(marker);
      
      // Center the map on the new marker
      map.setCenter(locale.geometry.location);
      
      // Zoom in closer for a better view
      map.setZoom(14);
      
      // Add info window for marker
      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="info-window"><strong>${locale.formatted_address || 'Unknown location'}</strong></div>`
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      return marker;
    }).filter((marker): marker is google.maps.Marker => marker !== null);
  };

  // Handle form submission for directions
  directionsForm.onsubmit = function(e: SubmitEvent): void {
    e.preventDefault();
    
    // Type assertion to access form elements properly
    const form = e.currentTarget as HTMLFormElement;
    const originInput = form.querySelector('#origin') as HTMLInputElement;
    const destinationInput = form.querySelector('#destination') as HTMLInputElement;
    
    // Validate inputs
    if (!originInput.value.trim() || !destinationInput.value.trim()) {
      alert('Please enter both starting point and destination.');
      return;
    }
    
    // Clear previous directions
    directionsList.innerHTML = '';
    directionsSummary.innerHTML = '';
    
    // Show loading indicator
    directionsContainer.classList.remove('hidden');
    directionsList.innerHTML = '<li class="text-gray-500">Loading directions...</li>';
    
    const request: google.maps.DirectionsRequest = {
      origin: originInput.value,
      destination: destinationInput.value,
      travelMode: google.maps.TravelMode.DRIVING,
    };
    
    directionsService.route(request, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
      // Clear loading indicator
      directionsList.innerHTML = '';
      
      if (status === google.maps.DirectionsStatus.OK && result) {
        const routes = result.routes;
        if (routes.length === 0) {
          directionsList.innerHTML = `
            <li class="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              No routes found. Please try different locations.
            </li>
          `;
          return;
        }
        
        const legs = routes[0].legs;
        if (legs.length === 0) {
          directionsList.innerHTML = `
            <li class="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              No route legs found. Please try different locations.
            </li>
          `;
          return;
        }
        
        const steps = legs[0].steps;
        
        // Show the directions container
        directionsContainer.classList.remove('hidden');
        
        // Add a summary at the top
        directionsSummary.className = 'mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md';
        directionsSummary.innerHTML = `
          <p class="font-medium text-blue-800">From: ${legs[0].start_address}</p>
          <p class="font-medium text-blue-800">To: ${legs[0].end_address}</p>
          <p class="mt-2 text-blue-700">Distance: ${legs[0].distance?.text || 'Unknown'} • Duration: ${legs[0].duration?.text || 'Unknown'}</p>
        `;
        
        // Create a DirectionsRenderer to display the route on the map
        new google.maps.DirectionsRenderer({
          map: map,
          directions: result,
          suppressMarkers: false
        });
        
        // Clear any previous markers since the directions will show its own
        clearMarkers();
        
        // Add each step to the directions list
        steps.forEach((step: google.maps.DirectionsStep) => {
          const li = document.createElement('li');
          li.className = 'py-2';
          li.innerHTML = step.instructions;
          
          // Add distance information
          if (step.distance && step.distance.text) {
            const distance = document.createElement('span');
            distance.className = 'text-sm text-gray-500 ml-2';
            distance.textContent = step.distance.text;
            li.appendChild(distance);
          }
          
          directionsList.appendChild(li);
        });
      } else {
        // Show error message
        directionsList.innerHTML = `
          <li class="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            Could not calculate directions: ${status}. Please check your addresses and try again.
          </li>
        `;
      }
    });
  };


  // Handle form submission for location search
  locationForm.onsubmit = function(e: SubmitEvent): void {
    e.preventDefault();
    
    // Type assertion to access form elements properly
    const form = e.currentTarget as HTMLFormElement;
    const locationInput = form.querySelector('#location') as HTMLInputElement;
    
    // Validate input
    if (!locationInput.value.trim()) {
      alert('Please enter a location to search');
      return;
    }
    
    // Hide directions container if visible
    directionsContainer.classList.add('hidden');
    
    geocoder.geocode(
      {
        address: locationInput.value,
      },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const markers = generateMarkers(results);
          
          // If we got multiple results, fit bounds to include all markers
          if (results.length > 1) {
            const bounds = new google.maps.LatLngBounds();
            markers.forEach(marker => bounds.extend(marker.getPosition() as google.maps.LatLng));
            map.fitBounds(bounds);
          }
        } else {
          alert(`Could not find location: ${status}. Please try a different search term.`);
        }
      }
    );
  };

  // Add error handling for maps
  window.gm_authFailure = (): void => {
    mapLoading.classList.add('hidden');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'p-4 bg-red-100 border border-red-400 text-red-700 rounded';
    errorDiv.innerHTML = `
      <h3 class="font-bold">Google Maps Error</h3>
      <p>There was an error loading Google Maps. Please check your API key.</p>
    `;
    const container = document.getElementById('map-container');
    if (container) {
      container.appendChild(errorDiv);
    }
  };
}

// Initialize the map when the window loads
google.maps.event.addDomListener(window, 'load', initialize);

// Export empty object to make TypeScript happy with module format
export {};
