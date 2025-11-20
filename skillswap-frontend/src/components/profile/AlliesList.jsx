import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../hooks/use-toast'; // Import Toast
import { useAuth } from '../../hooks/useAuth';   // Import Auth to refresh stats
import { startChat } from '../../services/discoveryService'; // Import the API service

const AlliesList = ({ userId, isOwnProfile }) => {
  const navigate = useNavigate();
  const { toast } = useToast();        // Initialize Toast
  const { refreshUser } = useAuth();   // Initialize User Refresh

  const [allies, setAllies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllies = async () => {
      try {
        const response = await api.get(`/api/users/${userId}/allies`);
        setAllies(response.data.allies || []);
      } catch (error) {
        console.error('Failed to load allies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) fetchAllies();
  }, [userId]);

  const handleMessage = async (targetUserId) => {
    try {
      // 1. Call API to find/create conversation ID
      const response = await startChat(targetUserId);

      // 2. Get ID safely
      const conversationId = response.conversation?._id || response._id;

      if (conversationId) {
        navigate(`/app/chat/${conversationId}`);
      } else {
        throw new Error("No conversation ID returned");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Could not start chat.",
        variant: "destructive"
      });
    }
  };

  const handleRemove = async (allyId) => {
    // REMOVED: window.confirm check

    try {
      await api.delete(`/api/users/allies/${allyId}`);

      // 1. Update UI immediately (Optimistic update)
      setAllies(prev => prev.filter(a => a._id !== allyId));

      // 2. Show Success Toast
      toast({
        title: "Ally Removed",
        description: "User removed from your connections.",
        variant: "default", // Grey/Black notification
      });

      // 3. Update Global State (so Profile stats count drops by 1)
      if (isOwnProfile) {
        await refreshUser();
      }

    } catch (error) {
      console.error("Failed to remove ally", error);
      toast({
        title: "Error",
        description: "Could not remove ally.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading allies...</div>;

  if (allies.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg border border-dashed border-gray-300">
      <p className="text-gray-500">No allies connected yet.</p>
      {isOwnProfile && (
        <button
          onClick={() => navigate('/app/discover')}
          className="mt-2 text-blue-600 font-medium hover:underline"
        >
          Find people nearby
        </button>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {allies.map((ally) => (
        <div
          key={ally._id}
          role="button"
          tabIndex={0}
          onClick={() => navigate(`/app/profile/${ally._id}`)}
          onKeyPress={(e) => { if (e.key === 'Enter') navigate(`/app/profile/${ally._id}`); }}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <img
            src={ally.profilePhoto || `https://ui-avatars.com/api/?name=${ally.name}&background=random`}
            className="w-12 h-12 rounded-full object-cover bg-gray-100"
            alt={ally.name}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{ally.name}</h4>
            <p className="text-xs text-gray-500 truncate">{ally.location?.areaLabel || 'Location hidden'}</p>
          </div>
          <div className="flex gap-2">
            {isOwnProfile ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(ally._id); }}
                className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                title="Remove Ally"
              >
                <X size={18} />
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); handleMessage(ally._id); }}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
              >
                <MessageCircle size={18} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
export default AlliesList;