import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, LogOut, Settings, User as UserIcon, ChevronDown, MessageCircle, Check } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import socketService from '../../services/socketService';
import { getConversations } from '../../services/chatService';
import { getPendingRequests, acceptConnectionRequest, rejectConnectionRequest } from '../../services/discoveryService';

const Navbar = () => {
    // 1. Hooks & Store Access (MUST be at the top)
    const navigate = useNavigate();
    const { user, logout: storeLogout } = useAuthStore();

    const unreadCounts = useChatStore(state => state.unreadCounts);
    const conversations = useChatStore(state => state.conversations);
    const setConversations = useChatStore(state => state.setConversations);
    const setUnreadCount = useChatStore(state => state.setUnreadCount);

    // 2. Local State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [requests, setRequests] = useState([]);

    // 3. Derived State
    const totalChatUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
    const totalNotifications = totalChatUnread + requests.length;

    const unreadConversations = conversations.filter(
        c => (unreadCounts[c._id] || 0) > 0
    );

    // 4. Effect: Fetch Requests & Chat Data
    useEffect(() => {
        if (!user) return;

        const initData = async () => {
            try {
                // Fetch initial data
                const requestData = await getPendingRequests();
                setRequests(requestData);

                const chatData = await getConversations();
                const convs = chatData.conversations || [];
                setConversations(convs);

                convs.forEach(c => {
                    if (c.unreadCount > 0) {
                        setUnreadCount(c._id, c.unreadCount);
                    }
                });
            } catch (error) {
                console.error("Navbar data load failed:", error);
            }
        };

        initData();
        socketService.connect();

        // --- LISTENERS ---

        // A. Handle Chat Messages
        const handleNewMessage = (message) => {
            if (message.senderId !== user._id) {
                const activeConversationId = useChatStore.getState().currentConversation;
                if (activeConversationId === message.conversationId) return;

                const currentCount = useChatStore.getState().unreadCounts[message.conversationId] || 0;
                setUnreadCount(message.conversationId, currentCount + 1);

                // Refresh list to show preview
                getConversations().then(data => setConversations(data.conversations || []));
            }
        };

        // B. Handle Friend Requests (FIXED)
        const handleNewRequest = (data) => {
            console.log("🔔 Navbar received notification:", data);
            // Backend sends: { type: 'connection_request', sender: { ... } }
            if (data && data.sender) {
                setRequests(prev => {
                    // Avoid duplicates
                    if (prev.some(r => r._id === data.sender._id)) return prev;
                    return [data.sender, ...prev]; // Add to front
                });
            }
        };

        // Subscribe using the service methods (Clean & Robust)
        const removeMsgListener = socketService.onMessage(handleNewMessage);
        const removeNotifListener = socketService.onNotification(handleNewRequest); // <--- USES NEW METHOD

        return () => {
            removeMsgListener();
            removeNotifListener();
        };
    }, [user]);
    // 6. Handlers
    const handleAccept = async (requesterId) => {
        try {
            await acceptConnectionRequest(requesterId);
            setRequests(prev => prev.filter(r => r._id !== requesterId));
        } catch (error) {
            console.error("Accept failed", error);
        }
    };

    const handleReject = async (requesterId) => {
        try {
            await rejectConnectionRequest(requesterId);
            setRequests(prev => prev.filter(r => r._id !== requesterId));
        } catch (error) {
            console.error("Reject failed", error);
        }
    };

    const handleLogout = () => {
        socketService.disconnect();
        storeLogout();
        navigate('/auth/login');
    };

    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

    return (
        <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/app/discover" className="flex items-center gap-2">
                        <div className="bg-pink-600 p-1.5 rounded-lg">
                            <div className="w-4 h-4 border-2 border-white rounded-full" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">SkillSwap</span>
                    </Link>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">

                        {/* --- NOTIFICATION BELL --- */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all focus:outline-none"
                            >
                                <Bell className="h-6 w-6" />
                                {totalNotifications > 0 && (
                                    <span className="absolute top-1 right-1 h-5 w-5 bg-pink-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                        {totalNotifications > 9 ? '9+' : totalNotifications}
                                    </span>
                                )}
                            </button>

                            {/* DROPDOWN WINDOW */}
                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                                            {totalNotifications > 0 && (
                                                <span className="bg-blue-100 text-pink-700 text-xs px-2 py-1 rounded-full font-medium">
                                                    {totalNotifications} new
                                                </span>
                                            )}
                                        </div>

                                        <div className="max-h-[400px] overflow-y-auto">

                                            {/* --- SECTION 1: CONNECTION REQUESTS --- */}
                                            {requests.length > 0 && (
                                                <div className="border-b border-gray-100">
                                                    <div className="px-4 py-2 bg-blue-50/50 text-xs font-bold text-pink-600 uppercase tracking-wider">
                                                        Connection Requests
                                                    </div>
                                                    {requests.map(req => (
                                                        <div key={req._id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                                            <img
                                                                src={req.profilePhoto || `https://ui-avatars.com/api/?name=${req.name}`}
                                                                className="w-10 h-10 rounded-full object-cover bg-gray-200 border border-gray-200"
                                                                alt={req.name}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 truncate">{req.name}</p>
                                                                <p className="text-xs text-gray-500 truncate">wants to connect</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleAccept(req._id); }}
                                                                    className="p-1.5 bg-blue-100 text-pink-600 rounded-full hover:bg-blue-200 transition-colors"
                                                                    title="Accept"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleReject(req._id); }}
                                                                    className="p-1.5 bg-red-100 text-pink-600 rounded-full hover:bg-red-200 transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* --- SECTION 2: MESSAGES --- */}
                                            {unreadConversations.length > 0 ? (
                                                <>
                                                    <div className="px-4 py-2 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        Messages
                                                    </div>
                                                    {unreadConversations.map(conv => (
                                                        <div
                                                            key={conv._id}
                                                            onClick={() => {
                                                                navigate(`/app/chat/${conv._id}`);
                                                                setUnreadCount(conv._id, 0);
                                                                setIsNotificationsOpen(false);
                                                            }}
                                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none"
                                                        >
                                                            <img
                                                                src={conv.otherUser?.profilePhoto || `https://ui-avatars.com/api/?name=${conv.otherUser?.name}`}
                                                                className="w-10 h-10 rounded-full object-cover bg-gray-200"
                                                                alt=""
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {conv.otherUser?.name || 'Unknown User'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {conv.lastMessage?.content || 'New message'}
                                                                </p>
                                                            </div>
                                                            <div className="w-2 h-2 bg-pink-600 rounded-full flex-shrink-0"></div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : requests.length === 0 && (
                                                <div className="p-8 text-center text-gray-500 text-sm">
                                                    <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                                                    No new notifications
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-gray-100 p-2 bg-gray-50/50">
                                            <Link
                                                to="/app/chat"
                                                className="block text-center py-2 text-sm text-pink-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                                                onClick={() => setIsNotificationsOpen(false)}
                                            >
                                                View all messages
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-gray-50 rounded-full border border-transparent hover:border-gray-200 transition-all focus:outline-none"
                            >
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-semibold text-gray-700 leading-none">{user?.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Available</p>
                                </div>

                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm overflow-hidden">
                                    {user?.profilePhoto ? (
                                        <img src={user.profilePhoto} alt="Me" className="w-full h-full object-cover" />
                                    ) : (
                                        getInitials(user?.name)
                                    )}
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {isProfileDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-100 lg:hidden">
                                            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>

                                        <Link
                                            to="/app/profile"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-pink-600 transition-colors"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            <UserIcon className="w-4 h-4" /> Your Profile
                                        </Link>
                                        <Link
                                            to="/app/settings"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-pink-600 transition-colors"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            <Settings className="w-4 h-4" /> Settings
                                        </Link>

                                        <div className="h-px bg-gray-100 my-2" />

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 md:hidden">
                        <button
                            className="relative p-2 text-gray-600"
                            onClick={() => navigate('/app/chat')}
                        >
                            <Bell className="h-6 w-6" />
                            {totalNotifications > 0 && (
                                <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white absolute w-full shadow-lg z-50">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 overflow-hidden">
                            {user?.profilePhoto ? (
                                <img src={user.profilePhoto} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                getInitials(user?.name)
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                    <div className="p-2 space-y-1">
                        <Link
                            to="/app/profile"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <UserIcon className="w-5 h-5 text-gray-400" /> Profile
                        </Link>
                        <Link
                            to="/app/settings"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Settings className="w-5 h-5 text-gray-400" /> Settings
                        </Link>
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            <LogOut className="w-5 h-5" /> Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;