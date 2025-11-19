import React, { useState } from 'react';
import ReportModal from '../components/safety/ReportModal';
import BlockConfirmModal from '../components/safety/BlockConfirmModal';
import SafetyTips from '../components/safety/SafetyTips';

const SafetyComponentsDemo = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Safety Components Demo
          </h1>
          <p className="text-gray-600">
            Prompts 15.1 - 15.4: Report Modal, Block Modal, Safety Tips, and Safe Places
          </p>
        </div>

        {/* Safety Tips */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Safety Tips Component (Prompt 15.3)
          </h2>
          <SafetyTips />
        </div>

        {/* Modal Triggers */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Report Modal Trigger */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Report Modal (Prompt 15.1)
            </h2>
            <p className="text-gray-600 mb-4">
              Modal for reporting users or content with reason selection and details.
            </p>
            <button
              data-testid="open-report-modal"
              onClick={() => setShowReportModal(true)}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Open Report Modal
            </button>
          </div>

          {/* Block Modal Trigger */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Block Confirmation Modal (Prompt 15.2)
            </h2>
            <p className="text-gray-600 mb-4">
              Confirmation modal for blocking users with warning message.
            </p>
            <button
              data-testid="open-block-modal"
              onClick={() => setShowBlockModal(true)}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Open Block Modal
            </button>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Features Implemented
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Report Modal</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Reason dropdown (8 options)</li>
                <li>✅ Details textarea (500 char limit)</li>
                <li>✅ Character counter</li>
                <li>✅ Validation (min 10 chars)</li>
                <li>✅ Submit with confirmation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Block Modal</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ User info display</li>
                <li>✅ Warning message</li>
                <li>✅ Consequences list</li>
                <li>✅ Confirmation required</li>
                <li>✅ Navigate away after block</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Safety Tips</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Collapsible panel</li>
                <li>✅ 5 safety tips</li>
                <li>✅ Numbered list</li>
                <li>✅ Suggest safe places button</li>
                <li>✅ Smooth expand/collapse</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Safe Places Modal</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Map placeholder</li>
                <li>✅ 4 nearby places</li>
                <li>✅ Place cards with details</li>
                <li>✅ Directions link</li>
                <li>✅ Suggest in chat (copy)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="user"
        targetId="demo-user-id"
        targetName="John Doe (Demo User)"
      />

      <BlockConfirmModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userId="demo-user-id"
        userName="John Doe"
        userPhoto={null}
      />
    </div>
  );
};

export default SafetyComponentsDemo;
