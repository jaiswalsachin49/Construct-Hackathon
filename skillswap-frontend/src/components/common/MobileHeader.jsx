import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MobileHeader = ({ title, showBack, onBack, actions }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <header className="mobile-header">
        {showBack && (
          <button
            data-testid="back-button"
            onClick={handleBack}
            className="back-button"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 className="title">{title}</h1>
        <div className="actions">
          {actions}
        </div>
      </header>

      <style jsx>{`
        .mobile-header {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 16px;
          z-index: 40;
          padding-top: env(safe-area-inset-top);
        }

        @media (min-width: 768px) {
          .mobile-header {
            display: none;
          }
        }

        .back-button {
          border: none;
          background: transparent;
          color: #3b82f6;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          min-width: 44px;
          -webkit-tap-highlight-color: transparent;
        }

        .back-button:active {
          opacity: 0.6;
        }

        .title {
          flex: 1;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .actions {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </>
  );
};

export default MobileHeader;
