import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, MessageCircle, Radio, User } from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Mock badge counts - replace with actual store data
  const unreadCount = 3;
  const newWavesCount = 2;

  const tabs = [
    { path: '/app/communities-demo', icon: Home, label: 'Discover' },
    { path: '/app/matches', icon: Heart, label: 'Matches' },
    { path: '/app/chat', icon: MessageCircle, label: 'Chat', badge: unreadCount },
    { path: '/app/waves', icon: Radio, label: 'Waves', badge: newWavesCount },
    { path: '/app/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;

        return (
          <button
            key={tab.path}
            data-testid={`nav-${tab.label.toLowerCase()}`}
            onClick={() => navigate(tab.path)}
            className={`nav-button ${isActive ? 'active' : ''}`}
          >
            <div className="icon-container">
              <Icon size={24} />
              {tab.badge > 0 && (
                <span className="badge">{tab.badge}</span>
              )}
            </div>
            <span className="label">{tab.label}</span>
          </button>
        );
      })}

      <style jsx>{`
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 50;
          padding-bottom: env(safe-area-inset-bottom);
        }

        @media (min-width: 768px) {
          .mobile-bottom-nav {
            display: none;
          }
        }

        .nav-button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          border: none;
          background: transparent;
          color: #6b7280;
          transition: color 0.2s;
          min-height: 44px;
          cursor: pointer;
          -webkit-user-select: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-button:active {
          transform: scale(0.95);
          opacity: 0.8;
        }

        .nav-button.active {
          color: #3b82f6;
        }

        .icon-container {
          position: relative;
        }

        .badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: bold;
          min-width: 18px;
          text-align: center;
        }

        .label {
          font-size: 11px;
          font-weight: 500;
        }
      `}</style>
    </nav>
  );
};

export default MobileBottomNav;
