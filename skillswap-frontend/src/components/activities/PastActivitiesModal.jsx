import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, MapPin, Video, Globe } from 'lucide-react';
import useActivityStore from '../../store/activityStore';
import useAuthStore from '../../store/authStore';

const PastActivitiesModal = ({ isOpen, onClose }) => {
  const { activities } = useActivityStore();
  const { user } = useAuthStore();
  const [pastActivities, setPastActivities] = useState([]);

  useEffect(() => {
    if (isOpen && user) {
      const now = new Date();
      const userActivities = activities.filter(activity => {
        // Check if user was host or attendee
        const isParticipant = activity.host._id === user._id || 
                              activity.attendees.some(a => a._id === user._id);
        
        if (!isParticipant) return false;

        // Check if activity is in the past
        // We use the expireAt field if available, otherwise calculate from time/endTime
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
      });

      // Sort by most recent first
      setPastActivities(userActivities.sort((a, b) => new Date(b.time) - new Date(a.time)));
    }
  }, [isOpen, activities, user]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#101726] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Past Activities</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {pastActivities.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No past activities found.</p>
            </div>
          ) : (
            pastActivities.map(activity => (
              <div key={activity._id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-white text-lg">{activity.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span className={`px-2 py-0.5 rounded ${
                        activity.isOnline ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {activity.isOnline ? 'Online' : 'In-Person'}
                      </span>
                      <span>•</span>
                      <span>{new Date(activity.time).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {activity.host._id === user._id && (
                    <span className="text-[10px] bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded-full font-medium">
                      HOST
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{activity.startTime} - {activity.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="truncate">{activity.location.split(',')[0]}</span>
                    </div>
                </div>

                {activity.isOnline && (
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                        {activity.recordingLink ? (
                             <a 
                                href={activity.recordingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium p-2 bg-red-500/10 rounded-lg"
                            >
                                <Video className="h-4 w-4" />
                                Watch Recording
                            </a>
                        ) : (
                            <div className="text-xs text-gray-500 italic flex items-center gap-2">
                                <Video className="h-3 w-3" />
                                No recording available
                            </div>
                        )}
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PastActivitiesModal;
