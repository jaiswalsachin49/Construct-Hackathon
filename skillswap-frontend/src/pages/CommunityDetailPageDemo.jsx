import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Settings, Users, MapPin } from 'lucide-react';

// Mock community data
const mockCommunity = {
    _id: '5',
    name: 'Photography Community',
    description: 'Learn and share photography tips with fellow enthusiasts. From beginners to professionals, everyone welcome! We organize weekly photo walks and monthly challenges.',
    coverImage: null,
    category: 'arts',
    tags: ['photography', 'beginner', 'creative', 'learning'],
    memberCount: 25,
    postCount: 12,
    location: {
        areaLabel: 'Koramangala, Bangalore'
    },
    isMember: true,
    isAdmin: false
};

const mockPosts = [
    {
        _id: '1',
        author: { name: 'John Doe' },
        content: 'Just captured this amazing sunset! What camera settings would you recommend for golden hour photography?',
        createdAt: new Date('2025-01-15'),
        likes: 12,
        comments: 5
    },
    {
        _id: '2',
        author: { name: 'Jane Smith' },
        content: 'Excited to announce our upcoming photo walk this Saturday at Cubbon Park! Who\'s joining?',
        createdAt: new Date('2025-01-14'),
        likes: 8,
        comments: 3
    }
];

const mockMembers = [
    { _id: '1', name: 'Sarah Admin', role: 'admin', joinedAt: new Date('2024-01-01') },
    { _id: '2', name: 'Mike Mod', role: 'moderator', joinedAt: new Date('2024-03-15') },
    { _id: '3', name: 'John Doe', role: 'member', joinedAt: new Date('2024-06-20') },
    { _id: '4', name: 'Jane Smith', role: 'member', joinedAt: new Date('2024-07-10') },
    { _id: '5', name: 'Alex Brown', role: 'member', joinedAt: new Date('2024-08-05') }
];

const CommunityDetailPageDemo = () => {
    const { communityId } = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('posts');
    const [isMember, setIsMember] = useState(true);

    const handleShare = () => {
        alert('Link copied to clipboard! (Demo)');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-3">
                    <button
                        data-testid="back-button"
                        onClick={() => navigate('/app/communities-demo')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Communities
                    </button>
                </div>
            </div>

            {/* Community Header */}
            <div className="bg-white border-b border-gray-200">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold">
                        P
                    </div>
                </div>

                {/* Info Section */}
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {mockCommunity.name}
                    </h1>
                    <p className="text-gray-600 mb-4 max-w-3xl">
                        {mockCommunity.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{mockCommunity.memberCount} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{mockCommunity.location.areaLabel}</span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {mockCommunity.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {isMember ? (
                            <button
                                data-testid="leave-button"
                                onClick={() => {
                                    if (window.confirm('Leave community?')) setIsMember(false);
                                }}
                                className="px-6 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                            >
                                Leave
                            </button>
                        ) : (
                            <button
                                data-testid="join-button"
                                onClick={() => setIsMember(true)}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Join Community
                            </button>
                        )}
                        <button
                            data-testid="share-button"
                            onClick={handleShare}
                            className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex gap-8">
                        <button
                            data-testid="posts-tab"
                            onClick={() => setActiveTab('posts')}
                            className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'posts'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Posts
                        </button>
                        <button
                            data-testid="buzz-tab"
                            onClick={() => setActiveTab('buzz')}
                            className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'buzz'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Buzz (Chat)
                        </button>
                        <button
                            data-testid="members-tab"
                            onClick={() => setActiveTab('members')}
                            className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'members'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Members
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Posts Tab */}
                {activeTab === 'posts' && (
                    <div className="space-y-4">
                        <button className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-6 text-gray-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
                            <span className="text-2xl">+</span>
                            <span className="font-medium">Create Post</span>
                        </button>

                        {mockPosts.map((post) => (
                            <div
                                key={post._id}
                                className="bg-white rounded-lg shadow-sm p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {post.author.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{post.author.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {post.createdAt.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-gray-800 mb-4">{post.content}</p>
                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                    <button className="hover:text-blue-500">👍 {post.likes} Likes</button>
                                    <button className="hover:text-blue-500">💬 {post.comments} Comments</button>
                                    <button className="hover:text-blue-500">🔗 Share</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Buzz Tab */}
                {activeTab === 'buzz' && (
                    <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Community Buzz</h3>
                            <p className="text-xs text-gray-500">Real-time group chat (Socket.io integration required)</p>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <div className="text-center text-gray-500 py-12">
                                <p>Chat feature requires backend Socket.io integration</p>
                                <p className="text-sm mt-2">Messages will appear here in real-time</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                    disabled
                                />
                                <button
                                    className="px-4 py-2 bg-gray-300 text-white rounded-lg cursor-not-allowed"
                                    disabled
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search members..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="text-sm text-gray-600">{mockMembers.length} members</div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Admins (1)</h3>
                            {mockMembers.filter(m => m.role === 'admin').map((member) => (
                                <div key={member._id} className="flex items-center gap-3 p-3 bg-white rounded-lg mb-2">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{member.name} 👑</h4>
                                        <p className="text-sm text-gray-500">
                                            Admin • Joined {member.joinedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Moderators (1)</h3>
                            {mockMembers.filter(m => m.role === 'moderator').map((member) => (
                                <div key={member._id} className="flex items-center gap-3 p-3 bg-white rounded-lg mb-2">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{member.name} 🛡️</h4>
                                        <p className="text-sm text-gray-500">
                                            Moderator • Joined {member.joinedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Members (3)</h3>
                            {mockMembers.filter(m => m.role === 'member').map((member) => (
                                <div key={member._id} className="flex items-center gap-3 p-3 bg-white rounded-lg mb-2">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            Member • Joined {member.joinedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityDetailPageDemo;
