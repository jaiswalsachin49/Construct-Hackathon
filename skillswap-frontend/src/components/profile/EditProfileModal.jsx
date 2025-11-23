import React, { useState, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { updateProfile, getCurrentUser } from '../../services/authService';
import useAuthStore from '../../store/authStore';

const EditProfileModal = ({ isOpen, onClose, currentUser }) => {
  const coverInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // Form state
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState(null);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [teachTags, setTeachTags] = useState([]);
  const [teachInput, setTeachInput] = useState('');
  const [learnTags, setLearnTags] = useState([]);
  const [learnInput, setLearnInput] = useState('');
  const [availability, setAvailability] = useState('flexible');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setLocation(currentUser.location || null);

      // Normalize teachTags
      const normalizedTeachTags = (currentUser.teachTags || []).map(t => {
        if (typeof t === 'string') return { tag: t, level: 'Intermediate' };
        if (t.name && !t.tag) return { ...t, tag: t.name, level: t.level || 'Intermediate' };
        return t;
      });
      setTeachTags(normalizedTeachTags);

      // Normalize learnTags
      const normalizedLearnTags = (currentUser.learnTags || []).map(t => {
        if (typeof t === 'object' && t.name) return t.name;
        return t;
      });
      setLearnTags(normalizedLearnTags);

      setAvailability(currentUser.availability || 'flexible');
      setCoverPreview(currentUser.coverPhoto || '');
      setPhotoPreview(currentUser.profilePhoto || '');
    }
  }, [currentUser, isOpen]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTeachSkill = (skill) => {
    if (skill.trim() && teachTags.length < 10 && !teachTags.find(t => t.tag === skill.trim())) {
      setTeachTags([...teachTags, { tag: skill.trim(), level: 'Intermediate' }]);
    }
  };

  const removeTeachSkill = (skillTag) => {
    setTeachTags(teachTags.filter(t => ((t && (t.tag || t.name)) !== skillTag)));
  };

  const addLearnSkill = (skill) => {
    if (skill.trim() && learnTags.length < 10 && !learnTags.includes(skill.trim())) {
      setLearnTags([...learnTags, skill.trim()]);
    }
  };

  const removeLearnSkill = (skill) => {
    setLearnTags(learnTags.filter(t => {
      const val = (typeof t === 'object') ? (t.name || t.tag || String(t)) : t;
      return val !== skill;
    }));
  };

  const selectLocation = (loc) => {
    setLocation(loc);
    setShowLocationSearch(false);
    setLocationInput('');
  };

  const canSave = name.trim() && location && teachTags.length > 0 && learnTags.length > 0;

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const formData = new FormData();
      if (coverFile) formData.append('coverPhoto', coverFile);
      if (photoFile) formData.append('profilePhoto', photoFile);
      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('location', JSON.stringify(location));
      formData.append('teachTags', JSON.stringify(teachTags));
      formData.append('learnTags', JSON.stringify(learnTags));
      formData.append('availability', availability);

      // Call real API
      const updatedUser = await updateProfile(formData);

      // Update local auth store so UI reflects changes immediately
      const setUser = useAuthStore.getState().setUser;
      // API may return { success: true, user: {...} }
      if (updatedUser) {
        const userObj = updatedUser.user || updatedUser;
        if (userObj && userObj._id) {
          setUser(userObj);
        } else {
          try {
            const fresh = await getCurrentUser();
            const freshUser = fresh.user || fresh;
            if (freshUser) setUser(freshUser);
          } catch (err) {
            console.warn('Could not refresh user after update', err);
          }
        }
      }

      alert('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset to original values
    if (currentUser) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setLocation(currentUser.location || null);
      // Normalize teachTags to internal shape { tag, level }
      const normalizedTeachTags = (currentUser.teachTags || []).map(t => {
        if (!t) return null;
        if (typeof t === 'string') return { tag: t, level: 'Intermediate' };
        if (t.tag) return t;
        if (t.name) return { tag: t.name, level: t.level || 'Intermediate' };
        return null;
      }).filter(Boolean);
      setTeachTags(normalizedTeachTags);

      // Normalize learnTags to simple strings
      const normalizedLearnTags = (currentUser.learnTags || []).map(t => {
        if (!t) return null;
        if (typeof t === 'string') return t;
        if (typeof t === 'object' && t.name) return t.name;
        return String(t);
      }).filter(Boolean);
      setLearnTags(normalizedLearnTags);
      setAvailability(currentUser.availability || 'flexible');
      setCoverPreview(currentUser.coverPhoto || '');
      setPhotoPreview(currentUser.profilePhoto || '');
      setCoverFile(null);
      setPhotoFile(null);
    }
    onClose();
  };

  // Helper renderers to avoid rendering objects directly
  const renderLearnTag = (tag) => {
    if (!tag) return null;
    if (typeof tag === 'object') return tag.name || tag.tag || '';
    return tag;
  };

  const renderTeachTag = (t) => {
    if (!t) return null;
    if (typeof t === 'object') return t.tag || t.name || '';
    return t;
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            data-testid="close-modal-button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Cover Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Photo
            </label>
            <div className="relative h-40 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
              {coverPreview && (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="text-white flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8" />
                  <span>Change Cover</span>
                </div>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Profile Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                    {name.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Change Photo
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              data-testid="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              data-testid="bio-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell others about yourself..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{500 - bio.length} characters remaining</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            {location && !showLocationSearch ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-900">📍 {location.areaLabel}</span>
                <button
                  type="button"
                  onClick={() => setShowLocationSearch(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <input
                  data-testid="location-input"
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Search for location..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {locationInput && (
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => selectLocation({
                        lat: 12.9716,
                        lng: 77.5946,
                        areaLabel: 'Koramangala, Bangalore'
                      })}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      📍 Koramangala, Bangalore
                    </button>
                    <button
                      type="button"
                      onClick={() => selectLocation({
                        lat: 12.9352,
                        lng: 77.6245,
                        areaLabel: 'Indiranagar, Bangalore'
                      })}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      📍 Indiranagar, Bangalore
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Skills to Teach */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills to Teach *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {teachTags.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                >
                  {renderTeachTag(skill)}
                  <button
                    type="button"
                    onClick={() => removeTeachSkill(renderTeachTag(skill))}
                    className="hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              data-testid="teach-input"
              type="text"
              value={teachInput}
              onChange={(e) => setTeachInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTeachSkill(teachInput);
                  setTeachInput('');
                }
              }}
              placeholder="Add skill and press Enter..."
              disabled={teachTags.length >= 10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Max 10 skills ({teachTags.length}/10)</p>
          </div>

          {/* Skills to Learn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills to Learn *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {learnTags.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm"
                >
                  {renderLearnTag(skill)}
                  <button
                    type="button"
                    onClick={() => removeLearnSkill(renderLearnTag(skill))}
                    className="hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              data-testid="learn-input"
              type="text"
              value={learnInput}
              onChange={(e) => setLearnInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLearnSkill(learnInput);
                  setLearnInput('');
                }
              }}
              placeholder="Add skill and press Enter..."
              disabled={learnTags.length >= 10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Max 10 skills ({learnTags.length}/10)</p>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Availability
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['morning', 'evening', 'weekend', 'flexible'].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    data-testid={`availability-${option}`}
                    type="radio"
                    name="availability"
                    value={option}
                    checked={availability === option}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              data-testid="save-button"
              type="submit"
              disabled={!canSave || isSaving}
              className="flex-1 px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
