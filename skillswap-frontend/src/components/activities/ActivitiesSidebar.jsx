import React from 'react';
import { Search, MapPin, Users, Music, Utensils, Zap, Filter } from 'lucide-react';
import useActivityStore from '../../store/activityStore';

const ActivitiesSidebar = () => {
  const { activities, filters, setFilter, selectActivity, selectedActivity } = useActivityStore();

  const categories = [
    { id: 'All', label: 'All', icon: Filter },
    { id: 'Running', label: 'Running', icon: Zap },
    { id: 'Yoga', label: 'Yoga', icon: Users },
    { id: 'Music', label: 'Music', icon: Music },
    { id: 'Cooking', label: 'Cooking', icon: Utensils },
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                          activity.location.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'All' || activity.category === filters.category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full lg:w-96 bg-[#101726] border-r border-white/10 flex flex-col h-full">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-white">Live Meetup Spots</h2>
        
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filters.category === cat.id
                  ? 'bg-[#00C4FF]/20 text-[#00C4FF] border border-[#00C4FF]/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              <cat.icon className="h-3 w-3" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Show active only</span>
          <button
            onClick={() => setFilter('showActiveOnly', !filters.showActiveOnly)}
            className={`w-10 h-5 rounded-full relative transition-colors ${
              filters.showActiveOnly ? 'bg-[#00C4FF]' : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${
              filters.showActiveOnly ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            onClick={() => selectActivity(activity)}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedActivity?.id === activity.id
                ? 'bg-white/10 border-[#00C4FF]/50'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <img src={activity.host.avatar} alt={activity.host.name} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <h3 className="text-sm font-semibold text-white leading-tight">{activity.title}</h3>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
              <div className={`p-1.5 rounded-full ${
                activity.category === 'Running' ? 'bg-purple-500/20 text-purple-400' :
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
                  <img key={attendee.id} src={attendee.avatar} alt="User" className="w-6 h-6 rounded-full border-2 border-[#101726]" />
                ))}
                {activity.attendees.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-[#101726] flex items-center justify-center text-[10px] text-white">
                    +{activity.attendees.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400">+{activity.interestedCount} interested</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivitiesSidebar;
