import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, ScaleControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default position if no position is provided
const defaultPosition = [37.7749, -122.4194]; // San Francisco

// Custom icon for the rover
const roverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for the home base
const homeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Add disaster marker data with different types
const DISASTER_MARKERS = [
  { 
    position: [37.7752, -122.4201], 
    type: 'fire', 
    description: 'Building Fire', 
    severity: 'high',
    timestamp: '2023-05-15 14:32',
    iconColor: 'red'
  },
  { 
    position: [37.7740, -122.4180], 
    type: 'flood', 
    description: 'Flash Flooding', 
    severity: 'medium',
    timestamp: '2023-05-15 16:05',
    iconColor: 'blue'
  },
  { 
    position: [37.7760, -122.4210], 
    type: 'earthquake', 
    description: 'Structural Damage', 
    severity: 'high',
    timestamp: '2023-05-15 15:27',
    iconColor: 'gold'
  },
  { 
    position: [37.7730, -122.4170], 
    type: 'chemical', 
    description: 'Chemical Spill', 
    severity: 'medium',
    timestamp: '2023-05-15 15:50',
    iconColor: 'violet'
  },
  { 
    position: [37.7770, -122.4220], 
    type: 'collapse', 
    description: 'Building Collapse', 
    severity: 'high',
    timestamp: '2023-05-15 14:18',
    iconColor: 'black'
  },
  // Additional disaster markers in other areas
  { 
    position: [37.7852, -122.4001], 
    type: 'fire', 
    description: 'Warehouse Fire', 
    severity: 'high',
    timestamp: '2023-05-15 13:45',
    iconColor: 'red'
  },
  { 
    position: [37.7649, -122.4294], 
    type: 'earthquake', 
    description: 'Highway Damage', 
    severity: 'high',
    timestamp: '2023-05-15 14:52',
    iconColor: 'gold'
  }
];

// Create icon function
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Function to get severity color
const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high':
      return '#f44336';
    case 'medium':
      return '#ff9800';
    case 'low':
      return '#4caf50';
    default:
      return '#9e9e9e';
  }
};

// Component to force updating the map and showing disaster markers
function DisasterMarkers({markers}) {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      // Force a map update
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [map]);

  return (
    <>
      {markers.map((marker, index) => (
        <Marker 
          key={index} 
          position={marker.position} 
          icon={createIcon(marker.iconColor)}
        >
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong style={{ color: getSeverityColor(marker.severity) }}>
                {marker.description}
              </strong><br />
              <span style={{ 
                display: 'inline-block', 
                padding: '2px 6px', 
                backgroundColor: getSeverityColor(marker.severity),
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                margin: '4px 0'
              }}>
                {marker.severity.toUpperCase()} SEVERITY
              </span><br />
              Type: {marker.type.charAt(0).toUpperCase() + marker.type.slice(1)}<br />
              Detected: {marker.timestamp}<br />
              <button 
                style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => console.log(`Navigating to disaster at ${marker.position}`)}
              >
                Navigate to Location
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// Component to set up and configure the map
function MapConfig({ center, setMapInstance }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      // Set the map instance for parent component
      setMapInstance(map);
      
      // Force resize in case the map is in a hidden container
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, [map, setMapInstance]);

  return null;
}

const Map = ({ position, path, isConnected }) => {
  const [mapInstance, setMapInstance] = useState(null);
  
  // Update map view when position changes
  useEffect(() => {
    if (mapInstance && position) {
      mapInstance.setView(position, mapInstance.getZoom());
    }
  }, [mapInstance, position]);

  return (
    <Paper sx={{ height: '100%', backgroundColor: '#1e1e1e', color: 'white', overflow: 'hidden' }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" gutterBottom>
          Location Tracking
        </Typography>
        <Divider sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
      </Box>
      
      {!isConnected ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100% - 80px)' }}>
          <Typography variant="body1" color="text.secondary">
            Not connected to rover
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: 'calc(100% - 80px)', width: '100%', position: 'relative' }}>
          <MapContainer 
            center={position || defaultPosition} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <MapConfig center={position || defaultPosition} setMapInstance={setMapInstance} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Disaster markers - always show regardless of rover position */}
            <DisasterMarkers markers={DISASTER_MARKERS} />
            
            {position && (
              <>
                {/* Rover marker with rotating arrow */}
                <Marker position={position} icon={roverIcon}>
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <strong>Rescue Rover</strong><br />
                      Current Position<br />
                      Lat: {position[0].toFixed(4)}<br />
                      Lng: {position[1].toFixed(4)}
                    </div>
                  </Popup>
                </Marker>
                
                {/* Path traversed by the rover */}
                {path && path.length > 1 && (
                  <Polyline
                    positions={path}
                    color="#4fc3f7"
                    weight={3}
                    opacity={0.7}
                    dashArray="5, 10"
                  />
                )}
                
                {/* Home base marker */}
                {path && path.length > 0 && (
                  <Marker position={path[0]} icon={homeIcon}>
                    <Popup>
                      <div style={{ textAlign: 'center' }}>
                        <strong>Home Base</strong><br />
                        Starting Point<br />
                        Lat: {path[0][0].toFixed(4)}<br />
                        Lng: {path[0][1].toFixed(4)}
                      </div>
                    </Popup>
                  </Marker>
                )}
              </>
            )}
            
            <ZoomControl position="bottomright" />
            <ScaleControl position="bottomleft" />
          </MapContainer>
        </Box>
      )}
      
      {/* Legend for disaster markers */}
      {isConnected && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: '16px', 
          right: '16px', 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '10px',
          borderRadius: '4px',
          zIndex: 1001,
          fontSize: '12px',
          minWidth: '150px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'white' }}>
            Disaster Locations
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['fire', 'flood', 'earthquake', 'chemical', 'collapse'].map(type => {
              const count = DISASTER_MARKERS.filter(marker => marker.type === type).length;
              const color = type === 'fire' ? '#ff5252' : 
                            type === 'flood' ? '#2196f3' : 
                            type === 'earthquake' ? '#ffc107' : 
                            type === 'chemical' ? '#9c27b0' : '#212121';
              return (
                <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Box sx={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%',
                    backgroundColor: color
                  }} />
                  <Typography variant="caption" sx={{ color: 'white', flex: 1 }}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'white', 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {count}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default Map; 