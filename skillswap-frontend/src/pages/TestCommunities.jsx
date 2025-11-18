import React, { useEffect } from 'react';
import { useCommunities } from '@/hooks/useCommunities';

const TestCommunities = () => {
  const {
    myCommunities,
    nearbyCommunities,
    isLoading,
    error,
    fetchMyCommunities,
    fetchNearbyCommunities
  } = useCommunities();

  useEffect(() => {
    // This will call the APIs when backend is ready
    // For now, it will fail gracefully
    console.log('Communities hook initialized');
  }, []);

  const handleFetchMy = async () => {
    try {
      await fetchMyCommunities();
      console.log('My communities fetched');
    } catch (err) {
      console.log('Expected error (backend not ready):', err.message);
    }
  };

  const handleFetchNearby = async () => {
    try {
      await fetchNearbyCommunities(12.9716, 77.5946, 10); // Bangalore coords
      console.log('Nearby communities fetched');
    } catch (err) {
      console.log('Expected error (backend not ready):', err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Test Communities Store & Service</h1>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
          <p>My Communities: {myCommunities.length}</p>
          <p>Nearby Communities: {nearbyCommunities.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={handleFetchMy}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Fetch My Communities
            </button>
            <button
              onClick={handleFetchNearby}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Fetch Nearby
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Open DevTools console to see logs
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">✅ Prompt 13.1 Complete</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Zustand store configured (communityStore.js)</li>
            <li>• API service functions created (communityService.js)</li>
            <li>• Custom hook implemented (useCommunities.js)</li>
            <li>• Socket.io service created (socketService.js)</li>
            <li>• Error handling implemented</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestCommunities;
