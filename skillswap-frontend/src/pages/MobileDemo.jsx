import React, { useState } from 'react';
import MobileBottomNav from '../components/common/MobileBottomNav';
import MobileHeader from '../components/common/MobileHeader';
import MobileDrawer from '../components/common/MobileDrawer';
import InstallPrompt from '../components/common/InstallPrompt';
import { Settings, Bell, Search } from 'lucide-react';

const MobileDemo = () => {
  const [showDrawer, setShowDrawer] = useState(false);

  const headerActions = (
    <>
      <button className="icon-button">
        <Search size={20} />
      </button>
      <button className="icon-button">
        <Bell size={20} />
      </button>
      <button className="icon-button">
        <Settings size={20} />
      </button>
    </>
  );

  return (
    <>
      <div className="mobile-demo-page">
        {/* Mobile Header */}
        <MobileHeader
          title="Mobile Optimizations"
          showBack={false}
          actions={headerActions}
        />

        {/* Content */}
        <div className="content">
          <div className="section">
            <h2>Prompt 17.1: Mobile Navigation ✅</h2>
            <p className="description">
              Responsive navigation with bottom tab bar for mobile and desktop sidebar.
            </p>
            <ul className="feature-list">
              <li>✓ Bottom navigation (mobile only)</li>
              <li>✓ Top mobile header with actions</li>
              <li>✓ Badge notifications</li>
              <li>✓ iOS safe area handling</li>
              <li>✓ 44px minimum tap targets</li>
              <li>✓ Active state indicators</li>
            </ul>
          </div>

          <div className="section">
            <h2>Prompt 17.2: Mobile Components ✅</h2>
            <p className="description">
              Mobile-optimized components with touch gestures and native feel.
            </p>
            <ul className="feature-list">
              <li>✓ Bottom drawer/sheet</li>
              <li>✓ Touch-friendly buttons</li>
              <li>✓ Responsive grid layouts</li>
              <li>✓ Mobile input optimization</li>
              <li>✓ Virtual keyboard handling</li>
              <li>✓ Pull-to-refresh ready</li>
            </ul>
            <button
              data-testid="open-drawer-button"
              onClick={() => setShowDrawer(true)}
              className="demo-button"
            >
              Open Bottom Drawer
            </button>
          </div>

          <div className="section">
            <h2>Prompt 17.3: PWA Configuration ✅</h2>
            <p className="description">
              Progressive Web App with offline support and installation.
            </p>
            <ul className="feature-list">
              <li>✓ Web app manifest</li>
              <li>✓ Service worker registered</li>
              <li>✓ Install prompt component</li>
              <li>✓ Offline caching strategy</li>
              <li>✓ App icons (192x192, 512x512)</li>
              <li>✓ Standalone display mode</li>
            </ul>
            <div className="pwa-info">
              <p><strong>To test PWA:</strong></p>
              <ol>
                <li>Open on mobile Chrome/Safari</li>
                <li>Look for "Add to Home Screen"</li>
                <li>Install the app</li>
                <li>Launch from home screen</li>
                <li>Works like a native app!</li>
              </ol>
            </div>
          </div>

          <div className="section">
            <h2>Mobile Optimization Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Responsive Design</h3>
                <p>Adapts to all screen sizes</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👆</div>
                <h3>Touch Gestures</h3>
                <p>Swipe, tap, pull to refresh</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Fast Loading</h3>
                <p>Optimized performance</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📶</div>
                <h3>Offline Support</h3>
                <p>Works without internet</p>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Testing Instructions</h2>
            <div className="testing-steps">
              <div className="step">
                <span className="step-number">1</span>
                <div>
                  <strong>Resize Browser</strong>
                  <p>Open DevTools and toggle device toolbar (mobile view)</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div>
                  <strong>Test Bottom Nav</strong>
                  <p>Click tabs at the bottom - should navigate and show active state</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div>
                  <strong>Test Drawer</strong>
                  <p>Click "Open Bottom Drawer" button to see mobile drawer</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <div>
                  <strong>Install as PWA</strong>
                  <p>On mobile, look for "Add to Home Screen" prompt</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: '80px' }}></div>
        </div>

        {/* Bottom Nav */}
        <MobileBottomNav />

        {/* PWA Install Prompt */}
        <InstallPrompt />

        {/* Drawer */}
        <MobileDrawer
          isOpen={showDrawer}
          onClose={() => setShowDrawer(false)}
          title="Bottom Drawer Demo"
        >
          <div style={{ padding: '20px 0' }}>
            <h3 style={{ marginTop: 0 }}>This is a mobile bottom drawer!</h3>
            <p>Perfect for:</p>
            <ul>
              <li>Action sheets</li>
              <li>Filters and options</li>
              <li>Form inputs</li>
              <li>Quick actions</li>
            </ul>
            <button
              onClick={() => setShowDrawer(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Close Drawer
            </button>
          </div>
        </MobileDrawer>
      </div>

      {/* 👇 FIXED STYLE (React valid) */}
      <style>{`
        .mobile-demo-page {
          min-height: 100vh;
          background: #f9fafb;
        }

        .content {
          padding: 16px;
          max-width: 800px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .content {
            padding: 32px;
          }
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section h2 {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 12px 0;
        }

        .description {
          color: #6b7280;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0 0 16px 0;
        }

        .feature-list li {
          padding: 8px 0;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
        }

        .feature-list li:last-child {
          border-bottom: none;
        }

        .demo-button {
          width: 100%;
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          min-height: 44px;
          -webkit-tap-highlight-color: transparent;
        }

        .demo-button:active {
          background: #2563eb;
          transform: scale(0.98);
        }

        .pwa-info {
          background: #dbeafe;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }

        .pwa-info strong {
          color: #1e40af;
        }

        .pwa-info ol {
          margin: 12px 0 0 0;
          padding-left: 20px;
          color: #1e3a8a;
        }

        .pwa-info li {
          margin: 8px 0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        @media (min-width: 640px) {
          .features-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .feature-card {
          text-align: center;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .feature-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .feature-card h3 {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .feature-card p {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        .testing-steps {
          margin-top: 16px;
        }

        .step {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          align-items: flex-start;
        }

        .step-number {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .step strong {
          display: block;
          color: #111827;
          margin-bottom: 4px;
        }

        .step p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .icon-button {
          border: none;
          background: transparent;
          color: #374151;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          min-width: 44px;
          -webkit-tap-highlight-color: transparent;
        }

        .icon-button:active {
          opacity: 0.6;
        }
      `}</style>
    </>
  );
};

export default MobileDemo;