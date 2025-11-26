import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Modal from '../common/Modal'; // Ensure this is the FIXED Modal
import api from '../../services/api'; // Direct API call

const BlockConfirmModal = ({ isOpen, onClose, userId, userName }) => {
    const [isBlocking, setIsBlocking] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleBlock = async () => {
        try {
            setIsBlocking(true);
            // Call backend route: router.post('/block/:userId')
            await api.post(`/api/users/block/${userId}`);

            onClose();
            // If we are on their profile, go home
            if (location.pathname.includes(userId)) {
                navigate('/app/discover');
            }
            // Optional: Trigger a toast here
        } catch (error) {
            console.error('Failed to block:', error);
            toast.error('Failed to block user.');
        } finally {
            setIsBlocking(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Block ${userName}?`}>
            <div className="space-y-4">
                <p className="text-gray-600">
                    Are you sure? They won't be able to message you or see your profile.
                </p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                    <button
                        onClick={handleBlock}
                        disabled={isBlocking}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        {isBlocking ? 'Blocking...' : 'Block User'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default BlockConfirmModal;