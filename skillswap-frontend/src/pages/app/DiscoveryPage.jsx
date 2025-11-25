import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added missing navigation
import { Search, RefreshCw } from "lucide-react";
import { useDiscovery } from "../../hooks/useDiscovery";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth for refreshUser
import { useToast } from "../../hooks/use-toast"; // <--- IMPORT TOAST HOOK

import UserCard from "../../components/discovery/UserCard";
import FilterBar from "../../components/discovery/FilterBar";
import ProfileModal from "../../components/discovery/ProfileModal";
import PostCard from "../../components/Posts/PostCard";
import Loading from "../../components/common/Loading";
import Button from "../../components/common/Button";
import { sendConnectionRequest } from "../../services/discoveryService";
import { getGlobalFeed } from "../../services/postService";

const DiscoveryPage = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth(); // Get refreshUser to update state after connecting
    const { toast } = useToast(); // <--- INITIALIZE TOAST

    const {
        nearbyUsers,
        matchedUsers,
        filters,
        isLoading,
        error,
        fetchNearbyUsers,
        fetchMatches,
        setFilters,
    } = useDiscovery();

    const [view, setView] = useState("nearby"); // 'nearby' or 'matches'
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Global feed state
    const [globalPosts, setGlobalPosts] = useState([]);
    const [feedLoading, setFeedLoading] = useState(true);
    const [feedPage, setFeedPage] = useState(1);

    // 1. Initial Load
    useEffect(() => {
        if (view === "nearby") {
            fetchNearbyUsers();
        } else {
            fetchMatches();
        }
    }, [view, filters.radius, filters.availability]);

    // 2. Load global feed
    useEffect(() => {
        const loadGlobalFeed = async () => {
            try {
                setFeedLoading(true);
                const data = await getGlobalFeed(1);
                setGlobalPosts(data.posts || []);
            } catch (error) {
                console.error('Failed to load global feed:', error);
            } finally {
                setFeedLoading(false);
            }
        };
        loadGlobalFeed();
    }, []);

    // 3. Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (view === "nearby") {
                fetchNearbyUsers();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // 4. Handle Connect (Fixed Logic)
    const handleConnect = async (userId) => {
        try {
            // A. Call API
            await sendConnectionRequest(userId);

            // B. Show Success Message
            toast({
                title: "Request Sent",
                description: "Connection request sent successfully.",
                variant: "success", // Uses your Toast.jsx green variant
            });

            // C. Refresh Global User State (updates lists instantly)
            // await refreshUser();
        } catch (error) {
            console.error("Failed to connect:", error);
            toast({
                title: "Error",
                description: "Could not send connection request. Please try again.",
                variant: "destructive", // Uses your Toast.jsx red variant
            });
        }
    };
    // console.log("Global Posts:", globalPosts);
    // 5. View Profile Handler
    const handleViewProfile = (userId) => {
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    const [mobileView, setMobileView] = useState('feed'); // 'feed' or 'discover'

    const displayUsers = view === "nearby" ? nearbyUsers : matchedUsers;

    return (
        <div className="h-screen w-full bg-transparent overflow-hidden flex flex-col">
            {/* Mobile Toggle Buttons - Only visible on mobile */}
            <div className="lg:hidden flex border-b border-white/10 bg-white/5 backdrop-blur-xl">
                <button
                    onClick={() => setMobileView('feed')}
                    className={`flex-1 py-3 px-4 font-semibold transition-all ${mobileView === 'feed'
                        ? 'text-white border-b-2 border-[#3B82F6] bg-white/5'
                        : 'text-[#8A90A2] hover:text-white'
                        }`}
                >
                    Feed
                </button>
                <button
                    onClick={() => setMobileView('discover')}
                    className={`flex-1 py-3 px-4 font-semibold transition-all ${mobileView === 'discover'
                        ? 'text-white border-b-2 border-[#3B82F6] bg-white/5'
                        : 'text-[#8A90A2] hover:text-white'
                        }`}
                >
                    Discover
                </button>
            </div>

            {/* MAIN LAYOUT - Responsive */}
            <div className="flex flex-1 overflow-hidden">
                {/* ----------------------------------------------------------- */}
                {/* LEFT SECTION — POST FEED SCROLLABLE */}
                {/* Hidden on mobile when discover view is active */}
                {/* ----------------------------------------------------------- */}
                <div className={`w-full lg:w-[60%] h-full overflow-y-auto lg:border-r border-white/10 p-4 md:p-6 space-y-4 md:space-y-6 no-scrollbar ${mobileView === 'discover' ? 'hidden lg:block' : 'block'
                    }`}>
                    <h2 className="text-xl md:text-2xl font-semibold text-white mb-2 md:mb-4">
                        Latest Posts
                    </h2>

                    {feedLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white/5 rounded-lg shadow-md p-4 animate-pulse border border-white/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-white/10" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-white/10 rounded w-1/4 mb-2" />
                                            <div className="h-3 bg-white/10 rounded w-1/6" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="h-4 bg-white/10 rounded w-full" />
                                        <div className="h-4 bg-white/10 rounded w-5/6" />
                                        <div className="h-4 bg-white/10 rounded w-4/6" />
                                    </div>
                                    <div className="h-48 bg-white/10 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : globalPosts.length > 0 ? (
                        globalPosts.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onUpdate={(updatedFields) => {
                                    setGlobalPosts(prev => prev.map(p =>
                                        p._id === post._id ? { ...p, ...updatedFields } : p
                                    ));
                                }}
                                onDelete={(postId) => {
                                    setGlobalPosts(prev => prev.filter(p => p._id !== postId));
                                }}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-lg border border-dashed border-white/20">
                            <p className="text-[#8A90A2]">No posts to display yet.</p>
                        </div>
                    )}
                </div>

                {/* ----------------------------------------------------------- */}
                {/* RIGHT SECTION — DISCOVER + FILTER SCROLLABLE */}
                {/* Hidden on mobile when feed view is active */}
                {/* ----------------------------------------------------------- */}
                <div className={`w-full lg:w-[40%] h-full flex flex-col p-4 md:p-6 ${mobileView === 'feed' ? 'hidden lg:flex' : 'flex'
                    }`}>
                    <FilterBar
                        filters={filters}
                        onFilterChange={setFilters}
                        view={view}
                        onViewChange={setView}
                    />

                    {/* Error */}
                    {error && (
                        <div className="mb-4 md:mb-6 bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between text-sm md:text-base">
                            <span>{error}</span>
                            <button
                                onClick={() => fetchNearbyUsers()}
                                className="text-sm underline hover:text-red-300"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loading */}
                    <div className="flex-1 overflow-y-auto mt-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white/5 rounded-xl shadow-sm p-4 animate-pulse border border-white/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-12 w-12 rounded-full bg-white/10" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                                                <div className="h-3 bg-white/10 rounded w-1/2" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-white/10 rounded w-full" />
                                            <div className="h-3 bg-white/10 rounded w-4/5" />
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <div className="h-8 bg-white/10 rounded flex-1" />
                                            <div className="h-8 bg-white/10 rounded flex-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:gap-5 mt-4 md:mt-6">
                                {displayUsers.map((user) => (
                                    <UserCard
                                        key={user._id}
                                        user={user}
                                        onConnect={handleConnect}
                                        onViewProfile={handleViewProfile}
                                        className="!rounded-xl !shadow-sm"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Empty State */}
                    {!isLoading && displayUsers.length === 0 && !error && (
                        <div className="text-center py-12 md:py-16">
                            <div className="inline-flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/10 mb-4">
                                <Search className="h-8 w-8 md:h-10 md:w-10 text-[#8A90A2]" />
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                                No users found
                            </h3>
                            <p className="text-sm md:text-base text-[#8A90A2] mb-4 md:mb-6">Try adjusting your filters</p>
                            <Button
                                variant="warm"
                                onClick={() =>
                                    setFilters({ radius: 10, search: "", availability: null })
                                }
                            >
                                Reset Filters
                            </Button>
                        </div>
                    )}

                    {/* Modal */}
                    {selectedUserId && (
                        <ProfileModal
                            userId={selectedUserId}
                            isOpen={isModalOpen}
                            onClose={() => {
                                setIsModalOpen(false);
                                setSelectedUserId(null);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiscoveryPage;
