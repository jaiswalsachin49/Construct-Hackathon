import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Tag, Globe } from 'lucide-react';
import useActivityStore from '../../store/activityStore';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

const LocationPicker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
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

  // Initialize coordinates with user location when modal opens
  useEffect(() => {
    if (isOpen && userLocation) {
      setCoordinates(userLocation);
    }
  }, [isOpen, userLocation]);

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
      <div className="bg-[#101726] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
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

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
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
                            {/* Changed: Added Start Time and End Time inputs */}
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

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Location Name</label>
                            <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-[#00C4FF] focus:outline-none"
                                placeholder="e.g., Central Park"
                                required
                            />
                            </div>
                            {coordinates && (
                                <p className="text-[10px] text-green-400 mt-1 ml-1">
                                    ✓ Pin set at {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
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
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                formData.isOnline
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                : 'bg-white/5 text-gray-400 border border-white/10'
                            }`}
                            >
                            <Globe className="h-3 w-3" />
                            {formData.isOnline ? 'Online Event' : 'In-Person Event'}
                            </button>
                        </div>
                    </div>

                    {/* Map Picker */}
                    <div className="h-[300px] md:h-auto rounded-xl overflow-hidden border border-white/10 relative">
                        <MapContainer 
                            center={userLocation || [12.9716, 77.5946]} 
                            zoom={13} 
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                            <LocationPicker position={coordinates} setPosition={setCoordinates} />
                        </MapContainer>
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none z-[1000]">
                            Tap map to set location
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#00C4FF] text-[#0A0F1F] font-bold rounded-xl hover:bg-[#00b0e6] transition-colors disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Activity'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityModal;
