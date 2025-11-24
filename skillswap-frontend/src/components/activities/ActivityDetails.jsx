import React from 'react';
import { X, Clock, MapPin, Users, MessageCircle, Globe } from 'lucide-react';
import useActivityStore from '../../store/activityStore';
import ActivityChat from './ActivityChat';
import useAuthStore from '../../store/authStore';

const ActivityDetails = () => {
  const { selectedActivity, selectActivity, joinActivity, deleteActivity } = useActivityStore();
  const { user } = useAuthStore();

  if (!selectedActivity) return null;

  const isHost = user?._id === selectedActivity.host._id;
  const isJoined = selectedActivity.attendees.some(a => a._id === user?._id);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
        await deleteActivity(selectedActivity._id);
        selectActivity(null);
    }
  };

  return (
    <div className="w-full lg:w-96 bg-[#101726] border-l border-white/10 h-full flex flex-col absolute right-0 top-0 bottom-0 z-[1000] lg:relative lg:z-auto shadow-2xl lg:shadow-none">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
             selectedActivity.category === 'Running' ? 'bg-purple-500/20 text-purple-400' :
             selectedActivity.category === 'Music' ? 'bg-blue-500/20 text-blue-400' :
             'bg-orange-500/20 text-orange-400'
          }`}>
             <span className="font-bold text-lg">
                {selectedActivity.category === 'Running' ? '🏃' : 
                 selectedActivity.category === 'Music' ? '🎵' : '🍳'}
             </span>
          </div>
          <div>
            <h2 className="font-bold text-white">{selectedActivity.title}</h2>
            <p className="text-xs text-gray-400">at {selectedActivity.location.split(',')[0]}</p>
          </div>
        </div>
        <button 
          onClick={() => selectActivity(null)}
          className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Host Info */}
        <div className="p-6 bg-[#0A0F1F]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">HOST</p>
          <div className="flex items-center gap-3 bg-[#101726] p-3 rounded-xl shadow-sm border border-white/10">
            <img src={selectedActivity.host.profilePhoto || "https://github.com/shadcn.png"} alt={selectedActivity.host.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="font-bold text-white">{selectedActivity.host.name}</h3>
              <p className="text-xs text-gray-400 line-clamp-1">{selectedActivity.host.bio || "Activity Host"}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-gray-400">
              <Clock className="h-5 w-5 mt-0.5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-white">Time</p>
                <p className="text-sm">{new Date(selectedActivity.time).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-gray-400">
              <MapPin className="h-5 w-5 mt-0.5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-white">Location</p>
                <p className="text-sm">{selectedActivity.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-gray-400">
              <Globe className="h-5 w-5 mt-0.5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-white">Type</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  selectedActivity.isOnline ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-300'
                }`}>
                  {selectedActivity.isOnline ? 'Online Event' : 'In-Person Event'}
                </span>
              </div>
            </div>
          </div>

          <div className="prose prose-sm text-gray-400">
            <p>{selectedActivity.description}</p>
          </div>

          {/* Attendees */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-white">{selectedActivity.attendees.length} people are interested</h4>
            </div>
            <div className="flex -space-x-2 overflow-hidden py-2">
              {selectedActivity.attendees.map((attendee) => (
                <img key={attendee._id} src={attendee.profilePhoto || "https://github.com/shadcn.png"} alt="Attendee" className="w-10 h-10 rounded-full border-2 border-[#101726]" />
              ))}
              {selectedActivity.attendees.length === 0 && (
                 <p className="text-sm text-gray-500 italic">Be the first to join!</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Chat Section if joined OR if host */}
        {(isJoined || isHost) && (
           <div className="border-t border-white/10">
               <ActivityChat />
           </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-[#101726]">
        {isHost ? (
            <button 
                onClick={handleDelete}
                className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-colors"
            >
            Delete Activity
            </button>
        ) : !isJoined ? (
            <>
                <button 
                    onClick={() => joinActivity(selectedActivity._id)}
                    className="w-full py-3 bg-gradient-to-r from-[#8B5CF6] to-[#00C4FF] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                Join Meetup
                </button>
                <button className="w-full py-3 bg-white/5 text-gray-300 font-bold rounded-xl hover:bg-white/10 transition-colors">
                Message Host
                </button>
            </>
        ) : null}
      </div>
    </div>
  );
};

export default ActivityDetails;
