import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Tag, Globe, Search } from 'lucide-react';
import useActivityStore from '../../store/activityStore';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { searchPlaces } from '../../services/locationService';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map updates
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);
  return null;
};

const LocationPicker = ({ position, setPosition, setLocationName }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      // Optional: Reverse geocoding could go here to update name
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const CreateActivityModal = ({ isOpen, onClose }) => {
  const { createActivity, userLocation } = useActivityStore();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Running',
    date: '',
    time: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    isOnline: false
  });
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Location Search State
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize coordinates with user location when modal opens
  useEffect(() => {
    if (isOpen && userLocation) {
      setCoordinates(userLocation);
    }
  }, [isOpen, userLocation]);

  // Location search with debouncing
  useEffect(() => {
    const searchLocation = async () => {
      if (formData.location.length > 2 && isSearching) {
        const results = await searchPlaces(formData.location);
        setLocationSuggestions(results);
        setShowSuggestions(true);
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(searchLocation, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.location, isSearching]);

  const handleLocationSelect = (place) => {
    setFormData({ ...formData, location: place.display_name });
    setCoordinates([place.lat, place.lng]);
    setLocationSuggestions([]);
    setShowSuggestions(false);
    setIsSearching(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!coordinates) {
      setError("Please select a location on the map.");
      setLoading(false);
      return;
    }

    try {
      const combinedTime = `${formData.date}T${formData.time}`;
      await createActivity({
        ...formData,
        time: combinedTime,
        startTime: formData.startTime,
        endTime: formData.endTime,
        coordinates: coordinates
      });
      onClose();
      setFormData({ title: '', category: 'Running', date: '', time: '', location: '', description: '', isOnline: false });
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.response?.data?.msg || err.message || "Failed to create activity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#101726] border border-white/10 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Create Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="h-full">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
              {/* Left Column: Form Fields (2/5) */}
              <div className="space-y-6 lg:col-span-2 overflow-y-auto pr-2">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#00C4FF] focus:outline-none"
                    placeholder="e.g., Morning Run"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#00C4FF] focus:outline-none appearance-none"
                      >
                        <option value="Running">Running</option>
                        <option value="Yoga">Yoga</option>
                        <option value="Music">Music</option>
                        <option value="Cooking">Cooking</option>
                        <option value="Tech">Tech</option>
                        <option value="Art">Art</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#00C4FF] focus:outline-none [color-scheme:dark]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Start Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#00C4FF] focus:outline-none [color-scheme:dark]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">End Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#00C4FF] focus:outline-none [color-scheme:dark]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Location Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        setIsSearching(true);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#00C4FF] focus:outline-none"
                      placeholder="Search for a location..."
                      required
                      autoComplete="off"
                    />
                  </div>

                  {/* Location Suggestions Dropdown */}
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-[#1A2333] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {locationSuggestions.map((place) => (
                        <button
                          key={place.place_id}
                          type="button"
                          onClick={() => handleLocationSelect(place)}
                          className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white border-b border-white/5 last:border-0 transition-colors flex items-start gap-2"
                        >
                          <MapPin className="h-4 w-4 text-[#00C4FF] mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{place.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {coordinates && (
                    <p className="text-[10px] text-green-400 mt-1 ml-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Pin set at {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#00C4FF] focus:outline-none h-24 resize-none"
                    placeholder="Describe your activity..."
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isOnline: !formData.isOnline })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${formData.isOnline
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                      }`}
                  >
                    <Globe className="h-3 w-3" />
                    {formData.isOnline ? 'Online Event' : 'In-Person Event'}
                  </button>
                </div>
              </div>

              {/* Right Column: Map (3/5) */}
              <div className="flex flex-col h-full min-h-[400px] lg:col-span-3">
                <label className="block text-xs font-medium text-gray-400 mb-1">Pin Location on Map</label>
                <div className="flex-1 rounded-xl overflow-hidden border border-white/10 relative">
                  <MapContainer
                    center={userLocation || [12.9716, 77.5946]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <MapUpdater center={coordinates} />
                    <LocationPicker position={coordinates} setPosition={setCoordinates} />
                  </MapContainer>
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none z-[1000]">
                    Tap map to set location
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-[#00C4FF] text-[#0A0F1F] font-bold rounded-xl hover:bg-[#00b0e6] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Activity'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityModal;
