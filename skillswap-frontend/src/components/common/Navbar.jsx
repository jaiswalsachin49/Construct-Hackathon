import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, User, LogOut, Settings } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    return (
        <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/app/discover" className="flex items-center">
                        <span className="text-2xl font-bold text-blue-600">SkillSwap</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Notification Bell */}
                        <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                            <Bell className="h-6 w-6" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </button>

                            {/* Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                    <Link
                                        to="/app/profile"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        Profile
                                    </Link>
                                    <Link
                                        to="/app/settings"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-3 space-y-2">
                        <Link
                            to="/app/profile"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Profile
                        </Link>
                        <Link
                            to="/app/settings"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Settings
                        </Link>
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-lg"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
