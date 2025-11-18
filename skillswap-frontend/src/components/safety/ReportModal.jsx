import React, { useState } from 'react';
import { X } from 'lucide-react';

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetName }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const canSubmit = reason && details.trim().length >= 10;

  const handleReport = async (e) => {
    e.preventDefault();
    
    try {
      setIsReporting(true);
      
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Report submitted:', { targetType, targetId, reason, details });
      
      alert('Report submitted. We will review it shortly.');
      onClose();
      
      // Reset form
      setReason('');
      setDetails('');
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Report {targetType === 'user' ? 'User' : 'Content'}
          </h2>
          <button
            data-testid="close-report-modal"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleReport} className="p-6 space-y-4">
          {/* Target Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">You are reporting:</p>
            <strong className="text-gray-900">{targetName}</strong>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <select
              data-testid="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a reason</option>
              <option value="inappropriate_behavior">Inappropriate behavior</option>
              <option value="fake_profile">Fake profile</option>
              <option value="harassment">Harassment</option>
              <option value="no_show">No-show to session</option>
              <option value="spam">Spam</option>
              <option value="safety_concern">Safety concern</option>
              <option value="inappropriate_content">Inappropriate content</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details *
            </label>
            <textarea
              data-testid="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Please provide more information..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {500 - details.length} characters remaining (minimum 10)
            </p>
          </div>

          {/* Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              📋 Your report will be reviewed by our team within 24 hours. All reports are kept confidential.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isReporting}
              className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              data-testid="submit-report"
              type="submit"
              disabled={!canSubmit || isReporting}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isReporting ? 'Reporting...' : 'Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
