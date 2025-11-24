import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useActivityStore from '../../store/activityStore';
import { Zap, Music, Utensils, Users } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix for default marker icon issues in some bundlers, though we are using custom icons mainly.
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map center updates
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, {
      duration: 1.5
    });
  }, [center, map]);
  return null;
};

const ActivitiesMap = () => {
  const { activities, selectedActivity, selectActivity, userLocation } = useActivityStore();

  // Create custom icons based on category
  const createCustomIcon = (category, isSelected) => {
    let IconComponent = Users;
    let colorClass = 'bg-gray-500';
    
    if (category === 'Running') {
      IconComponent = Zap;
      colorClass = 'bg-purple-500';
    } else if (category === 'Music') {
      IconComponent = Music;
      colorClass = 'bg-blue-500';
    } else if (category === 'Cooking') {
      IconComponent = Utensils;
      colorClass = 'bg-orange-500';
    }

    const iconHtml = renderToString(
      <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 border-white ${colorClass} text-white`}>
        <IconComponent size={20} />
        {isSelected && (
           <div className="absolute inset-0 rounded-full animate-ripple bg-white/50 z-[-1]" />
        )}
      </div>
    );

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker-icon', // We'll need to ensure this class doesn't override too much, or use !important in inline styles if needed, but divIcon is usually clean.
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  return (
    <div className="flex-1 h-full relative z-0"> 
      <MapContainer 
        center={userLocation} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        className="bg-[#0A0F1F]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater center={selectedActivity ? selectedActivity.coordinates : userLocation} />

        {/* User Location Marker */}
        <Marker 
            position={userLocation}
            icon={L.divIcon({
                html: '<div class="w-4 h-4 bg-[#00C4FF] rounded-full border-2 border-white shadow-lg pulse-ring"></div>',
                className: 'user-location-marker',
                iconSize: [16, 16]
            })}
        />

        {activities.map((activity) => (
          <Marker
            key={activity.id}
            position={activity.coordinates}
            icon={createCustomIcon(activity.category, selectedActivity?.id === activity.id)}
            eventHandlers={{
              click: () => selectActivity(activity),
            }}
          />
        ))}
      </MapContainer>
      
      {/* Overlay Text (from design) */}
      {!selectedActivity && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <h1 className="text-4xl font-light text-white/10 tracking-widest">EXPLORE</h1>
          </div>
      )}
    </div>
  );
};

export default ActivitiesMap;
