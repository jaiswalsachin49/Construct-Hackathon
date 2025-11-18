import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    User,
    Mail,
    Lock,
    MapPin,
    Zap
} from 'lucide-react';
import Button from '../../components/common/Button';
import TagInput from '../../components/auth/TagInput';
import PasswordStrength from '../../components/auth/PasswordStrength';
import { useAuth } from '../../hooks/useAuth';

const POPULAR_SKILLS = [
    'Guitar', 'Piano', 'Cooking', 'Baking', 'Yoga', 'Fitness',
    'Photography', 'Videography', 'Drawing', 'Painting',
    'Web Development', 'Mobile Development', 'Design', 'UI/UX',
    'Spanish', 'French', 'German', 'Japanese', 'Chinese',
    'Writing', 'Public Speaking', 'Marketing', 'Business',
    'Dance', 'Singing', 'Acting', 'Comedy',
];

const RegisterPage = () => {
    const { register: registerUser, isLoading, error: authError } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [detectingLocation, setDetectingLocation] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Step 2
        teachTags: [],
        // Step 3
        learnTags: [],
        // Step 4
        location: {
            lat: null,
            lng: null,
            areaLabel: '',
        },
        availability: 'flexible',
        bio: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // special handling for nested location.areaLabel
        if (name === 'location') {
            setFormData((prev) => ({
                ...prev,
                location: {
                    ...prev.location,
                    areaLabel: value,
                },
            }));
            if (errors.location) {
                setErrors((prev) => ({ ...prev, location: '' }));
            }
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
            newErrors.name = 'Name must be between 2 and 50 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (formData.teachTags.length === 0) {
            newErrors.teachTags = 'Please add at least one skill you can teach';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (formData.learnTags.length === 0) {
            newErrors.learnTags = 'Please add at least one skill you want to learn';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep4 = () => {
        const newErrors = {};
        if (!formData.location.areaLabel.trim()) {
            newErrors.location = 'Location is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = false;

        if (currentStep === 1) isValid = validateStep1();
        else if (currentStep === 2) isValid = validateStep2();
        else if (currentStep === 3) isValid = validateStep3();

        if (isValid) {
            setCurrentStep((prev) => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
        setErrors({});
        window.scrollTo(0, 0);
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setErrors((prev) => ({
                ...prev,
                location: 'Geolocation is not supported by your browser',
            }));
            return;
        }

        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData((prev) => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        lat: latitude,
                        lng: longitude,
                        // keep whatever user typed, or set a basic label
                        areaLabel:
                            prev.location.areaLabel ||
                            `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
                    },
                }));
                setErrors((prev) => ({ ...prev, location: '' }));
                setDetectingLocation(false);
            },
            (error) => {
                console.error(error);
                setErrors((prev) => ({
                    ...prev,
                    location: 'Could not detect location. Please enter it manually.',
                }));
                setDetectingLocation(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep4()) return;

        const registrationData = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            teachTags: formData.teachTags,
            learnTags: formData.learnTags,
            // send location in structured form to match schema
            location: {
                lat: formData.location.lat,
                lng: formData.location.lng,
                areaLabel: formData.location.areaLabel.trim(),
            },
            availability: formData.availability,
            bio: formData.bio.trim(),
        };

        await registerUser(registrationData);
    };

    const renderStep1 = () => (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                <p className="text-gray-600">Let's start with your basic information</p>
            </div>

            {/* Full Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                    />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="your.email@example.com"
                    />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="At least 8 characters"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                <PasswordStrength password={formData.password} />
            </div>

            {/* Confirm Password */}
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Re-enter your password"
                    />
                </div>
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What can you teach?</h2>
                <p className="text-gray-600">Add skills you can share with others</p>
            </div>

            <TagInput
                tags={formData.teachTags}
                setTags={(tags) => setFormData((prev) => ({ ...prev, teachTags: tags }))}
                suggestions={POPULAR_SKILLS}
                placeholder="Type or select skills..."
                maxTags={10}
            />

            {errors.teachTags && <p className="text-sm text-red-600">{errors.teachTags}</p>}

            {/* Popular Skills */}
            <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Popular Skills:</p>
                <div className="flex flex-wrap gap-2">
                    {POPULAR_SKILLS
                        .filter((skill) => !formData.teachTags.includes(skill.toLowerCase()))
                        .slice(0, 12)
                        .map((skill, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    if (formData.teachTags.length < 10) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            teachTags: [...prev.teachTags, skill.toLowerCase()],
                                        }));
                                    }
                                }}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            >
                                {skill}
                            </button>
                        ))}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What do you want to learn?</h2>
                <p className="text-gray-600">Add skills you'd like to acquire</p>
            </div>

            <TagInput
                tags={formData.learnTags}
                setTags={(tags) => setFormData((prev) => ({ ...prev, learnTags: tags }))}
                suggestions={POPULAR_SKILLS}
                placeholder="Type or select skills..."
                maxTags={10}
            />

            {errors.learnTags && <p className="text-sm text-red-600">{errors.learnTags}</p>}

            {/* Suggestions based on teach skills */}
            {formData.teachTags.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                        Suggestions based on your skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {POPULAR_SKILLS.filter(
                            (skill) =>
                                !formData.learnTags.includes(skill.toLowerCase()) &&
                                !formData.teachTags.includes(skill.toLowerCase())
                        )
                            .slice(0, 8)
                            .map((skill, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                        if (formData.learnTags.length < 10) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                learnTags: [...prev.learnTags, skill.toLowerCase()],
                                            }));
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-green-100 hover:text-green-700 transition-colors"
                                >
                                    {skill}
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost there!</h2>
            <p className="text-gray-600">Just a few more details</p>
            </div>

            {/* Location */}
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location.areaLabel}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-24 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Koramangala, Bangalore"
                    />
                    <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detectingLocation}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-blue-600 hover:text-blue-800 disabled:opacity-60"
                    >
                        {detectingLocation ? 'Detecting…' : 'Use my location'}
                    </button>
                </div>
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                {formData.location.lat && formData.location.lng && (
                    <p className="mt-1 text-xs text-gray-500">
                        Detected: lat {formData.location.lat.toFixed(4)}, lng{' '}
                        {formData.location.lng.toFixed(4)}
                    </p>
                )}
            </div>

            {/* Availability */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Availability
                </label>
                <div className="space-y-2">
                    {[
                        { value: 'morning', label: 'Morning person' },
                        { value: 'evening', label: 'Evening person' },
                        { value: 'weekends', label: 'Weekends' },
                        { value: 'flexible', label: 'Flexible' },
                    ].map((option) => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="availability"
                                value={option.value}
                                checked={formData.availability === option.value}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-700">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Bio */}
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    maxLength={500}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell others about yourself, your interests, and what you'd like to learn or teach..."
                />
                <p className="mt-1 text-sm text-gray-500 text-right">
                    {formData.bio.length} / 500
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">SkillSwap</span>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Join SkillSwap</h1>
                        <p className="text-gray-600">Step {currentStep} of 4</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center mb-8 gap-2">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`h-2 w-12 rounded-full transition-all duration-300 ${
                                    step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Error Banner */}
                    {authError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{authError}</p>
                        </div>
                    )}

                    {/* Form Steps */}
                    <form onSubmit={handleSubmit}>
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}

                        {/* Navigation Buttons */}
                        <div className="flex gap-3 mt-8">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleBack}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    <ArrowLeft className="h-5 w-5 mr-2" />
                                    Back
                                </Button>
                            )}

                            {currentStep < 4 ? (
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleNext}
                                    className="flex-1"
                                >
                                    Next
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link
                                to="/auth/login"
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>

                    {currentStep === 1 && (
                        <div className="mt-4 text-center">
                            <Link to="/" className="text-sm text-gray-500 hover:underline">
                                Back to home
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
