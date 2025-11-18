import React, { useState, useEffect } from 'react';
import { X, ExternalLink, MessageSquare } from 'lucide-react';

const PlaceSuggestionsModal = ({ isOpen, onClose }) => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchSafePlaces();
    }
  }, [isOpen]);

  const fetchSafePlaces = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlaces([
        {
          id: '1',
          name: 'Starbucks Coffee',
          type: 'Cafe',
          distance: 0.5,
          rating: 4.5,
          reviewCount: 200,
          isOpen: true,
          lat: 12.9716,
          lng: 77.5946,
          icon: '☕'
        },
        {
          id: '2',
          name: 'Central Library',
          type: 'Library',
          distance: 1.2,
          rating: 4.8,
          reviewCount: 150,
          isOpen: true,
          lat: 12.9352,
          lng: 77.6245,
          icon: '📚'
        },
        {
          id: '3',
          name: 'Green Park',
          type: 'Park',
          distance: 0.8,
          rating: 4.6,
          reviewCount: 320,
          isOpen: true,
          lat: 12.9611,
          lng: 77.6387,
          icon: '🌳'
        },
        {
          id: '4',
          name: 'The Coffee Bean',
          type: 'Cafe',
          distance: 1.5,
          rating: 4.4,
          reviewCount: 180,
          isOpen: true,
          lat: 12.9279,
          lng: 77.6271,
          icon: '☕'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestInChat = (place) => {
    const message = `📍 I suggest we meet at ${place.name} (${place.distance} km away). It's a safe public place. https://maps.google.com/?q=${place.lat},${place.lng}`;
    
    navigator.clipboard.writeText(message);
    alert('Place suggestion copied to clipboard! You can paste it in your chat.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Safe Places to Meet</h2>
          <button
            data-testid="close-places-modal"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Map Placeholder */}
        <div className="h-48 bg-gray-200 relative">
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-1">🗺️ Map View</p>
              <p className="text-sm">Google Maps integration</p>
            </div>
          </div>
        </div>

        {/* Places List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nearby Safe Places:
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-2">📍</p>
              <p>No nearby places found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {places.map((place) => (
                <div
                  key={place.id}
                  data-testid={`place-${place.id}`}
                  className="bg-white border border-gray-200 hover:border-blue-300 rounded-lg p-4 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center text-2xl flex-shrink-0">
                      {place.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {place.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {place.type} • {place.distance} km
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          ⭐ {place.rating} ({place.reviewCount} reviews)
                        </span>
                        <span className={place.isOpen ? 'text-green-600' : 'text-red-600'}>
                          {place.isOpen ? 'Open now' : 'Closed'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <a
                        href={`https://maps.google.com/?q=${place.lat},${place.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Directions
                      </a>
                      <button
                        onClick={() => suggestInChat(place)}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Suggest
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceSuggestionsModal;
