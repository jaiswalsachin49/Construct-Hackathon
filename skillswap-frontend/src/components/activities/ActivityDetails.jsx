import React from 'react';
import { X, Clock, MapPin, Users, MessageCircle } from 'lucide-react';
import useActivityStore from '../../store/activityStore';
import ActivityChat from './ActivityChat';

const ActivityDetails = () => {
  const { selectedActivity, selectActivity, joinActivity } = useActivityStore();

  if (!selectedActivity) return null;

  return (
    <div className="w-full lg:w-96 bg-white border-l border-gray-200 h-full flex flex-col absolute right-0 top-0 bottom-0 z-[1000] lg:relative lg:z-auto shadow-2xl lg:shadow-none">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
             selectedActivity.category === 'Running' ? 'bg-purple-100 text-purple-600' :
             selectedActivity.category === 'Music' ? 'bg-blue-100 text-blue-600' :
             'bg-orange-100 text-orange-600'
          }`}>
             {/* Icon could be dynamic here too, but keeping it simple for now or passing it down */}
             <span className="font-bold text-lg">
                {selectedActivity.category === 'Running' ? '🏃' : 
                 selectedActivity.category === 'Music' ? '🎵' : '🍳'}
             </span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{selectedActivity.title}</h2>
            <p className="text-xs text-gray-500">at {selectedActivity.location.split(',')[0]}</p>
          </div>
        </div>
        <button 
          onClick={() => selectActivity(null)}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Host Info */}
        <div className="p-6 bg-gray-50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">HOST</p>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <img src={selectedActivity.host.avatar} alt={selectedActivity.host.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <h3 className="font-bold text-gray-900">{selectedActivity.host.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-1">{selectedActivity.host.bio}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-gray-600">
              <Clock className="h-5 w-5 mt-0.5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Time</p>
                <p className="text-sm">{selectedActivity.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="h-5 w-5 mt-0.5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm">{selectedActivity.location}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-sm text-gray-600">
            <p>{selectedActivity.description}</p>
          </div>

          {/* Attendees */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900">{selectedActivity.interestedCount} people are interested</h4>
            </div>
            <div className="flex -space-x-2 overflow-hidden py-2">
              {selectedActivity.attendees.map((attendee) => (
                <img key={attendee.id} src={attendee.avatar} alt="Attendee" className="w-10 h-10 rounded-full border-2 border-white" />
              ))}
              <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                +4
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Section if joined */}
        {selectedActivity.joined && (
           <div className="border-t border-gray-100">
               <ActivityChat />
           </div>
        )}
      </div>

      {/* Footer Actions */}
      {!selectedActivity.joined && (
        <div className="p-4 border-t border-gray-100 space-y-3 bg-white">
            <button 
                onClick={() => joinActivity(selectedActivity.id)}
                className="w-full py-3 bg-gradient-to-r from-[#8B5CF6] to-[#00C4FF] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
            Join Meetup
            </button>
            <button className="w-full py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
            Message Host
            </button>
        </div>
      )}
    </div>
  );
};

export default ActivityDetails;
