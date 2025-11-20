import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

// Existing App Imports
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/app/SettingsPage";

import DiscoveryPage from "./pages/app/DiscoveryPage";
import MatchesPage from "./pages/app/MatchesPage";
import ChatPage from "./pages/app/ChatPage";
import WavesPage from "./pages/app/WavesPage";
import FeedPage from "./pages/app/FeedPage";
import CommunitiesPageOrig from "./pages/app/CommunitiesPage";
import ProfilePageOrig from "./pages/app/ProfilePage";

import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./components/common/DashboardLayout";

// Your new feature imports
import TestCommunities from "./pages/TestCommunities";
import CommunitiesPage from "./pages/CommunitiesPage";
import CommunitiesPageDemo from "./pages/CommunitiesPageDemo";
import CommunityDetailPage from "./pages/CommunityDetailPage";
import CommunityDetailPageDemo from "./pages/CommunityDetailPageDemo";
import ProfilePage from "./pages/ProfilePage";
import SafetyComponentsDemo from "./pages/SafetyComponentsDemo";
// import OptimizationDemo from "./pages/OptimizationDemo";
import MobileDemo from "./pages/MobileDemo";

// Backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Your Home Component
// const DemoHome = () => {
//   const helloWorldApi = async () => {
//     try {
//       const res = await axios.get(`${API}/`);
//       console.log(res.data.message);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     helloWorldApi();
//   }, []);

//   return (
//     <div className="App">
//       <header className="App-header">
//         <a
//           className="App-link"
//           href="https://emergent.sh"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <img src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" />
//         </a>

//         <p className="mt-5">Building something incredible ~!</p>

//         <div className="mt-8 flex flex-col gap-4 items-center">
//           <div className="space-x-4">
//             <a href="/test-communities" className="btn blue">Test Communities (13.1)</a>
//             <a href="/app/communities" className="btn purple">Communities (13.2)</a>
//           </div>

//           <a href="/app/communities-demo" className="btn green">Communities Demo</a>
//           <a href="/app/profile" className="btn indigo">Profile (14.x)</a>
//           <a href="/app/safety-demo" className="btn red">Safety Components</a>
//           <a href="/app/optimization-demo" className="btn yellow">Optimizations</a>
//           <a href="/app/mobile-demo" className="btn pink">Mobile & PWA</a>
//         </div>
//       </header>
//     </div>
//   );
// };

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Your Demo Home */}
        {/* <Route path="/demo-home" element={<DemoHome />} /> */}

        {/* Standalone DEMO routes (no dashboard layout) */}
        <Route path="/test-communities" element={<TestCommunities />} />
        <Route path="/app/communities-demo" element={<CommunitiesPageDemo />} />
        <Route path="/app/communities-demo/:communityId" element={<CommunityDetailPageDemo />} />
        <Route path="/app/safety-demo" element={<SafetyComponentsDemo />} />
        {/* <Route path="/app/optimization-demo" element={<OptimizationDemo />} /> */}
        <Route path="/app/mobile-demo" element={<MobileDemo />} />

        {/* Protected App Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/discover" replace />} />
          <Route path="discover" element={<DiscoveryPage />} />
          {/* <Route path="matches" element={<MatchesPage />} /> */}
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:conversationId" element={<ChatPage />} />
          <Route path="waves" element={<WavesPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Combined communities */}
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="communities/:communityId" element={<CommunityDetailPage />} />

          {/* Combined profile */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;