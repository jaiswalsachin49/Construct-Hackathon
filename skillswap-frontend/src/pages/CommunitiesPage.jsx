import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useCommunities } from '../hooks/useCommunities';
import CommunityPreview from '../components/communities/CommunityPreview';
import CommunityCard from '../components/communities/CommunityCard';

const CommunitiesPage = () => {
  const navigate = useNavigate();
  const {
    myCommunities,
    nearbyCommunities,
    isLoading,
    error,
    fetchMyCommunities,
    fetchNearbyCommunities,
    joinCommunity
  } = useCommunities();

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState(10);

  // Filtered communities
  const [filteredCommunities, setFilteredCommunities] = useState([]);

  // Mock user location (in real app, get from user profile or geolocation)
  const userLocation = { lat: 12.9716, lng: 77.5946 }; // Bangalore

  useEffect(() => {
    // Fetch communities on mount
    const loadCommunities = async () => {
      try {
        await fetchMyCommunities();
        await fetchNearbyCommunities(userLocation.lat, userLocation.lng, radius);
      } catch (err) {
        console.error('Error loading communities:', err);
      }
    };
    loadCommunities();
  }, [radius]);

  // Apply filters
  useEffect(() => {
    let filtered = [...nearbyCommunities];

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (category) {
      filtered = filtered.filter(c => c.category === category);
    }

    setFilteredCommunities(filtered);
  }, [nearbyCommunities, search, category]);

  const handleJoin = async (communityId) => {
    try {
      await joinCommunity(communityId);
      // Refresh nearby communities to update join status
      await fetchNearbyCommunities(userLocation.lat, userLocation.lng, radius);
    } catch (err) {
      console.error('Error joining community:', err);
    }
  };
  // console.log(filteredCommunities)
  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Communities</h1>
            <button
              data-testid="create-community-button"
              onClick={() => navigate('/app/communities/create')}
              className="flex items-center gap-2 bg-gradient-to-r from-[#00F5A0] to-[#00C4FF] hover:shadow-[0_0_15px_rgba(0,244,255,0.4)] text-black px-4 py-2 rounded-lg font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              Create
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* My Communities Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            My Communities ({myCommunities.length})
          </h2>

          {myCommunities.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {myCommunities.filter(c => c && c._id).map((community) => (
                <CommunityPreview
                  key={community._id}
                  community={community}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center backdrop-blur-sm">
              <p className="text-[#8A90A2] mb-4">You haven't joined any communities yet</p>
              <button
                onClick={() => document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[#00C4FF] hover:text-[#00F5A0] font-medium transition-colors"
              >
                Discover communities →
              </button>
            </div>
          )}
        </div>

        {/* Discover Communities Section */}
        <div id="discover-section">
          <h2 className="text-2xl font-bold text-white mb-4">
            Discover Communities
          </h2>

          {/* Filters */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8A90A2] w-5 h-5" />
                <input
                  data-testid="search-input"
                  type="text"
                  placeholder="Search communities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#101726] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00C4FF] focus:border-transparent focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <select
                  data-testid="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-[#101726] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00C4FF] focus:border-transparent focus:outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="tech">Technology</option>
                  <option value="arts">Arts & Crafts</option>
                  <option value="fitness">Fitness</option>
                  <option value="music">Music</option>
                  <option value="cooking">Cooking</option>
                  <option value="language">Languages</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
                  Distance: {radius} km
                </label>
                <input
                  data-testid="radius-slider"
                  type="range"
                  min={1}
                  max={50}
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#101726] rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Communities Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/5 rounded-lg shadow-sm h-80 animate-pulse border border-white/10">
                  <div className="h-32 bg-white/10"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-white/10 rounded"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCommunities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredCommunities.map((community) =>
              (
                <CommunityCard
                  key={community._id}
                  community={community}
                  onJoin={handleJoin}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center backdrop-blur-sm">
              <p className="text-[#8A90A2] text-lg">
                {search || category
                  ? 'No communities found matching your filters'
                  : 'No nearby communities found'}
              </p>
              {(search || category) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setCategory('');
                  }}
                  className="mt-4 text-[#00C4FF] hover:text-[#00F5A0] font-medium transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunitiesPage;
