import React from 'react';
import ActivitiesSidebar from '../../components/activities/ActivitiesSidebar';
import ActivitiesMap from '../../components/activities/ActivitiesMap';
import ActivityDetails from '../../components/activities/ActivityDetails';

const ActivitiesPage = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0A0F1F] overflow-hidden rounded-xl border border-white/10 shadow-2xl">
      {/* Sidebar - Left */}
      <ActivitiesSidebar />
      
      {/* Map - Middle */}
      <div className="flex-1 relative">
        <ActivitiesMap />
      </div>

      {/* Details - Right (Overlay or Side based on selection) */}
      {/* We conditionally render this or handle visibility inside the component, 
          but for the layout requested, it sits on the right. 
          The ActivityDetails component handles its own visibility based on store state. 
      */}
      <ActivityDetails />
    </div>
  );
};

export default ActivitiesPage;
