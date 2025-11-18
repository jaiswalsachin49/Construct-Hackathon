import React, { useState, useEffect } from 'react';
import { useCommunities } from '@/hooks/useCommunities';
import { Search, Crown, Shield } from 'lucide-react';

const MembersList = ({ communityId }) => {
  const { fetchCommunityMembers } = useCommunities();
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCommunityMembers(communityId);
        setMembers(data);
      } catch (error) {
        console.error('Error loading members:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMembers();
  }, [communityId]);

  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const admins = filteredMembers.filter(m => m.role === 'admin');
  const moderators = filteredMembers.filter(m => m.role === 'moderator');
  const regularMembers = filteredMembers.filter(m => m.role === 'member' || !m.role);

  const MemberItem = ({ member }) => (
    <div
      data-testid={`member-${member._id}`}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
        {member.avatar ? (
          <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          member.name?.charAt(0)?.toUpperCase() || 'U'
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">{member.name}</h4>
          {member.role === 'admin' && (
            <Crown className="w-4 h-4 text-yellow-500" title="Admin" />
          )}
          {member.role === 'moderator' && (
            <Shield className="w-4 h-4 text-blue-500" title="Moderator" />
          )}
        </div>
        <p className="text-sm text-gray-500">
          {member.role === 'admin' ? 'Admin' : member.role === 'moderator' ? 'Moderator' : 'Member'}
          {member.joinedAt && ` • Joined ${new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          data-testid="members-search"
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Total Count */}
      <div className="text-sm text-gray-600">
        {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
      </div>

      {/* Admins */}
      {admins.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Admins ({admins.length})</h3>
          <div className="space-y-1">
            {admins.map((member) => (
              <MemberItem key={member._id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Moderators */}
      {moderators.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Moderators ({moderators.length})</h3>
          <div className="space-y-1">
            {moderators.map((member) => (
              <MemberItem key={member._id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Members */}
      {regularMembers.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Members ({regularMembers.length})</h3>
          <div className="space-y-1">
            {regularMembers.map((member) => (
              <MemberItem key={member._id} member={member} />
            ))}
          </div>
        </div>
      )}

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No members found
        </div>
      )}
    </div>
  );
};

export default MembersList;
