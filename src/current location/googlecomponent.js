// src/GoogleMapComponent.js
//you'll have to install react google maps api
//npm install @react-google-maps/api react-geolocated
import React, { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { useGeolocated } from 'react-geolocated';

const libraries = ['places'];

const mapContainerStyle = {
  height: '400px',
  width: '100%',
};

const center = {
  lat: -34.397,
  lng: 150.644,
};

const GoogleMapComponent = () => {
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [place, setPlace] = useState(null);
  const [position, setPosition] = useState(null);

  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
  });

  useEffect(() => {
    if (coords) {
      setPosition({
        lat: coords.latitude,
        lng: coords.longitude,
      });
    }
  }, [coords]);

  const onLoad = (map) => {
    setMap(map);
  };

  const options = useMemo<MapOptions>(
    () => ({
      mapId: "",
      disableDefaultUI: true,
    }),
    []
  );

  const onLoadAutocomplete = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      setPlace(place);
      setPosition({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      map.panTo({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" libraries={libraries}>
      <div>
        <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
          <input type="text" placeholder="Enter a place" style={{ width: '300px', height: '40px' }} />
        </Autocomplete>
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={position || center}
        zoom={position ? 15 : 8}
        onLoad={onLoad}
        options={options}
      >
        {position && <Marker position={position} />}
        {place && <Marker position={position} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;