import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Search, MessageCircle } from "lucide-react";
import Input from "../common/Input";
import ConversationItem from "./ConversationItem";

const ConversationList = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onlineUsers,
  currentUserId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const userName = conv.otherUser?.name?.toLowerCase() || "";
      const lastMessage = conv.lastMessage?.content?.toLowerCase() || "";
      return userName.includes(query) || lastMessage.includes(query);
    });
  }, [conversations, searchQuery]);

  // Separate unread and read conversations
  const unreadConversations = filteredConversations.filter(
    (conv) => conv.unreadCount > 0
  );
  const readConversations = filteredConversations.filter(
    (conv) => !conv.unreadCount || conv.unreadCount === 0
  );

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
        <Input
          name="search"
          placeholder="Search conversations..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </h3>
            <p className="text-gray-600 text-sm">
              {searchQuery
                ? "Try a different search term"
                : "Start chatting with someone to see your conversations here"}
            </p>
          </div>
        ) : (
          <>
            {/* Unread Section */}
            {unreadConversations.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 uppercase">
                    Unread ({unreadConversations.length})
                  </p>
                </div>
                {unreadConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation._id}
                    conversation={conversation}
                    isActive={conversation._id === currentConversationId}
                    onClick={() => onSelectConversation(conversation._id)}
                    onlineUsers={onlineUsers}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}

            {/* Read Conversations */}
            {readConversations.length > 0 && (
              <div>
                {unreadConversations.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 uppercase">
                      All Messages
                    </p>
                  </div>
                )}
                {readConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation._id}
                    conversation={conversation}
                    isActive={conversation._id === currentConversationId}
                    onClick={() => onSelectConversation(conversation._id)}
                    onlineUsers={onlineUsers}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

ConversationList.propTypes = {
  conversations: PropTypes.array.isRequired,
  currentConversationId: PropTypes.string,
  onSelectConversation: PropTypes.func.isRequired,
  onlineUsers: PropTypes.array,
  currentUserId: PropTypes.string,
};

export default ConversationList;
