import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, LogOut, Settings, User as UserIcon, ChevronDown, MessageCircle, Check } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import socketService from '../../services/socketService';
import { getConversations } from '../../services/chatService';
import { getPendingRequests, acceptConnectionRequest, rejectConnectionRequest } from '../../services/discoveryService';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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
        <nav className="sticky top-0 z-40 bg-white/5 border-b border-white/10 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/app/feed" className="flex items-center gap-0 group">
                        <div className="w-16 h-16 flex items-center justify-center">
                            <DotLottieReact
                                src="/logo_final.lottie"
                                loop
                                autoplay
                                className="w-full h-full"
                            />
                        </div>
                        <span className="text-2xl font-bold -skew-x-6 bg-gradient-to-r from-[#00F5A0] to-[#00C4FF] bg-clip-text text-transparent tracking-tight -ml-2">
                            killSwap
                        </span>
                    </Link>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">

                        {/* --- NOTIFICATION BELL --- */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative p-2 text-[#8A90A2] hover:bg-white/10 hover:text-white rounded-full transition-all focus:outline-none"
                            >
                                <Bell className="h-6 w-6" />
                                {totalNotifications > 0 && (
                                    <span className="absolute top-1 right-1 h-5 w-5 bg-[#00C4FF] text-black text-xs font-bold flex items-center justify-center rounded-full border-2 border-[#101726] shadow-sm">
                                        {totalNotifications > 9 ? '9+' : totalNotifications}
                                    </span>
                                )}
                            </button>

                            {/* DROPDOWN WINDOW */}
                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-80 bg-[#101726] rounded-xl shadow-2xl border border-white/10 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden backdrop-blur-xl">
                                        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                                            <h3 className="font-semibold text-white">Notifications</h3>
                                            {totalNotifications > 0 && (
                                                <span className="bg-[#00C4FF]/20 text-[#00C4FF] text-xs px-2 py-1 rounded-full font-medium border border-[#00C4FF]/30">
                                                    {totalNotifications} new
                                                </span>
                                            )}
                                        </div>

                                        <div className="max-h-[400px] overflow-y-auto">

                                            {/* --- SECTION 1: CONNECTION REQUESTS --- */}
                                            {requests.length > 0 && (
                                                <div className="border-b border-white/10">
                                                    <div className="px-4 py-2 bg-white/5 text-xs font-bold text-[#00C4FF] uppercase tracking-wider">
                                                        Connection Requests
                                                    </div>
                                                    {requests.map(req => (
                                                        <div key={req._id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                                                            <img
                                                                src={req.profilePhoto || `https://ui-avatars.com/api/?name=${req.name}`}
                                                                className="w-10 h-10 rounded-full object-cover bg-white/10 border border-white/10"
                                                                alt={req.name}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-white truncate">{req.name}</p>
                                                                <p className="text-xs text-[#8A90A2] truncate">wants to connect</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleAccept(req._id); }}
                                                                    className="p-1.5 bg-[#00F5A0]/20 text-[#00F5A0] rounded-full hover:bg-[#00F5A0]/30 transition-colors"
                                                                    title="Accept"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleReject(req._id); }}
                                                                    className="p-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
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
                                                    <div className="px-4 py-2 bg-white/5 text-xs font-bold text-[#8A90A2] uppercase tracking-wider">
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
                                                            className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors border-b border-white/5 last:border-none"
                                                        >
                                                            <img
                                                                src={conv.otherUser?.profilePhoto || `https://ui-avatars.com/api/?name=${conv.otherUser?.name}`}
                                                                className="w-10 h-10 rounded-full object-cover bg-white/10"
                                                                alt=""
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-white truncate">
                                                                    {conv.otherUser?.name || 'Unknown User'}
                                                                </p>
                                                                <p className="text-xs text-[#8A90A2] truncate">
                                                                    {conv.lastMessage?.content || 'New message'}
                                                                </p>
                                                            </div>
                                                            <div className="w-2 h-2 bg-[#00C4FF] rounded-full flex-shrink-0"></div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : requests.length === 0 && (
                                                <div className="p-8 text-center text-[#8A90A2] text-sm">
                                                    <Bell className="h-8 w-8 text-white/20 mx-auto mb-2" />
                                                    No new notifications
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-white/10 p-2 bg-white/5">
                                            <Link
                                                to="/app/chat"
                                                className="block text-center py-2 text-sm text-[#00C4FF] hover:bg-white/10 rounded-lg font-medium transition-colors"
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
                                className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-white/10 rounded-full border border-transparent hover:border-white/10 transition-all focus:outline-none"
                            >
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-semibold text-white leading-none">{user?.name}</p>
                                    <p className="text-xs text-[#8A90A2] mt-0.5">Available</p>
                                </div>

                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#00C4FF] to-[#7A3EF9] flex items-center justify-center text-white font-bold border-2 border-[#101726] shadow-sm overflow-hidden">
                                    {user?.profilePhoto ? (
                                        <img src={user.profilePhoto} alt="Me" className="w-full h-full object-cover" />
                                    ) : (
                                        getInitials(user?.name)
                                    )}
                                </div>
                                <ChevronDown className="w-4 h-4 text-[#8A90A2]" />
                            </button>

                            {isProfileDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-[#101726] rounded-xl shadow-2xl border border-white/10 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                                        <div className="px-4 py-3 border-b border-white/10 lg:hidden">
                                            <p className="text-sm font-semibold text-white">{user?.name}</p>
                                            <p className="text-xs text-[#8A90A2] truncate">{user?.email}</p>
                                        </div>

                                        <Link
                                            to="/app/profile"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E6E9EF] hover:bg-white/10 hover:text-[#00C4FF] transition-colors"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            <UserIcon className="w-4 h-4" /> Your Profile
                                        </Link>
                                        <Link
                                            to="/app/settings"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E6E9EF] hover:bg-white/10 hover:text-[#00C4FF] transition-colors"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                        >
                                            <Settings className="w-4 h-4" /> Settings
                                        </Link>

                                        <div className="h-px bg-white/10 my-2" />

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
                <div className="md:hidden border-t border-white/10 bg-[#101726] absolute w-full shadow-lg z-50">
                    <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/10 overflow-hidden">
                            {user?.profilePhoto ? (
                                <img src={user.profilePhoto} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                getInitials(user?.name)
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-white">{user?.name}</p>
                            <p className="text-xs text-[#8A90A2]">{user?.email}</p>
                        </div>
                    </div>
                    <div className="p-2 space-y-1">
                        <Link
                            to="/app/profile"
                            className="flex items-center gap-3 px-4 py-3 text-[#E6E9EF] hover:bg-white/10 rounded-lg"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <UserIcon className="w-5 h-5 text-[#8A90A2]" /> Profile
                        </Link>
                        <Link
                            to="/app/settings"
                            className="flex items-center gap-3 px-4 py-3 text-[#E6E9EF] hover:bg-white/10 rounded-lg"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Settings className="w-5 h-5 text-[#8A90A2]" /> Settings
                        </Link>
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg"
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