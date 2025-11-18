import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const MobileDrawer = ({ isOpen, onClose, children, title, position = 'bottom' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}></div>
      <div className={`drawer drawer-${position}`}>
        {title && (
          <div className="drawer-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="close-button">
              <X size={24} />
            </button>
          </div>
        )}
        <div className="drawer-content">
          {children}
        </div>
      </div>

      <style jsx>{`
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 60;
          animation: fadeIn 0.2s ease-out;
        }

        .drawer {
          position: fixed;
          background: white;
          z-index: 61;
          max-height: 90vh;
          overflow-y: auto;
        }

        .drawer-bottom {
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 16px 16px 0 0;
          animation: slideUp 0.3s ease-out;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          background: white;
          z-index: 1;
        }

        .drawer-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .close-button {
          border: none;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          min-height: 44px;
          min-width: 44px;
          -webkit-tap-highlight-color: transparent;
        }

        .close-button:active {
          opacity: 0.6;
        }

        .drawer-content {
          padding: 16px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default MobileDrawer;
