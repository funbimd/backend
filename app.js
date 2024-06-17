//you'll have to install react google maps api 
//npm install @react-google-maps/api react-geolocated
//npm install --save react-geolocated

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Autocomplete, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useGeolocated } from 'react-geolocated';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '400px'
};
const center = {
  lat: 37.7749, // Default to San Francisco
  lng: -122.4194
};

function App() {
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [autocomplete, setAutocomplete] = useState(null);
  const destinationRef = useRef();
  const [currentLocation, setCurrentLocation] = useState(center);

  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
  });

  const onLoad = useCallback(map => {
    setMap(map);
    if (coords) {
      const location = {
        lat: coords.latitude,
        lng: coords.longitude,
      };
      setCurrentLocation(location);
      map.panTo(location);
    }
  }, [coords]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setWaypoints([...waypoints, location]);
      }
    }
  };

  const calculateRoute = async () => {
    if (waypoints.length < 1 || destinationRef.current.value === '') {
      return;
    }
    const directionsService = new window.google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: currentLocation,
      destination: destinationRef.current.value,
      waypoints: waypoints.map(point => ({
        location: point,
        stopover: true
      })),
      travelMode: window.google.maps.TravelMode.DRIVING,
    });
    setDirectionsResponse(results);
  };

  return (
    <div>
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" libraries={libraries}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentLocation}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          <Marker position={currentLocation} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              placeholder="Add a stop"
              style={{
                boxSizing: border-box,
                border: 1px solid transparent,
                width: 240px,
                height: 32px,
                padding: 0 12px,
                borderRadius: 3px,
                boxShadow: 0 2px 6px rgba(0, 0, 0, 0.3),
                fontSize: 14px,
                outline: none,
                textOverflow: ellipses,
              }}
            />
          </Autocomplete>
        </GoogleMap>
      </LoadScript>
      <div>
        <input
          type="text"
          placeholder="Enter destination"
          ref={destinationRef}
          style={{ margin: '10px' }}
        />
        <button onClick={calculateRoute}>Calculate Route</button>
      </div>
    </div>
  );
}

export default App;