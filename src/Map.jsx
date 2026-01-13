import React, { useState, useEffect } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl';
import circle from '@turf/circle'; 
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';


const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWNobzU3NTAiLCJhIjoiY21rYnp5MDQ0MDl0ejNmcHZjYWs0ZHJybiJ9.kwfXad3DuZYNPufNfKtM6g'

// Helper function to generate a random offset location near the actual location
// This provides privacy by not showing the exact location
// The user can be anywhere within the anonymityRange radius
const generateAnonymizedLocation = (actualLat, actualLng, anonymityRangeMeters) => {
  // Generate random distance (0 to anonymityRangeMeters meters)
  // This means the user can be anywhere within the specified radius
  const distance = Math.random() * anonymityRangeMeters;
  
  // Generate random bearing (0 to 360 degrees)
  const bearing = Math.random() * 360;
  
  // Convert distance and bearing to lat/lng offset
  // Approximate: 1 degree latitude ≈ 111,000 meters
  // Longitude varies by latitude, but we'll use a simple approximation
  const latOffset = (distance * Math.cos(bearing * Math.PI / 180)) / 111000;
  const lngOffset = (distance * Math.sin(bearing * Math.PI / 180)) / (111000 * Math.cos(actualLat * Math.PI / 180));
  
  return {
    latitude: actualLat + latOffset,
    longitude: actualLng + lngOffset
  };
};

const SafeRadiusMap = () => {
    // 2. STATE: This is the "Brain" of the component
    const [viewport, setViewport] = useState({
      latitude: 40.7128, // Default: NYC (until we get user location)
      longitude: -74.0060,
      zoom: 13
    });
    const [actualLocation, setActualLocation] = useState(null); // The REAL location (kept private)
    const [displayLocation, setDisplayLocation] = useState(null); // The anonymized location (shown on map)
    const [anonymityRange, setAnonymityRange] = useState(100); // Anonymity range in meters (default 500m)
    const [circleData, setCircleData] = useState(null); // The shape of the circle
  
    // 3. EFFECT: Get User's Real Location on load
    useEffect(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          
          // Store actual location privately (not displayed)
          setActualLocation({ latitude, longitude });
          
          // Generate initial anonymized location using current anonymity range
          const anonymized = generateAnonymizedLocation(latitude, longitude, anonymityRange);
          setDisplayLocation(anonymized);
          
          // Move the camera to the anonymized location
          setViewport((prev) => ({ ...prev, latitude: anonymized.latitude, longitude: anonymized.longitude }));
        },
        (err) => console.error("Could not find you:", err)
      );
    }, []);

    // 3b. EFFECT: Regenerate anonymized location when anonymity range changes
    useEffect(() => {
      if (!actualLocation) return;
      
      // Generate new anonymized location with updated range
      const anonymized = generateAnonymizedLocation(
        actualLocation.latitude, 
        actualLocation.longitude, 
        anonymityRange
      );
      setDisplayLocation(anonymized);
    }, [anonymityRange, actualLocation]);
  
    // 4. EFFECT: Calculate the Circle Shape
    // The circle shows the anonymity range - where the user could actually be
    useEffect(() => {
      if (!displayLocation) return;
  
      // Use Turf.js to create a circle polygon showing the anonymity range
      // The circle radius matches the anonymity range, showing where the user could be
      // Arguments: [centerLng, centerLat], radius, units
      const myCircle = circle(
        [displayLocation.longitude, displayLocation.latitude], 
        anonymityRange, 
        { units: 'meters' }
      );
  
      setCircleData(myCircle);
    }, [displayLocation, anonymityRange]);
  
    return (
      <div className="map-container">
        <h2>Location Anonymity</h2>
        <p>Adjust the slider to control your privacy level. The circle shows where you could actually be located.</p>
  
        {/* 5. THE SLIDER */}
        <div className="slider-container">
          <label>Anonymity Range: <strong>{anonymityRange} meters</strong></label>
          <input 
            type="range" 
            min="10" max="5000" step="10" 
            value={anonymityRange} 
            onChange={(e) => setAnonymityRange(Number(e.target.value))}
            className="slider-input"
          />
          <div className="privacy-indicator">
            {anonymityRange >= 10 && anonymityRange < 50 && 'Low privacy - you could be within ' + anonymityRange + 'm'}
            {anonymityRange >= 50 && anonymityRange < 500 && 'Medium privacy - you could be within ' + anonymityRange + 'm'}
            {anonymityRange >= 500 && 'High privacy - you could be anywhere within ' + anonymityRange + 'm'}
          </div>
        </div>
  
        {/* 6. THE MAP */}
        <div className="map-wrapper">
          <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            {...viewport}
            onMove={evt => setViewport(evt.viewState)} // Allows dragging the map
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/light-v11" // The pretty "Airbnb" theme
          >
            {/* A. The Marker (Showing anonymized location, not exact position) */}
            {displayLocation && (
              <Marker 
                latitude={displayLocation.latitude} 
                longitude={displayLocation.longitude} 
                color="red"
              />
            )}
  
            {/* B. The Radius Visuals */}
            {circleData && (
              <Source id="my-data" type="geojson" data={circleData}>
                {/* Layer 1: The Blue Fill */}
                <Layer
                  id="point-radius-layer"
                  type="fill"
                  paint={{
                    'fill-color': '#007cbf',
                    'fill-opacity': 0.2
                  }}
                />
                {/* Layer 2: The Blue Outline */}
                <Layer
                  id="point-radius-outline"
                  type="line"
                  paint={{
                    'line-color': '#007cbf',
                    'line-width': 2
                  }}
                />
              </Source>
            )}
          </Map>
        </div>
      </div>
    );
  };
  
  export default SafeRadiusMap;