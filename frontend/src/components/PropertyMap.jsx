import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons not displaying sometimes
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PropertyMap = ({ lat, lng, title = "Property Location", isSatellite = false }) => {
  // Only show the map if both lat and lng are valid numbers
  const isValid = typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng);

  if (!isValid) {
    return <div className="text-gray-500 text-center py-8">Coordinates are not provided or invalid.</div>;
  }

  // Use Esri for satellite, OSM for normal
  const tileUrl = isSatellite
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution = isSatellite
    ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    : '&copy; OpenStreetMap contributors';

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', minHeight: 300, borderRadius: "0.5rem", position:"sticky" }}
    >
      <TileLayer
        url={tileUrl}
        attribution={attribution}
      />
      <Marker position={[lat, lng]}>
        <Popup>{title}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default PropertyMap;
