import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { useCommunities } from '../../hooks/useCommunities';
import { searchPlaces } from '../../services/locationService';

const CreateCommunityModal = ({ isOpen, onClose }) => {
  const { createNewCommunity, isLoading } = useCommunities();
  const coverInputRef = useRef(null);

  // Form state
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isPublic, setIsPublic] = useState(true);

  // Validation
  const canSubmit = name.trim() && description.trim() && category && selectedLocation;

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (tag) => {
    if (tag.trim() && tags.length < 5 && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    }
  };

  const selectLocation = (place) => {
    setSelectedLocation({
      lat: place.lat,
      lng: place.lng,
      areaLabel: place.display_name
    });
    setLocationInput('');
    setLocationSuggestions([]);
  };

  const handleLocationSearch = async (query) => {
    if (query.length > 2) {
      const results = await searchPlaces(query);
      setLocationSuggestions(results);
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      if (coverImage) formData.append('coverImage', coverImage);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      tags.forEach(tag => formData.append('tags', tag));
      formData.append('location', JSON.stringify(selectedLocation));
      formData.append('isPublic', isPublic);

      await createNewCommunity(formData);
      onClose();
      // Show success toast
      alert('Community created successfully!');
    } catch (error) {
      console.error('Error creating community:', error);
      alert('Failed to create community. Please try again.');
    }
  };

  const handleClose = () => {
    // Reset form
    setCoverImage(null);
    setCoverPreview('');
    setName('');
    setDescription('');
    setCategory('');
    setTags([]);
    setTagInput('');
    setLocationInput('');
    setSelectedLocation(null);
    setIsPublic(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0A0F1F] border border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Create Community</h2>
          <button
            data-testid="close-modal-button"
            onClick={handleClose}
            className="text-[#8A90A2] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
              Cover Image
            </label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <div
              data-testid="cover-upload-area"
              onClick={() => coverInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-lg h-40 cursor-pointer hover:border-[#00C4FF] transition-colors overflow-hidden bg-white/5"
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#8A90A2]">
                  <Upload className="w-12 h-12 mb-2" />
                  <p className="text-sm">Click to upload cover image</p>
                </div>
              )}
            </div>
          </div>

          {/* Community Name */}
          <div>
            <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
              Community Name *
            </label>
            <input
              data-testid="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter community name"
              maxLength={50}
              className="w-full px-4 py-2 bg-[#101726] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00C4FF] focus:border-transparent"
              required
            />
            <p className="text-xs text-[#8A90A2] mt-1">{50 - name.length} characters remaining</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
              Description *
            </label>
            <textarea
              data-testid="description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this community about?"
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2 bg-[#101726] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00C4FF] focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-[#8A90A2] mt-1">{500 - description.length} characters remaining</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
              Category *
            </label>
            <select
              data-testid="modal-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-[#101726] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00C4FF] focus:border-transparent"
              required
            >
              <option value="">Select category</option>
              <option value="tech">Technology</option>
              <option value="arts">Arts & Crafts</option>
              <option value="fitness">Fitness</option>
              <option value="music">Music</option>
              <option value="cooking">Cooking</option>
              <option value="language">Languages</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
              Tags (optional)
            </label>
            <input
              data-testid="tags-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="Add tags and press Enter"
              disabled={tags.length >= 5}
              className="w-full px-4 py-2 bg-[#101726] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00C4FF] focus:border-transparent disabled:bg-white/5"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#00C4FF]/10 text-[#00C4FF] rounded-full text-sm border border-[#00C4FF]/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-[#00C4FF]/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-[#8A90A2] mt-1">Max 5 tags ({tags.length}/5)</p>
          </div>

          {/* Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
              Location *
            </label>
            <input
              data-testid="location-input"
              type="text"
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                handleLocationSearch(e.target.value);
              }}
              placeholder="Search for location..."
              className="w-full px-4 py-2 bg-[#101726] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#00C4FF] focus:border-transparent"
            />

            {/* Location Suggestions */}
            {locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#101726] border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {locationSuggestions.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    onClick={() => selectLocation(place)}
                    className="w-full px-4 py-2 text-left text-[#E6E9EF] hover:bg-white/10 flex items-center gap-2 border-b border-white/10 last:border-0"
                  >
                    📍 <span className="truncate">{place.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedLocation && (
              <div className="mt-2 p-3 bg-[#00C4FF]/10 border border-[#00C4FF]/20 rounded-lg flex items-center gap-2">
                📍 <span className="text-[#00C4FF] font-medium">{selectedLocation.areaLabel}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation(null);
                    setLocationInput('');
                  }}
                  className="ml-auto text-[#00C4FF]/60 hover:text-[#00C4FF]"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-[#E6E9EF] mb-3">
              Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  data-testid="public-radio"
                  type="radio"
                  name="visibility"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="w-4 h-4 text-[#00C4FF] bg-[#101726] border-white/10"
                />
                <div>
                  <div className="font-medium text-white">Public</div>
                  <div className="text-sm text-[#8A90A2]">Anyone can join</div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  data-testid="private-radio"
                  type="radio"
                  name="visibility"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="w-4 h-4 text-[#00C4FF] bg-[#101726] border-white/10"
                />
                <div>
                  <div className="font-medium text-white">Private</div>
                  <div className="text-sm text-[#8A90A2]">Invite only</div>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-2 border border-white/10 hover:bg-white/5 rounded-lg font-medium transition-colors text-[#E6E9EF]"
            >
              Cancel
            </button>
            <button
              data-testid="create-button"
              type="submit"
              disabled={!canSubmit || isLoading}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00F5A0] to-[#00C4FF] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;
