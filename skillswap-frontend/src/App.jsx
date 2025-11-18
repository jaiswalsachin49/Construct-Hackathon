import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFound from './pages/NotFound';

// App Pages
import DiscoveryPage from './pages/app/DiscoveryPage';
import MatchesPage from './pages/app/MatchesPage';
import ChatPage from './pages/app/ChatPage';
import WavesPage from './pages/app/WavesPage';
import FeedPage from './pages/app/FeedPage';
import CommunitiesPage from './pages/app/CommunitiesPage';
import ProfilePage from './pages/app/ProfilePage';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/common/DashboardLayout';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        
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
          <Route path="matches" element={<MatchesPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:conversationId" element={<ChatPage />} />
          <Route path="waves" element={<WavesPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="communities" element={<CommunitiesPage />} />
          <Route path="communities/:id" element={<CommunitiesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
        </Route>
        
        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
