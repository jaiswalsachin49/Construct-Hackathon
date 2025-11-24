import React, { useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import socketService from '../../services/socketService';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Users, MessageCircle, Zap, FileText, UsersRound, User, Map, Hammer } from 'lucide-react';
import Navbar from './Navbar';

const DashboardLayout = () => {
    const navItems = [
        { to: '/app/discover', icon: Home, label: 'Discover' },
        // { to: '/app/matches', icon: Users, label: 'Matches' },
        { to: '/app/activities', icon: Map, label: "Activities"},
        { to: '/app/chat', icon: MessageCircle, label: 'Chat' },
        { to: '/app/waves', icon: Zap, label: 'Waves' },
        { to: '/app/feed', icon: FileText, label: 'Feed' },
        { to: '/app/communities', icon: UsersRound, label: 'Communities' },
        { to: '/app/profile', icon: User, label: 'Profile' },
    ];
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        // If user is logged in but socket is disconnected, connect it.
        if (isAuthenticated && !socketService.socket?.connected) {
            socketService.connect();
        }
    }, [isAuthenticated]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#101726] to-[#0A0F1F] text-[#E6E9EF]">
            {/* Top Navbar */}
            <Navbar />

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 bg-white/5 border-r border-white/10 backdrop-blur-xl sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-white/10 text-[#00C4FF] border border-white/5'
                                        : 'text-[#8A90A2] hover:bg-white/5 hover:text-[#E6E9EF]'
                                    }`
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#101726]/90 backdrop-blur-xl border-t border-white/10 z-40">
                <div className="flex justify-around items-center h-16">
                    {navItems.slice(0, 5).map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-[#00C4FF]' : 'text-[#8A90A2]'
                                }`
                            }
                        >
                            <item.icon className="h-6 w-6" />
                            <span className="text-xs mt-1">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default DashboardLayout;