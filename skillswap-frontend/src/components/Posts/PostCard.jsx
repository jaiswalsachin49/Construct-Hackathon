import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Heart, MessageCircle, Share2, MoreVertical, Trash2, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts';
import useAuthStore from '../../store/authStore';
import { sharePost } from '../../services/postService';
import ReportModal from '../safety/ReportModal';
import LikesListModal from '../common/LikesListModal';
import ConfirmationModal from '../common/ConfirmationModal';
import { toast } from 'react-hot-toast';

const PostCard = ({ post, onUpdate, onDelete, isCommunityAdmin = false }) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { toggleLike, addComment, deleteComment, deletePost, updatePost } = usePosts();
    const cardRef = useRef(null);

    const [showComments, setShowComments] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isCommentDeleting, setIsCommentDeleting] = useState(false);
    const [commentId, setCommentId] = useState(null);

    const isLiked = post.likes?.includes(user?._id);
    // Handle both post.user and post.userId (different backend response formats)
    const postAuthorId = post.user?._id || post.userId?._id || post.userId;
    const isOwnPost = postAuthorId === user?._id;
    const canDelete = isOwnPost || isCommunityAdmin;

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleLike = async () => {
        try {
            await toggleLike(post._id, user._id);
            // Notify parent component of the update
            if (onUpdate) {
                const newLikes = isLiked
                    ? post.likes.filter(id => id !== user._id)
                    : [...(post.likes || []), user._id];
                onUpdate({ likes: newLikes });
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || isAddingComment) return;

        setIsAddingComment(true);
        try {
            const result = await addComment(post._id, commentText.trim());
            setCommentText('');
            // Notify parent component of the update
            if (onUpdate && result?.comment) {
                const newComments = [...(post.comments || []), result.comment];
                onUpdate({ comments: newComments });
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsAddingComment(false);
        }
    };

    const confirmDeleteComment = async () => {
        if (!commentId) return;

        try {
            await deleteComment(post._id, commentId);
            // Notify parent component of the update
            if (onUpdate) {
                const newComments = (post.comments || []).filter(c => c._id !== commentId);
                onUpdate({ comments: newComments });
            }
            toast.success('Comment deleted');
            setIsCommentDeleting(false);
            setCommentId(null);
        } catch (error) {
            console.error('Failed to delete comment:', error);
            toast.error('Failed to delete comment');
        }
    };

    const handleShare = async () => {
        const postUrl = `${window.location.origin}/app/post/${post._id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Post by ${post.user?.name}`,
                    text: post.content,
                    url: postUrl,
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(postUrl);
            toast.success('Link copied to clipboard!');
        }

        try {
            await sharePost(post._id);
        } catch (error) {
            console.error('Failed to record share:', error);
        }
    };

    const handleDeleteClick = () => {
        setShowMore(false);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deletePost(post._id);
            toast.success('Post deleted');
            setShowDeleteModal(false);
            if (onDelete) {
                onDelete(post._id);
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
            toast.error('Failed to delete post');
            setShowDeleteModal(false);
        }
    };

    const shouldTruncate = post.content && post.content.length > 300;
    const displayContent = shouldTruncate && !showFullContent
        ? post.content.slice(0, 300) + '...'
        : post.content;

    // console.log(post.comments)
    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="bg-white/5 rounded-lg shadow-md overflow-hidden mb-4 border border-white/10 backdrop-blur-xl relative group"
            style={{
                '--mouse-x': `${mousePosition.x}px`,
                '--mouse-y': `${mousePosition.y}px`,
            }}
        >
            {/* Glow Effect */}
            <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0, 196, 255, 0.15), transparent 40%)`,
                }}
            />
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => navigate(`/app/profile/${post?._id}`)}
                        className="cursor-pointer"
                    >
                        {post.userId?.profilePhoto ? (
                            <img
                                src={post.userId.profilePhoto}
                                alt={post.userId.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                    {getInitials(post.userId?.name)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <h4
                            onClick={() => navigate(`/app/profile/${post._id}`)}
                            className="font-semibold text-white cursor-pointer hover:underline"
                        >
                            {post.userId?.name || 'Unknown User'}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-[#8A90A2]">
                            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            {post.communityId && (
                                <>
                                    <span>•</span>
                                    <span
                                        className="text-[#3B82F6] hover:text-[#60A5FA] cursor-pointer transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/app/communities/${post.communityId._id}`);
                                        }}
                                    >
                                        in {post.communityId.name}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <MoreVertical className="h-5 w-5 text-[#8A90A2]" />
                    </button>

                    {showMore && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#101726] rounded-lg shadow-lg border border-white/10 py-1 z-10 backdrop-blur-sm">
                            {isOwnPost && (
                                <button onClick={() => {
                                    const newContent = window.prompt('Edit post content', post.content);
                                    if (newContent !== null) {
                                        try {
                                            // update post (async)
                                            updatePost(post._id, { content: newContent }).catch(err => {
                                                console.error('Edit failed', err);
                                                toast.error('Failed to update post');
                                            });
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }
                                }} className="w-full px-4 py-2 text-left hover:bg-white/10 text-sm text-white">
                                    Edit Post
                                </button>
                            )}

                            {canDelete && (
                                <button
                                    onClick={handleDeleteClick}
                                    className="w-full px-4 py-2 text-left hover:bg-white/10 text-sm text-red-500 flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Post
                                </button>
                            )}

                            {!isOwnPost && (
                                <button
                                    onClick={() => {
                                        setShowMore(false);
                                        setShowReportModal(true);
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-white/10 text-sm text-white flex items-center gap-2"
                                >
                                    <Flag className="h-4 w-4" />
                                    Report Post
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Content */}
            <div className="px-4 pb-3">
                <p className="text-[#E6E9EF] whitespace-pre-wrap break-words">
                    {displayContent}
                </p>
                {shouldTruncate && (
                    <button
                        onClick={() => setShowFullContent(!showFullContent)}
                        className="text-blue-600 text-sm font-medium hover:underline mt-1"
                    >
                        {showFullContent ? 'Show less' : 'Read more'}
                    </button>
                )}

                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag, index) => (
                            <span key={index} className="text-[#3B82F6] text-sm">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Media */}
            {post.media && post.media.length > 0 && (
                <div className="relative">
                    {post.media[0].type === 'photo' ? (
                        <img
                            src={post.media[0].url}
                            alt="Post media"
                            className="w-full max-h-96 object-cover"
                        />
                    ) : (
                        <video
                            src={post.media[0].url}
                            controls
                            className="w-full max-h-96"
                        />
                    )}

                    {post.media.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                            +{post.media.length - 1} more
                        </div>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="px-4 py-2 flex items-center justify-between text-sm text-[#8A90A2] border-t border-white/10">
                <span
                    onClick={() => setShowLikesModal(true)}
                    className="cursor-pointer hover:text-white hover:underline transition-colors"
                >
                    {post.likes?.length || 0} likes
                </span>
                <div className="flex gap-3">
                    <span>{post.comments?.length || 0} comments</span>
                    {post.shares > 0 && <span>{post.shares} shares</span>}
                </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-2 flex items-center justify-around border-t border-white/10">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors ${isLiked ? 'text-red-500' : 'text-[#8A90A2]'
                        }`}
                >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">Like</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-[#8A90A2]"
                >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Comment</span>
                </button>

                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-[#8A90A2]"
                >
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-4 pb-4 border-t border-white/10">
                    <div className="space-y-3 mt-3">
                        {post.comments?.slice(0, 2).map((comment) => (
                            <div key={comment._id} className="flex gap-2 group">
                                <div className="flex-shrink-0">
                                    {comment.userId?.profilePhoto ? (
                                        <img
                                            src={comment.userId.profilePhoto}
                                            alt={comment.userId.name}
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                                            <span className="text-xs font-semibold text-[#E6E9EF]">
                                                {getInitials(comment.userId?.name)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-white/5 rounded-lg px-3 py-2 relative">
                                        <p className="font-semibold text-sm text-white">{comment.userId?.name}</p>
                                        <p className="text-sm text-[#E6E9EF]">{comment.content}</p>
                                        {/* Delete button - only show for comment author or post author */}
                                        {((comment.userId?._id || comment.userId) === user?._id || isOwnPost) && (
                                            <button
                                                onClick={() => {
                                                    setCommentId(comment._id);
                                                    setIsCommentDeleting(true);
                                                }}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                                                title="Delete comment"
                                            >
                                                <Trash2 className="h-3 w-3 text-red-400" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#8A90A2] mt-1 ml-3">
                                        {(() => {
                                            try {
                                                const date = new Date(comment.createdAt);
                                                if (isNaN(date.getTime())) return 'Just now';
                                                return formatDistanceToNow(date, { addSuffix: true });
                                            } catch {
                                                return 'Just now';
                                            }
                                        })()}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {post.comments?.length > 2 && (
                            <button className="text-sm text-gray-600 hover:underline">
                                View all {post.comments.length} comments
                            </button>
                        )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-2 mt-3">
                        <div className="flex-shrink-0">
                            {user?.profilePhoto ? (
                                <img
                                    src={user.profilePhoto}
                                    alt="You"
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-white">
                                        {getInitials(user?.name)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                placeholder="Add a comment..."
                                className="flex-1 px-3 py-2 bg-[#101726] border border-white/10 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                                disabled={isAddingComment}
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={!commentText.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] text-black rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                targetType="post"
                targetId={post._id}
                targetName={`Post by ${post.userId?.name || 'Unknown User'}`}
            />

            {/* Likes List Modal */}
            <LikesListModal
                isOpen={showLikesModal}
                onClose={() => setShowLikesModal(false)}
                targetId={post._id}
                type="post"
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
            <ConfirmationModal
                isOpen={isCommentDeleting}
                onClose={() => {
                    setIsCommentDeleting(false);
                    setCommentId(null);
                }}
                onConfirm={confirmDeleteComment}
                title="Delete Comment"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
};

PostCard.propTypes = {
    post: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        user: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
            profilePhoto: PropTypes.string,
        }),
        content: PropTypes.string,
        media: PropTypes.arrayOf(
            PropTypes.shape({
                url: PropTypes.string,
                type: PropTypes.string,
            })
        ),
        likes: PropTypes.arrayOf(PropTypes.string),
        comments: PropTypes.arrayOf(PropTypes.object),
        shares: PropTypes.number,
        createdAt: PropTypes.string,
        community: PropTypes.object,
        tags: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    onUpdate: PropTypes.func,
    onDelete: PropTypes.func,
    isCommunityAdmin: PropTypes.bool,
};

export default PostCard;
