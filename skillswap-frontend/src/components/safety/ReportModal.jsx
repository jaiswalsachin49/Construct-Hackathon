import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import api from '../../services/api';

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetName }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const canSubmit = reason && details.trim().length >= 10;

  const handleReport = async (e) => {
    e.preventDefault();

    try {
      setIsReporting(true);

      // Real API call
      await api.post('/api/reports', {
        targetType,
        targetId,
        reason,
        details
      });

      // console.log('Report submitted:', { targetType, targetId, reason, details });

      alert('Report submitted. We will review it shortly.');
      onClose()
      // Reset form
      setReason('');
      setDetails('');
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsReporting(false);
    }
  }

  const handleClose = () => {
    setReason('');
    setDetails('');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#101726] rounded-lg max-w-md w-full border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            Report {targetType === 'user' ? 'User' : 'Content'}
          </h2>
          <button
            data-testid="close-report-modal"
            onClick={handleClose}
            className="text-[#8A90A2] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleReport} className="p-6 space-y-4">
          {/* Target Info */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-[#8A90A2] mb-1">You are reporting:</p>
            <strong className="text-white">{targetName}</strong>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Reason *
            </label>
            <select
              data-testid="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 bg-[#0A0F1F] border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
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
            <label className="block text-sm font-medium text-white mb-2">
              Additional Details *
            </label>
            <textarea
              data-testid="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Please provide more information..."
              className="w-full px-4 py-2 bg-[#0A0F1F] border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-none placeholder-[#8A90A2]"
              required
            />
            <p className="text-xs text-[#8A90A2] mt-1">
              {500 - details.length} characters remaining (minimum 10)
            </p>
          </div>

          {/* Notice */}
          <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg p-4">
            <p className="text-sm text-[#3B82F6]">
              📋 Your report will be reviewed by our team within 24 hours. All reports are kept confidential.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isReporting}
              className="flex-1 px-4 py-2 border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-white"
            >
              Cancel
            </button>
            <button
              data-testid="submit-report"
              type="submit"
              disabled={!canSubmit || isReporting}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isReporting ? 'Reporting...' : 'Report'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReportModal;