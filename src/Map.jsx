// Code generated with the help of AI

import React, { useState, useEffect, useMemo } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl';
import circle from '@turf/circle'; 
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

if (!MAPBOX_TOKEN) {
  console.warn('VITE_MAPBOX_TOKEN is not set. Please create a .env file with your Mapbox token.');
}

// Helper function to generate a random offset location near the actual location
const generateAnonymizedLocation = (actualLat, actualLng, anonymityRangeMeters) => {
  
  // Generate random distance (0 to anonymityRangeMeters meters)
  const distance = Math.random() * anonymityRangeMeters;
    const bearing = Math.random() * 360;
  
  // Convert distance and bearing to lat/lng offset
  const latOffset = (distance * Math.cos(bearing * Math.PI / 180)) / 111000;
  const lngOffset = (distance * Math.sin(bearing * Math.PI / 180)) / (111000 * Math.cos(actualLat * Math.PI / 180));
  
  return {
    latitude: actualLat + latOffset,
    longitude: actualLng + lngOffset
  };
};

// Generate interpolated points along Webster Ave with heat values
const generateWebsterData = () => {
  const startLat = 43.706708;
  const startLng = -72.293074;
  const endLat = 43.706242;
  const endLng = -72.291116;
  
  const numPoints = 100; // Number of interpolated points
  const features = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints; // Progress along the street (0 to 1)
    
    const lat = startLat + (endLat - startLat) * t;
    const lng = startLng + (endLng - startLng) * t;
    
    // Assign heat value: 100 for 30% to 60%, 50 for the rest
    const heatValue = (t >= 0.3 && t <= 0.6) ? 100 : 50;
    
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: {
        heat: heatValue
      }
    });
  }
  
  // Houses other than Frat Row
  const additionalLocations = [
    { lat: 43.702812, lng: -72.291661 },
    { lat: 43.702772, lng: -72.290506 },
    { lat: 43.703585, lng: -72.284328 }
  ];
  
  additionalLocations.forEach(location => {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      properties: {
        heat: 100 // High heat value to make these locations stand out
      }
    });
  });
  
  return {
    type: 'FeatureCollection',
    features: features
  };
};

// Fixed location when user doesn't want to share location
const fixedLocation = { latitude: 43.705013, longitude: -72.288718 };

const SafeRadiusMap = () => {
    const [viewport, setViewport] = useState({
      latitude: 40.7128, // Default: NYC
      longitude: -74.0060,
      zoom: 13
    });
    const [actualLocation, setActualLocation] = useState(null);
    const [displayLocation, setDisplayLocation] = useState(null);
    const [anonymityRange, setAnonymityRange] = useState(100);
    const [circleData, setCircleData] = useState(null);
    const [dontShareLocation, setDontShareLocation] = useState(false);
    
    // Generate Webster Ave heatmap data (memoized since it's static)
    const websterHeatmapData = useMemo(() => generateWebsterData(), []);
  
    // Get user's location on load or when checkbox state changes
    useEffect(() => {
      if (dontShareLocation) {
        setActualLocation(fixedLocation);
        const anonymized = generateAnonymizedLocation(
          fixedLocation.latitude, 
          fixedLocation.longitude, 
          anonymityRange
        );
        setDisplayLocation(anonymized);
        setViewport((prev) => ({ ...prev, latitude: anonymized.latitude, longitude: anonymized.longitude }));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setActualLocation({ latitude, longitude });
          const anonymized = generateAnonymizedLocation(latitude, longitude, anonymityRange);
          setDisplayLocation(anonymized);
          setViewport((prev) => ({ ...prev, latitude: anonymized.latitude, longitude: anonymized.longitude }));
        },
        (err) => console.error("Could not find you:", err)
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dontShareLocation]);

    // Regenerate anonymized location when anonymity range changes
    useEffect(() => {
      if (!actualLocation) return;
      
      const anonymized = generateAnonymizedLocation(
        actualLocation.latitude, 
        actualLocation.longitude, 
        anonymityRange
      );
      setDisplayLocation(anonymized);
    }, [anonymityRange, actualLocation]);
  
    // Calculate the circle shape showing anonymity range
    useEffect(() => {
      if (!displayLocation) return;
  
      const myCircle = circle(
        [displayLocation.longitude, displayLocation.latitude], 
        anonymityRange, 
        { units: 'meters' }
      );
  
      setCircleData(myCircle);
    }, [displayLocation, anonymityRange]);
  
    return (
      <div className="map-container">
        <h2>Keep Your Location Anonymous</h2>
        <p>Adjust the slider to control your privacy level. Your location is within the circle.</p>
  
        <div className="checkbox-container">
          <label>
            <input 
              type="checkbox" 
              checked={dontShareLocation}
              onChange={(e) => setDontShareLocation(e.target.checked)}
            />
            <span>Set my location to Baker Berry Library</span>
          </label>
        </div>

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
  
        <div className="map-wrapper">
          <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            {...viewport}
            onMove={evt => setViewport(evt.viewState)}
            className="map-component"
            mapStyle="mapbox://styles/mapbox/light-v11"
          >
            {displayLocation && (
              <Marker 
                latitude={displayLocation.latitude} 
                longitude={displayLocation.longitude} 
                color="red"
              />
            )}
  
            {circleData && (
              <Source id="my-data" type="geojson" data={circleData}>
                <Layer
                  id="point-radius-layer"
                  type="fill"
                  paint={{
                    'fill-color': '#007cbf',
                    'fill-opacity': 0.2
                  }}
                />
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

            <Source id="webster-heatmap" type="geojson" data={websterHeatmapData}>
              <Layer
                id="webster-heatmap-layer"
                type="heatmap"
                paint={{
                  'heatmap-weight': [
                    'interpolate',
                    ['linear'],
                    ['get', 'heat'],
                    50, 0.5,
                    100, 1.0
                  ],
                  'heatmap-intensity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 0.5,
                    20, 1.5
                  ],
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(33,102,172,0)',
                    0.2, 'rgb(103,169,207)',
                    0.4, 'rgb(209,229,240)',
                    0.6, 'rgb(253,219,199)',
                    0.8, 'rgb(239,138,98)',
                    1, 'rgb(178,24,43)'
                  ],
                  'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 2,
                    20, 30
                  ],
                  'heatmap-opacity': 0.7
                }}
              />
            </Source>
          </Map>
        </div>
      </div>
    );
  };
  
  export default SafeRadiusMap;