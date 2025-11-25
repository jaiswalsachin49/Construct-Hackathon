import React, { useState, useRef } from 'react';
import { Search, MapPin, Users, Music, Utensils, Zap, Filter, Plus } from 'lucide-react';
import useActivityStore from '../../store/activityStore';
import CreateActivityModal from './CreateActivityModal';

const ActivitiesSidebar = () => {
  const { activities, filters, setFilter, selectActivity, selectedActivity, userLocation } = useActivityStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardMousePositions, setCardMousePositions] = useState({});

  const categories = [
    { id: 'All', label: 'All', icon: Filter },
    { id: 'Running', label: 'Running', icon: Zap },
    { id: 'Yoga', label: 'Yoga', icon: Users },
    { id: 'Music', label: 'Music', icon: Music },
    { id: 'Cooking', label: 'Cooking', icon: Utensils },
  ];

  // Haversine formula to calculate distance between two coordinates in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      activity.location.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'All' || activity.category === filters.category;

    // Distance filtering
    let withinDistance = true;
    if (userLocation && activity.coordinates && activity.coordinates.length === 2) {
      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        activity.coordinates[0],
        activity.coordinates[1]
      );
      withinDistance = distance <= filters.distanceRange;
    }

    return matchesSearch && matchesCategory && withinDistance;
  });

  const handleCardMouseMove = (activityId, e, cardRef) => {
    if (!cardRef) return;
    const rect = cardRef.getBoundingClientRect();
    setCardMousePositions(prev => ({
      ...prev,
      [activityId]: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }));
  };

  return (
    <div className="w-full lg:w-96 bg-[#101726] border-r border-white/10 flex flex-col h-full max-h-screen lg:max-h-none overflow-hidden">
      <div className="p-4 space-y-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Live Meetup Spots</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#00C4FF]/20 text-[#00C4FF] rounded-lg hover:bg-[#00C4FF]/30 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-bold">Create</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by skill or location..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00C4FF]"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter('category', cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filters.category === cat.id
                ? 'bg-[#00C4FF]/20 text-[#00C4FF] border border-[#00C4FF]/50'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
            >
              <cat.icon className="h-3 w-3" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Distance Range Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Distance Range</span>
            <span className="text-xs font-mono text-[#00C4FF]">{filters.distanceRange} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={filters.distanceRange}
            onChange={(e) => setFilter('distanceRange', parseInt(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00C4FF]"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>1km</span>
            <span>100km</span>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-400">
            <MapPin className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm">No activities found.</p>
            <p className="text-xs mt-1">Create your own for meeting people!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-[#00C4FF] text-xs hover:underline"
            >
              Start an activity
            </button>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const ActivityCard = ({ activity }) => {
              const cardRef = useRef(null);
              const mousePos = cardMousePositions[activity._id] || { x: 0, y: 0 };

              return (
                <div
                  ref={cardRef}
                  key={activity._id}
                  onClick={() => selectActivity(activity)}
                  onMouseMove={(e) => handleCardMouseMove(activity._id, e, cardRef.current)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all relative group ${selectedActivity?._id === activity._id
                    ? 'bg-white/10 border-[#00C4FF]/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  style={{
                    '--mouse-x': `${mousePos.x}px`,
                    '--mouse-y': `${mousePos.y}px`,
                  }}
                >
                  {/* Glow Effect */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 rounded-xl"
                    style={{
                      background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(0, 196, 255, 0.15), transparent 40%)`,
                    }}
                  />
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <img src={activity.host.profilePhoto || "https://github.com/shadcn.png"} alt={activity.host.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <h3 className="text-sm font-semibold text-white leading-tight">{activity.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{activity.host.name}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">{activity.startTime || 'Time TBD'}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`p-1.5 rounded-full ${activity.category === 'Running' ? 'bg-purple-500/20 text-purple-400' :
                      activity.category === 'Music' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                      {activity.category === 'Running' && <Zap className="h-3 w-3" />}
                      {activity.category === 'Music' && <Music className="h-3 w-3" />}
                      {activity.category === 'Cooking' && <Utensils className="h-3 w-3" />}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex -space-x-2">
                      {activity.attendees.slice(0, 3).map((attendee) => (
                        <img key={attendee._id} src={attendee.profilePhoto || "https://github.com/shadcn.png"} alt="User" className="w-6 h-6 rounded-full border-2 border-[#101726]" />
                      ))}
                      {activity.attendees.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-[#101726] flex items-center justify-center text-[10px] text-white">
                          +{activity.attendees.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">+{activity.attendees.length} interested</span>
                  </div>
                </div>
              );
            };
            return <ActivityCard key={activity._id} activity={activity} />;
          })
        )}
      </div>

      <CreateActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ActivitiesSidebar;
