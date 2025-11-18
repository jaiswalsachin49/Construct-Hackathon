import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now());
  };

  if (!showPrompt) return null;

  return (
    <>
      <div className="install-prompt">
        <div className="prompt-content">
          <Download className="icon" size={24} />
          <div className="text">
            <p className="title">Install SkillSwap</p>
            <p className="description">Get a better experience with our app!</p>
          </div>
        </div>
        <div className="prompt-actions">
          <button
            data-testid="install-button"
            onClick={handleInstall}
            className="install-button"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="dismiss-button"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .install-prompt {
          position: fixed;
          bottom: 80px;
          left: 16px;
          right: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          z-index: 55;
          animation: slideUp 0.3s ease-out;
        }

        @media (min-width: 768px) {
          .install-prompt {
            max-width: 400px;
            left: auto;
            right: 24px;
            bottom: 24px;
          }
        }

        .prompt-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .icon {
          color: #3b82f6;
          flex-shrink: 0;
        }

        .text {
          flex: 1;
        }

        .title {
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
          font-size: 14px;
        }

        .description {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .prompt-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .install-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          min-height: 44px;
          -webkit-tap-highlight-color: transparent;
        }

        .install-button:active {
          background: #2563eb;
          transform: scale(0.98);
        }

        .dismiss-button {
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          min-width: 44px;
          -webkit-tap-highlight-color: transparent;
        }

        .dismiss-button:active {
          opacity: 0.6;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default InstallPrompt;
