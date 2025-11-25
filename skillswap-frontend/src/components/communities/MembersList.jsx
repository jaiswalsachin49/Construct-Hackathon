import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunities } from '../../hooks/useCommunities';
import useAuthStore from '../../store/authStore';
import { Search, Crown, Shield } from 'lucide-react';

const MembersList = ({ communityId }) => {
  const navigate = useNavigate();
  const { fetchCommunityMembers, updateMemberRole, kickMember } = useCommunities();
  const { user } = useAuthStore();
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

  const handleRoleUpdate = async (memberId, newRole) => {
    try {
      await updateMemberRole(communityId, memberId, newRole);
      // Optimistic update
      setMembers(prev => prev.map(m =>
        m.userId._id === memberId ? { ...m, role: newRole } : m
      ));
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await kickMember(communityId, memberId);
      // Remove from local state
      setMembers(prev => prev.filter(m => m.userId._id !== memberId));
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const filteredMembers = members.filter(member =>
    member.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentUserRole = members.find(m => m.userId?._id === user?._id)?.role;
  const isAdmin = currentUserRole === 'admin';

  const admins = filteredMembers.filter(m => m.role === 'admin');
  const moderators = filteredMembers.filter(m => m.role === 'moderator');
  const regularMembers = filteredMembers.filter(m => m.role === 'member' || !m.role);
  const MemberItem = ({ member }) => (
    <div
      data-testid={`member-${member._id}`}
      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5 group"
    >
      <div
        onClick={() => navigate(`/app/profile/${member.userId?._id}`)}
        className="w-12 h-12 bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] rounded-full flex items-center justify-center text-black font-semibold cursor-pointer"
      >
        {member.userId?.profilePhoto ? (
          <img src={member.userId?.profilePhoto} alt={member.userId?.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          member.userId?.name?.charAt(0)?.toUpperCase() || 'U'
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4
            onClick={() => navigate(`/app/profile/${member.userId?._id}`)}
            className="font-medium text-white cursor-pointer hover:underline"
          >
            {member.userId?.name}
          </h4>
          {member.role === 'admin' && (
            <Crown className="w-4 h-4 text-yellow-500" title="Admin" />
          )}
          {member.role === 'moderator' && (
            <Shield className="w-4 h-4 text-[#3B82F6]" title="Moderator" />
          )}
        </div>
        <p className="text-sm text-[#8A90A2]">
          {member.role === 'admin' ? 'Admin' : member.role === 'moderator' ? 'Moderator' : 'Member'}
          {member.joinedAt && ` • Joined ${new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
        </p>
      </div>

      {/* Admin Actions */}
      {isAdmin && user?._id !== member.userId?._id && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          {member.role !== 'admin' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRoleUpdate(member.userId._id, 'admin');
              }}
              className="px-3 py-1 text-xs font-medium bg-[#60A5FA]/20 text-[#60A5FA] rounded-full hover:bg-[#60A5FA]/30 transition-colors"
            >
              Make Admin
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRoleUpdate(member.userId._id, 'member');
              }}
              className="px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
            >
              Remove Admin
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveMember(member.userId._id);
            }}
            className="px-3 py-1 text-xs font-medium bg-red-600/20 text-red-500 rounded-full hover:bg-red-600/30 transition-colors"
          >
            Remove Member
          </button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-12 h-12 bg-white/10 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-1/3"></div>
              <div className="h-3 bg-white/10 rounded w-1/4"></div>
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8A90A2] w-5 h-5" />
        <input
          data-testid="members-search"
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#101726] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
        />
      </div>

      {/* Total Count */}
      <div className="text-sm text-[#8A90A2]">
        {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
      </div>

      {/* Admins */}
      {admins.length > 0 && (
        <div>
          <h3 className="font-semibold text-white mb-2">Admins ({admins.length})</h3>
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
          <h3 className="font-semibold text-white mb-2">Moderators ({moderators.length})</h3>
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
          <h3 className="font-semibold text-white mb-2">Members ({regularMembers.length})</h3>
          <div className="space-y-1">
            {regularMembers.map((member) => (
              <MemberItem key={member._id} member={member} />
            ))}
          </div>
        </div>
      )}

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-[#8A90A2]">
          No members found
        </div>
      )}
    </div>
  );
};

export default MembersList;
