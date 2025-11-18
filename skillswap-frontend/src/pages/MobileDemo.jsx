import React, { useState } from 'react';
import MobileBottomNav from '@/components/common/MobileBottomNav';
import MobileHeader from '@/components/common/MobileHeader';
import MobileDrawer from '@/components/common/MobileDrawer';
import InstallPrompt from '@/components/common/InstallPrompt';
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
            <p>
              <strong>To test PWA:</strong>
            </p>
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

        {/* Spacer for bottom nav */}
        <div style={{ height: '80px' }}></div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Install Prompt */}
      <InstallPrompt />

      {/* Mobile Drawer Demo */}
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

      <style jsx>{`
        .mobile-demo-page {\n          min-height: 100vh;\n          background: #f9fafb;\n        }\n\n        .content {\n          padding: 16px;\n          max-width: 800px;\n          margin: 0 auto;\n        }\n\n        @media (min-width: 768px) {\n          .content {\n            padding: 32px;\n          }\n        }\n\n        .section {\n          background: white;\n          border-radius: 12px;\n          padding: 20px;\n          margin-bottom: 16px;\n          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n        }\n\n        .section h2 {\n          font-size: 20px;\n          font-weight: 700;\n          color: #111827;\n          margin: 0 0 12px 0;\n        }\n\n        .description {\n          color: #6b7280;\n          margin: 0 0 16px 0;\n          line-height: 1.5;\n        }\n\n        .feature-list {\n          list-style: none;\n          padding: 0;\n          margin: 0 0 16px 0;\n        }\n\n        .feature-list li {\n          padding: 8px 0;\n          color: #374151;\n          border-bottom: 1px solid #f3f4f6;\n        }\n\n        .feature-list li:last-child {\n          border-bottom: none;\n        }\n\n        .demo-button {\n          width: 100%;\n          padding: 12px 24px;\n          background: #3b82f6;\n          color: white;\n          border: none;\n          border-radius: 8px;\n          font-size: 16px;\n          font-weight: 500;\n          cursor: pointer;\n          min-height: 44px;\n          -webkit-tap-highlight-color: transparent;\n        }\n\n        .demo-button:active {\n          background: #2563eb;\n          transform: scale(0.98);\n        }\n\n        .pwa-info {\n          background: #dbeafe;\n          border: 1px solid #bfdbfe;\n          border-radius: 8px;\n          padding: 16px;\n          margin-top: 16px;\n        }\n\n        .pwa-info strong {\n          color: #1e40af;\n        }\n\n        .pwa-info ol {\n          margin: 12px 0 0 0;\n          padding-left: 20px;\n          color: #1e3a8a;\n        }\n\n        .pwa-info li {\n          margin: 8px 0;\n        }\n\n        .features-grid {\n          display: grid;\n          grid-template-columns: repeat(2, 1fr);\n          gap: 12px;\n          margin-top: 16px;\n        }\n\n        @media (min-width: 640px) {\n          .features-grid {\n            grid-template-columns: repeat(4, 1fr);\n          }\n        }\n\n        .feature-card {\n          text-align: center;\n          padding: 16px;\n          background: #f9fafb;\n          border-radius: 8px;\n        }\n\n        .feature-icon {\n          font-size: 32px;\n          margin-bottom: 8px;\n        }\n\n        .feature-card h3 {\n          font-size: 14px;\n          font-weight: 600;\n          color: #111827;\n          margin: 0 0 4px 0;\n        }\n\n        .feature-card p {\n          font-size: 12px;\n          color: #6b7280;\n          margin: 0;\n        }\n\n        .testing-steps {\n          margin-top: 16px;\n        }\n\n        .step {\n          display: flex;\n          gap: 16px;\n          margin-bottom: 20px;\n          align-items: flex-start;\n        }\n\n        .step-number {\n          flex-shrink: 0;\n          width: 32px;\n          height: 32px;\n          background: #3b82f6;\n          color: white;\n          border-radius: 50%;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          font-weight: 700;\n        }\n\n        .step strong {\n          display: block;\n          color: #111827;\n          margin-bottom: 4px;\n        }\n\n        .step p {\n          margin: 0;\n          color: #6b7280;\n          font-size: 14px;\n        }\n\n        .icon-button {\n          border: none;\n          background: transparent;\n          color: #374151;\n          cursor: pointer;\n          padding: 8px;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          min-height: 44px;\n          min-width: 44px;\n          -webkit-tap-highlight-color: transparent;\n        }\n\n        .icon-button:active {\n          opacity: 0.6;\n        }\n      `}</style>\n    </div>\n  );\n};\n\nexport default MobileDemo;
