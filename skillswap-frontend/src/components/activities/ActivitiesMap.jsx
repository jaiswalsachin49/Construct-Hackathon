import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useActivityStore from '../../store/activityStore';
import { Zap, Music, Utensils, Users, Crosshair } from 'lucide-react';
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
  const { activities, selectedActivity, selectActivity, userLocation, setUserLocation, fetchActivities } = useActivityStore();

  useEffect(() => {
    fetchActivities();
    
    // Get user location on load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Keep default or handle error
        }
      );
    }
  }, []);

  const handleShowMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Create custom icons based on category
  const createCustomIcon = (activity, isSelected) => {
    let borderColor = 'border-gray-500';
    
    if (activity.category === 'Running') {
      borderColor = 'border-purple-500';
    } else if (activity.category === 'Music') {
      borderColor = 'border-blue-500';
    } else if (activity.category === 'Cooking') {
      borderColor = 'border-orange-500';
    }

    const iconHtml = renderToString(
      <div className={`relative w-12 h-12 rounded-full border-4 ${borderColor} overflow-hidden shadow-lg bg-white`}>
        <img 
            src={activity.host.profilePhoto || "https://github.com/shadcn.png"} 
            alt="Host" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {isSelected && (
           <div className="absolute inset-0 rounded-full animate-ripple bg-white/30 z-[1]" />
        )}
      </div>
    );

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker-icon', 
      iconSize: [48, 48],
      iconAnchor: [24, 24]
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
            key={activity._id}
            position={activity.coordinates}
            icon={createCustomIcon(activity, selectedActivity?._id === activity._id)}
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

      {/* Show My Location Button */}
      <button
        onClick={handleShowMyLocation}
        className="absolute bottom-6 right-6 z-[400] p-3 bg-[#101726] border border-white/10 rounded-full text-white shadow-lg hover:bg-[#1a2436] transition-colors"
        title="Show My Location"
      >
        <Crosshair className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ActivitiesMap;
