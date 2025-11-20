import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Image, Video, Type, Upload } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useWaves } from '../../hooks/useWaves';

const CreateWaveModal = ({ isOpen, onClose }) => {
    const { createWave } = useWaves();
    const [activeTab, setActiveTab] = useState('photo'); // 'photo', 'video', 'text'
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('#3B82F6');
    const [caption, setCaption] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const colors = [
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Pink', value: '#EC4899' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Orange', value: '#F97316' },
        { name: 'Green', value: '#10B981' },
        { name: 'Black', value: '#000000' },
    ];

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setError('');

        // Validate file
        if (activeTab === 'photo') {
            if (!selectedFile.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }
        } else if (activeTab === 'video') {
            if (!selectedFile.type.startsWith('video/')) {
                setError('Please select a video file');
                return;
            }
            if (selectedFile.size > 20 * 1024 * 1024) {
                setError('Video must be less than 20MB');
                return;
            }

            // Check video duration
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 15) {
                    setError('Video must be 15 seconds or less');
                    setFile(null);
                    setPreview(null);
                }
            };
            video.src = URL.createObjectURL(selectedFile);
        }

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            fileInputRef.current.files = e.dataTransfer.files;
            handleFileSelect({ target: { files: [droppedFile] } });
        }
    };

    const handleSubmit = async () => {
        // Basic validation
        if (activeTab === 'text' && !textContent.trim()) return;
        if ((activeTab === 'photo' || activeTab === 'video') && !file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            // Pass setUploadProgress as the last argument
            await createWave(
                file, 
                activeTab, 
                caption, 
                textContent, 
                backgroundColor, 
                (percent) => setUploadProgress(percent) 
            );
            
            onClose();
            // Reset state
            setFile(null);
            setPreview(null);
            setTextContent('');
            setCaption('');
        } catch (err) {
            setError('Failed to create wave. Please try again.');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleClose = () => {
        if (!isUploading) {
            setFile(null);
            setPreview(null);
            setTextContent('');
            setCaption('');
            setError('');
            setActiveTab('photo');
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg" title="Create Wave">
            <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('photo')}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'photo'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Image className="h-5 w-5" />
                        Photo
                    </button>
                    <button
                        onClick={() => setActiveTab('video')}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'video'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Video className="h-5 w-5" />
                        Video
                    </button>
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === 'text'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Type className="h-5 w-5" />
                        Text
                    </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                    {/* Photo/Video Tab */}
                    {(activeTab === 'photo' || activeTab === 'video') && (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="space-y-4"
                        >
                            {preview ? (
                                <div className="relative">
                                    {activeTab === 'photo' ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <video
                                            src={preview}
                                            controls
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                    )}
                                    <button
                                        onClick={() => {
                                            setFile(null);
                                            setPreview(null);
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                >
                                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {activeTab === 'photo'
                                            ? 'PNG, JPG up to 5MB'
                                            : 'MP4, MOV up to 20MB, max 15 seconds'}
                                    </p>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={activeTab === 'photo' ? 'image/*' : 'video/*'}
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Text Tab */}
                    {activeTab === 'text' && (
                        <div className="space-y-4">
                            <textarea
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value.slice(0, 200))}
                                placeholder="Type your text..."
                                rows={6}
                                maxLength={200}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    {textContent.length} / 200 characters
                                </p>
                            </div>

                            {/* Background Color Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Background Color
                                </label>
                                <div className="flex gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => setBackgroundColor(color.value)}
                                            className={`h-10 w-10 rounded-full border-2 transition-all ${backgroundColor === color.value
                                                    ? 'border-gray-900 scale-110'
                                                    : 'border-gray-300'
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            {textContent && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preview
                                    </label>
                                    <div
                                        className="aspect-[9/16] max-h-64 rounded-lg flex items-center justify-center p-8"
                                        style={{ backgroundColor }}
                                    >
                                        <p className="text-white text-2xl font-bold text-center break-words">
                                            {textContent}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Caption */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caption (Optional)
                    </label>
                    <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value.slice(0, 100))}
                        placeholder="Add a caption..."
                        maxLength={100}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {caption.length} / 100 characters
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Uploading...</span>
                            <span className="font-medium text-blue-600">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isUploading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isUploading}
                        disabled={isUploading}
                        className="flex-1"
                    >
                        {isUploading ? 'Creating...' : 'Create Wave'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

CreateWaveModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default CreateWaveModal;
