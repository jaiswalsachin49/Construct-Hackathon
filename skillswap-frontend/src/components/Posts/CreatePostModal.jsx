import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Image as ImageIcon, Video, Upload } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import useAuthStore from '../../store/authStore';
import { usePosts } from '../../hooks/usePosts';

const CreatePostModal = ({ isOpen, onClose, communityId }) => {
    const { user } = useAuthStore();
    const { createPost } = usePosts();

    const [content, setContent] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState('');

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const maxContentLength = 500;
    const remainingChars = maxContentLength - content.length;

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Validate
        if (mediaFiles.length + files.length > 10) {
            setError('Maximum 10 photos allowed');
            return;
        }

        const validFiles = files.filter((file) => {
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Each image must be less than 5MB');
                return false;
            }
            return true;
        });

        setMediaFiles([...mediaFiles, ...validFiles]);
        setError('');
    };

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate
        if (!file.type.startsWith('video/')) {
            setError('Only video files are allowed');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            setError('Video must be less than 50MB');
            return;
        }

        // Check duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 60) {
                setError('Video must be 60 seconds or less');
            } else {
                setMediaFiles([file]);
                setError('');
            }
        };
        video.src = URL.createObjectURL(file);
    };

    const removeMedia = (index) => {
        setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    };

    const addTag = (tag) => {
        const cleanTag = tag.trim().toLowerCase();
        if (!cleanTag) return;

        if (tags.length >= 5) {
            setError('Maximum 5 tags allowed');
            return;
        }

        if (tags.includes(cleanTag)) {
            setError('Tag already added');
            return;
        }

        setTags([...tags, cleanTag]);
        setTagInput('');
        setError('');
    };

    const removeTag = (tag) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handlePost = async () => {
        setError('');

        // Validation
        if (!content.trim() && mediaFiles.length === 0) {
            setError('Please add some content or media');
            return;
        }

        if (content.length > maxContentLength) {
            setError('Content is too long');
            return;
        }

        try {
            setIsPosting(true);

            await createPost(
                content.trim(),
                mediaFiles,
                visibility,
                tags,
                communityId
            );

            // Reset form
            setContent('');
            setMediaFiles([]);
            setTags([]);
            setTagInput('');
            setVisibility('public');

            onClose();
        } catch (err) {
            console.error('Failed to create post:', err);
            setError(err.response?.data?.message || 'Failed to create post');
        } finally {
            setIsPosting(false);
        }
    };

    const handleClose = () => {
        if (!isPosting) {
            setContent('');
            setMediaFiles([]);
            setTags([]);
            setTagInput('');
            setVisibility('public');
            setError('');
            onClose();
        }
    };

    const canPost = (content.trim().length > 0 || mediaFiles.length > 0) && !isPosting;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg" title="Create Post">
            <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3">
                    {user?.profilePhoto ? (
                        <img
                            src={user.profilePhoto}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                                {getInitials(user?.name)}
                            </span>
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-white">{user?.name}</p>
                        {communityId && (
                            <p className="text-sm text-[#8A90A2]">Posting to community</p>
                        )}
                    </div>
                </div>

                {/* Content Textarea */}
                <div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value.slice(0, maxContentLength))}
                        placeholder="What's on your mind?"
                        rows={5}
                        maxLength={maxContentLength}
                        autoFocus
                        className="w-full px-4 py-3 bg-[#101726] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] resize-none"
                    />
                    <p className="text-sm text-[#8A90A2] text-right mt-1">
                        {remainingChars} characters remaining
                    </p>
                </div>

                {/* Media Upload Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isPosting || mediaFiles.some((f) => f.type.startsWith('video/'))}
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ImageIcon className="h-5 w-5 text-[#3B82F6]" />
                        <span className="text-sm font-medium text-[#E6E9EF]">Add Photos</span>
                    </button>

                    <button
                        onClick={() => videoInputRef.current?.click()}
                        disabled={isPosting || mediaFiles.length > 0}
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Video className="h-5 w-5 text-[#2563EB]" />
                        <span className="text-sm font-medium text-[#E6E9EF]">Add Video</span>
                    </button>

                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                    />

                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                    />
                </div>

                {/* Media Preview */}
                {mediaFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                        {mediaFiles.map((file, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                {file.type.startsWith('image/') ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <video
                                        src={URL.createObjectURL(file)}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <button
                                    onClick={() => removeMedia(index)}
                                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                                >
                                    <X className="h-4 w-4 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tags Input */}
                <div>
                    <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
                        Tags (Optional)
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag(tagInput);
                                }
                            }}
                            placeholder="Add tags..."
                            className="flex-1 px-3 py-2 bg-[#101726] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        />
                        <button
                            type="button"
                            onClick={() => addTag(tagInput)}
                            disabled={!tagInput.trim()}
                            className="px-4 py-2 bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] text-black rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            Add
                        </button>
                    </div>

                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                                >
                                    #{tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="hover:bg-pink-200 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Visibility Selector */}
                <div>
                    <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
                        Visibility
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="visibility"
                                value="public"
                                checked={visibility === 'public'}
                                onChange={(e) => setVisibility(e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-[#E6E9EF]">Public</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="visibility"
                                value="allies"
                                checked={visibility === 'allies'}
                                onChange={(e) => setVisibility(e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-sm text-[#E6E9EF]">Allies Only</span>
                        </label>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isPosting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="warm"
                        onClick={handlePost}
                        isLoading={isPosting}
                        disabled={!canPost}
                        className="flex-1"
                    >
                        {isPosting ? 'Posting...' : 'Post'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

CreatePostModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    communityId: PropTypes.string,
};

export default CreatePostModal;
