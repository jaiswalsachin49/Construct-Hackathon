import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PlaceSuggestionsModal from './PlaceSuggestionsModal';

const SafetyTips = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaces, setShowPlaces] = useState(false);

  const tips = [
    'Always meet in public places',
    'Tell a friend or family member where you\'re going',
    'Trust your instincts - if something feels off, it probably is',
    'Don\'t share personal information too quickly',
    'Report any suspicious or inappropriate behavior'
  ];

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
        {/* Header */}
        <button
          data-testid="safety-tips-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-blue-100 transition-colors"
        >
          <span className="flex items-center gap-2 font-semibold text-blue-900">
            🛡️ Safety Tips
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-blue-700" />
          ) : (
            <ChevronDown className="w-5 h-5 text-blue-700" />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-sm text-blue-900 flex-1">{tip}</p>
                </div>
              ))}
            </div>

            <button
              data-testid="suggest-places-button"
              onClick={() => setShowPlaces(true)}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              📍 Suggest Safe Places Nearby
            </button>
          </div>
        )}
      </div>

      {/* Place Suggestions Modal */}
      <PlaceSuggestionsModal
        isOpen={showPlaces}
        onClose={() => setShowPlaces(false)}
      />
    </>
  );
};

export default SafetyTips;
