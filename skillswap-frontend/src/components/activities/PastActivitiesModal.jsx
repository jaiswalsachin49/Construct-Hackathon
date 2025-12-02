import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, MapPin, Video, Globe, Trash2, Check } from 'lucide-react';
import useActivityStore from '../../store/activityStore';
import useAuthStore from '../../store/authStore';
import { toast } from 'react-hot-toast';

const PastActivitiesModal = ({ isOpen, onClose }) => {
  const { pastActivities, fetchPastActivities, updateActivity, deleteActivity } = useActivityStore();
  const { user } = useAuthStore();
  const [editingRecording, setEditingRecording] = useState(null);
  const [recordingInput, setRecordingInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      console.log('[PastActivities] Fetching past activities...');
      fetchPastActivities().then(() => {
        console.log('[PastActivities] Received past activities:', pastActivities);
      });
    }
  }, [isOpen]);

  const handleAddRecording = async (activityId) => {
    if (!recordingInput.trim()) {
      toast.error('Please enter a valid recording link');
      return;
    }

    try {
      await updateActivity(activityId, { recordingLink: recordingInput });
      toast.success('Recording link added!');
      setEditingRecording(null);
      setRecordingInput('');
      fetchPastActivities(); // Refresh
    } catch (error) {
      toast.error('Failed to add recording link');
    }
  };

  const handleDelete = async (activityId) => {
    if (confirm('Are you sure you want to delete this past activity?')) {
      try {
        await deleteActivity(activityId);
        toast.success('Activity deleted');
        fetchPastActivities(); // Refresh
      } catch (error) {
        toast.error('Failed to delete activity');
      }
    }
  };

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
            pastActivities.map(activity => {
              const isHost = activity.host._id === user._id;
              
              return (
                <div key={activity._id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
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
                    <div className="flex items-center gap-2">
                      {isHost && (
                        <>
                          <span className="text-[10px] bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded-full font-medium">
                            HOST
                          </span>
                          <button
                            onClick={() => handleDelete(activity._id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete activity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
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
                          ) : isHost ? (
                              editingRecording === activity._id ? (
                                  <div className="flex gap-2">
                                      <input
                                          type="url"
                                          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#3B82F6]"
                                          placeholder="Enter Google Drive recording link..."
                                          value={recordingInput}
                                          onChange={(e) => setRecordingInput(e.target.value)}
                                          autoFocus
                                      />
                                      <button
                                          onClick={() => handleAddRecording(activity._id)}
                                          className="px-3 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#3B82F6]/80 transition-colors"
                                      >
                                          <Check className="h-4 w-4" />
                                      </button>
                                      <button
                                          onClick={() => {
                                              setEditingRecording(null);
                                              setRecordingInput('');
                                          }}
                                          className="px-3 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors"
                                      >
                                          <X className="h-4 w-4" />
                                      </button>
                                  </div>
                              ) : (
                                  <button
                                      onClick={() => setEditingRecording(activity._id)}
                                      className="text-xs text-[#3B82F6] hover:text-[#3B82F6]/80 font-medium flex items-center gap-1"
                                  >
                                      <Video className="h-3 w-3" />
                                      Add Recording Link
                                  </button>
                              )
                          ) : (
                              <div className="text-xs text-gray-500 italic flex items-center gap-2">
                                  <Video className="h-3 w-3" />
                                  No recording available
                              </div>
                          )}
                      </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PastActivitiesModal;
