import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added missing navigation
import { Search, RefreshCw } from "lucide-react";
import { useDiscovery } from "../../hooks/useDiscovery";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth for refreshUser
import { useToast } from "../../hooks/use-toast"; // <--- IMPORT TOAST HOOK

import UserCard from "../../components/discovery/UserCard";
import FilterBar from "../../components/discovery/FilterBar";
import ProfileModal from "../../components/discovery/ProfileModal";
import Loading from "../../components/common/Loading";
import Button from "../../components/common/Button";
import { sendConnectionRequest } from "../../services/discoveryService";

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

    // 1. Initial Load
    useEffect(() => {
        if (view === "nearby") {
            fetchNearbyUsers();
        } else {
            fetchMatches();
        }
    }, [view, filters.radius, filters.availability]);

    // 2. Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (view === "nearby") {
                fetchNearbyUsers();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // 3. Handle Connect (Fixed Logic)
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

    // 4. View Profile Handler
    const handleViewProfile = (userId) => {
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    const displayUsers = view === "nearby" ? nearbyUsers : matchedUsers;

    return (
        <div className="h-screen w-full bg-transparent overflow-hidden">
            {/* MAIN 2:1 LAYOUT */}
            <div className="flex h-full">
                {/* ----------------------------------------------------------- */}
                {/* LEFT SECTION (2 PARTS) — POST FEED SCROLLABLE               */}
                {/* ----------------------------------------------------------- */}
                <div className="w-[60%] h-full overflow-y-auto border-r border-white/10 p-6 space-y-6">
                    <h2 className="text-2xl font-semibold text-white mb-4">
                        Latest Posts
                    </h2>

                    {/* IMAGE POST */}
                    <div className="bg-white/5 border border-white/10 rounded-xl shadow-sm p-4 backdrop-blur-sm">
                        <img
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
                            className="w-full h-52 rounded-lg object-cover"
                            alt="Post preview"
                        />
                        <p className="text-[#E6E9EF] text-sm mt-2">
                            Example image-based post preview.
                        </p>
                    </div>

                    {/* VIDEO POST */}
                    <div className="bg-white/5 border border-white/10 rounded-xl shadow-sm p-4 backdrop-blur-sm">
                        <div className="w-full h-52 rounded-lg bg-white/5 flex items-center justify-center">
                            <span className="text-[#8A90A2] text-sm">Video Preview</span>
                        </div>
                        <p className="text-[#E6E9EF] text-sm mt-2">
                            Sample tutorial video post preview.
                        </p>
                    </div>

                    {/* TEXT POST */}
                    <div className="bg-white/5 border border-white/10 rounded-xl shadow-sm p-4 backdrop-blur-sm">
                        <div className="w-full h-52 rounded-lg bg-white/5 p-4">
                            <p className="text-[#E6E9EF] text-sm">
                                Text-only post — clean, minimal, perfect for updates & ideas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* RIGHT SECTION (1 PART) — DISCOVER + FILTER SCROLLABLE        */}
                {/* ----------------------------------------------------------- */}
                <div className="w-[40%] h-full flex flex-col p-6">
                    <FilterBar
                        filters={filters}
                        onFilterChange={setFilters}
                        view={view}
                        onViewChange={setView}
                    />

                    {/* Error */}
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
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
                            <div className="flex justify-center py-10">
                                <Loading
                                    size="lg"
                                    text={`Finding ${view === "nearby" ? "nearby users" : "matches"
                                        }...`}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 mt-6">
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
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/10 mb-4">
                                <Search className="h-10 w-10 text-[#8A90A2]" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                No users found
                            </h3>
                            <p className="text-[#8A90A2] mb-6">Try adjusting your filters</p>
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
