import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BlockConfirmModal = ({ isOpen, onClose, userId, userName, userPhoto }) => {
  const [isBlocking, setIsBlocking] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleBlock = async () => {
    try {
      setIsBlocking(true);
      
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('User blocked:', userId);
      
      alert(`${userName} has been blocked.`);
      onClose();
      
      // Navigate away if on their profile
      if (location.pathname.includes(userId)) {
        navigate('/app/discover');
      }
    } catch (error) {
      console.error('Failed to block user:', error);
      alert('Failed to block user. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Block User</h2>
          <button
            data-testid="close-block-modal"
            onClick={onClose}
            disabled={isBlocking}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-pink-500 mb-3">
              {userPhoto ? (
                <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {userName.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
          </div>

          {/* Warning */}
          <div className="space-y-4">
            <p className="text-gray-700 text-center">
              Are you sure you want to block this user?
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-900 mb-2">
                They won't be able to:
              </p>
              <ul className="space-y-1 text-sm text-red-800">
                <li>• See your profile</li>
                <li>• Message you</li>
                <li>• Find you in search</li>
                <li>• See your posts</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600 text-center">
              You can unblock them later from Settings.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isBlocking}
              className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              data-testid="confirm-block"
              onClick={handleBlock}
              disabled={isBlocking}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isBlocking ? 'Blocking...' : 'Block'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockConfirmModal;
