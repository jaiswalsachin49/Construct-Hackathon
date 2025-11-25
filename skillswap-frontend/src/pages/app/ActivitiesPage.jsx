import React, { useState } from 'react';
import { Menu, Map, X } from 'lucide-react';
import ActivitiesSidebar from '../../components/activities/ActivitiesSidebar';
import ActivitiesMap from '../../components/activities/ActivitiesMap';
import ActivityDetails from '../../components/activities/ActivityDetails';

const ActivitiesPage = () => {
  const [mobileView, setMobileView] = useState('map'); // 'sidebar' or 'map'
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0A0F1F] overflow-hidden rounded-xl border border-white/10 shadow-2xl relative">
      {/* Mobile Toggle Button - Top Right */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed top-20 right-6 z-50 p-3 bg-gradient-to-r from-[#00C4FF] to-[#00F5A0] text-black rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label="Toggle sidebar"
      >
        {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar - Left (Hidden on mobile unless toggled) */}
      <div className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:relative
        inset-y-0 left-0
        z-40
        w-full sm:w-96
        transition-transform duration-300
        lg:block
      `}>
        <ActivitiesSidebar />
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Map - Middle (Full width on mobile) */}
      <div className="flex-1 relative">
        <ActivitiesMap />
      </div>

      {/* Details - Right (Overlay on mobile, sidebar on desktop) */}
      <ActivityDetails />
    </div>
  );
};

export default ActivitiesPage;
