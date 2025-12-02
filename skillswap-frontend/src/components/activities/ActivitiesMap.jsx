import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import useActivityStore from '../../store/activityStore';
import { Zap, Music, Utensils, Users, Crosshair, Search, MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import { toast } from 'react-hot-toast';
import { searchPlaces } from '../../services/locationService';

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

  // Helper to get location with fallback using watchPosition
  const getLocation = (onSuccess, onError) => {
    if (!navigator.geolocation) {
      onError({ code: 0, message: "Geolocation not supported" });
      return;
    }

    const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: Infinity // Accept any cached position
    };

    // Use watchPosition instead of getCurrentPosition as it's more reliable
    // for waiting for the GPS/WiFi radio to wake up
    let watchId;
    let hasSucceeded = false;

    const cleanup = () => {
        if (watchId !== undefined) {
            navigator.geolocation.clearWatch(watchId);
        }
    };

    const handleError = (error) => {
        cleanup();
        console.warn("Location watch failed:", error);
        
        // If high accuracy fails, try one last time with low accuracy using getCurrentPosition
        if (!hasSucceeded && (error.code === 3 || error.code === 2)) {
             navigator.geolocation.getCurrentPosition(
                onSuccess,
                onError,
                {
                    enableHighAccuracy: false,
                    timeout: 20000,
                    maximumAge: Infinity
                }
            );
        } else {
            onError(error);
        }
    };

    try {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                if (!hasSucceeded) {
                    hasSucceeded = true;
                    cleanup();
                    onSuccess(position);
                }
            },
            (error) => {
                // Only handle fatal errors immediately, otherwise wait for timeout
                if (error.code === 1) { // Permission denied
                    handleError(error);
                }
                // For position unavailable (2) or timeout (3), watchPosition might retry internally,
                // but if it emits an error, we can catch it. 
                // However, usually we want to let it keep trying until our own timeout.
            },
            options
        );

        // Set a safety timeout to stop watching if no position is found
        setTimeout(() => {
            if (!hasSucceeded) {
                cleanup();
                handleError({ code: 3, message: "Location request timed out" });
            }
        }, 15000);

    } catch (err) {
        console.error("Watch position error:", err);
        handleError({ code: 2, message: "Position unavailable" });
    }
  };

  const handleShowMyLocation = () => {
    const toastId = toast.loading("Getting your location...");
    
    getLocation(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        toast.success("Location updated!", { id: toastId });
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Could not get your location.";
        
        if (error.code === 1) {
            errorMessage = "Please allow location access in your browser settings.";
        } else if (error.code === 2) {
            errorMessage = "Location unavailable. Check your OS location settings.";
        } else if (error.code === 3) {
            errorMessage = "Location request timed out. Please try again.";
        }
        
        toast.error(errorMessage, { id: toastId, duration: 5000 });
      }
    );
  };

  useEffect(() => {
    fetchActivities();

    // Get user location on load
    getLocation(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        // Optional: Show a subtle toast or just log it. 
        // User requested "automatically fetch", so feedback is good.
        toast.success("Location updated automatically!"); 
      },
      (error) => {
        console.error("Error getting location on load:", error);
        if (error.code === 1) {
            toast.error("Please enable location access to see activities near you.", { duration: 5000 });
        }
        // We don't show other errors on load to avoid annoyance if they just want to browse
      }
    );
  }, []);

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

  // Search Logic
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const searchTimeoutRef = React.useRef(null);
  
  // Import searchPlaces dynamically or assume it's available. 
  // Since we can't easily add imports to the top without reading the whole file again or making assumptions,
  // I will add the import in a separate step or use a require if needed, but standard ES modules need top-level import.
  // Wait, I can use the existing imports if I modify the top of the file.
  // For now, I'll implement the UI and logic, and then add the import in a separate tool call to be safe.
  
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // We need to import searchPlaces. I'll assume it's imported as `searchPlaces`
        const results = await searchPlaces(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectLocation = (place) => {
    const { lat, lng } = place;
    setUserLocation([lat, lng]);
    setSearchResults([]);
    setSearchQuery(""); // Optional: clear query or keep it
    toast.success(`Moved to ${place.display_name.split(',')[0]}`);
  };

  // Helper to check if activity is past
  const isActivityPast = (activity) => {
    const now = new Date();
    let activityEnd = null;
    if (activity.expireAt) {
        activityEnd = new Date(activity.expireAt);
    } else if (activity.time && activity.endTime) {
        try {
            const datePart = activity.time.split('T')[0];
            activityEnd = new Date(`${datePart}T${activity.endTime}:00`);
        } catch (e) {
            return false;
        }
    }
    return activityEnd && activityEnd < now;
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
            html: '<div class="w-4 h-4 bg-[#3B82F6] rounded-full border-2 border-white shadow-lg pulse-ring"></div>',
            className: 'user-location-marker',
            iconSize: [16, 16]
          })}
        />

        {activities
            .filter(activity => !isActivityPast(activity))
            .map((activity) => (
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

      {/* Search Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] w-full max-w-md px-4">
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-[#101726]/90 text-white placeholder-gray-400 focus:outline-none focus:bg-[#101726] focus:border-[#3B82F6] sm:text-sm shadow-lg backdrop-blur-sm transition-all"
                placeholder="Search for a place..."
                value={searchQuery}
                onChange={handleSearch}
            />
            {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-[#3B82F6] border-t-transparent rounded-full"></div>
                </div>
            )}
            
            {/* Results Dropdown */}
            {searchResults.length > 0 && (
                <div className="absolute mt-1 w-full bg-[#101726] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50">
                    {searchResults.map((place) => (
                        <button
                            key={place.place_id}
                            onClick={() => handleSelectLocation(place)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white border-b border-white/5 last:border-0 transition-colors flex items-start gap-2"
                        >
                            <MapPin className="h-4 w-4 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{place.display_name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Overlay Text (from design) - Only show if no search query to avoid clutter */}
      {!selectedActivity && !searchQuery && (
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
