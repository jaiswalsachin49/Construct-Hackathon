import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import CommunityPreview from '../components/communities/CommunityPreview';
import CommunityCard from '../components/communities/CommunityCard';
import CreateCommunityModal from '../components/communities/CreateCommunityModal';

// Mock data for demonstration
const mockMyCommunities = [
  {
    _id: '1',
    name: 'Photography Club',
    memberCount: 45,
    coverImage: null
  },
  {
    _id: '2',
    name: 'React Developers',
    memberCount: 120,
    coverImage: null
  },
  {
    _id: '3',
    name: 'Fitness Enthusiasts',
    memberCount: 67,
    coverImage: null
  },
  {
    _id: '4',
    name: 'Book Club',
    memberCount: 32,
    coverImage: null
  }
];

const mockNearbyCommunities = [
  {
    _id: '5',
    name: 'Photography Community',
    description: 'Learn and share photography tips with fellow enthusiasts. From beginners to professionals, everyone welcome!',
    category: 'arts',
    tags: ['photography', 'beginner', 'creative'],
    memberCount: 25,
    postCount: 12,
    distance: 2.3,
    isMember: false
  },
  {
    _id: '6',
    name: 'Tech Meetup Bangalore',
    description: 'Weekly meetups for developers, designers, and tech enthusiasts. Learn new technologies together.',
    category: 'tech',
    tags: ['technology', 'networking', 'coding'],
    memberCount: 89,
    postCount: 34,
    distance: 1.5,
    isMember: false
  },
  {
    _id: '7',
    name: 'Cooking Masters',
    description: 'Share recipes, cooking techniques, and food experiences. Join us for monthly cooking challenges!',
    category: 'cooking',
    tags: ['cooking', 'recipes', 'food'],
    memberCount: 56,
    postCount: 28,
    distance: 3.7,
    isMember: false
  },
  {
    _id: '8',
    name: 'Yoga & Wellness',
    description: 'Practice yoga together and share wellness tips. All levels welcome. Morning and evening sessions available.',
    category: 'fitness',
    tags: ['yoga', 'fitness', 'wellness'],
    memberCount: 41,
    postCount: 19,
    distance: 4.2,
    isMember: false
  },
  {
    _id: '9',
    name: 'Spanish Language Learners',
    description: 'Practice Spanish together through conversations, games, and cultural exchanges. ¡Vamos!',
    category: 'language',
    tags: ['spanish', 'language', 'learning'],
    memberCount: 33,
    postCount: 15,
    distance: 5.1,
    isMember: false
  },
  {
    _id: '10',
    name: 'Music Production Hub',
    description: 'Create, collaborate, and share music. From beginners to pros, all producers and musicians welcome.',
    category: 'music',
    tags: ['music', 'production', 'creative'],
    memberCount: 78,
    postCount: 42,
    distance: 6.8,
    isMember: false
  }
];

const CommunitiesPageDemo = () => {
  const navigate = useNavigate();
  
  const [myCommunities] = useState(mockMyCommunities);
  const [nearbyCommunities] = useState(mockNearbyCommunities);
  const [isLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState(10);

  // Filtered communities
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

    // Distance filter
    filtered = filtered.filter(c => c.distance <= radius);

    setFilteredCommunities(filtered);
  }, [nearbyCommunities, search, category, radius]);

  const handleJoin = async (communityId) => {
    console.log('Joining community:', communityId);
    alert(`Joined community ${communityId}! (Demo - backend integration required)`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
            <button
              data-testid="create-community-button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* My Communities Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            My Communities ({myCommunities.length})
          </h2>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {myCommunities.map((community) => (
              <CommunityPreview
                key={community._id}
                community={community}
                onClick={() => alert(`Navigate to community ${community._id} detail (Prompt 13.3)`)}
              />
            ))}
          </div>
        </div>

        {/* Discover Communities Section */}
        <div id="discover-section">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Discover Communities
          </h2>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  data-testid="search-input"
                  type="text"
                  placeholder="Search communities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <select
                  data-testid="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance: {radius} km
                </label>
                <input
                  data-testid="radius-slider"
                  type="range"
                  min={1}
                  max={50}
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Communities Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm h-80 animate-pulse">
                  <div className="h-32 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <CommunityCard
                  key={community._id}
                  community={community}
                  onJoin={handleJoin}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500 text-lg">
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
                  className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default CommunitiesPageDemo;
