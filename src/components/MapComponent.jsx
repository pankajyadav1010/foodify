// MapComponent.jsx
import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '12px'
};

const MapComponent = ({ location }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyDLe6eHGXg5V3Gy-WpMdHNGnXeekZ_tFIw"
  });

  // Default coordinate if missing (e.g. India)
  const mapCenter = location?.lat && location?.lng 
    ? { lat: location.lat, lng: location.lng } 
    : { lat: 20.5937, lng: 78.9629 };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={15}
    >
      {/* Delivery Partner Marker */}
      {location?.lat && location?.lng && (
        <Marker
          position={mapCenter}
          // Using a custom icon (a bicycle or simple color marker)
          icon={{
             url: "data:image/svg+xml;utf-8," + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="#e94560">
                   <circle cx="12" cy="12" r="10" />
                   <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12" fill="white">🚴</text>
                </svg>
            `),
            scaledSize: { width: 36, height: 36 }
          }}
        />
      )}
    </GoogleMap>
  ) : (
    <div className="d-flex align-items-center justify-content-center" style={{ ...containerStyle, background: '#1e2a3a' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading map...</span>
      </div>
    </div>
  );
};

export default React.memo(MapComponent);
