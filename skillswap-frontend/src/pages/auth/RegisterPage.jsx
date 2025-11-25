import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Button from '../../components/common/Button';
import TagInput from '../../components/auth/TagInput';
import PasswordStrength from '../../components/auth/PasswordStrength';
import { useAuth } from '../../hooks/useAuth';

const POPULAR_SKILLS = [
    'Guitar', 'Piano', 'Cooking', 'Baking', 'Yoga', 'Fitness', 'Photography',
    'Videography', 'Drawing', 'Painting', 'Web Development', 'Mobile Development',
    'Design', 'UI/UX', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Writing',
    'Public Speaking', 'Marketing', 'Business', 'Dance', 'Singing', 'Acting', 'Comedy'
];

import { searchPlaces } from '../../services/locationService';

const RegisterPage = () => {
    const { register: registerUser, isLoading, error: authError } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        teachTags: [],
        learnTags: [],
        location: { lat: null, lng: null, areaLabel: '' },
        availability: 'flexible',
        bio: '',
    });

    // ------------------------------ VALIDATION ------------------------------ //

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
        }

        if (formData.password.length < 8)
            newErrors.password = 'Password must be at least 8 characters';

        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        if (formData.teachTags.length === 0) {
            setErrors({ teachTags: 'Please add at least one skill' });
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (formData.learnTags.length === 0) {
            setErrors({ learnTags: 'Please add at least one skill' });
            return false;
        }
        return true;
    };

    const validateStep4 = () => {
        if (!formData.location.areaLabel.trim()) {
            setErrors({ location: 'Location is required' });
            return false;
        }
        return true;
    };

    // ------------------------------ STEP HANDLERS ------------------------------ //

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'location') {
            setFormData((prev) => ({
                ...prev,
                location: { ...prev.location, areaLabel: value },
            }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleNext = () => {
        const valid =
            (currentStep === 1 && validateStep1()) ||
            (currentStep === 2 && validateStep2()) ||
            (currentStep === 3 && validateStep3());

        if (valid) {
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
            setErrors({ location: 'Geolocation not supported' });
            return;
        }
        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setFormData((prev) => ({
                    ...prev,
                    location: {
                        lat: coords.latitude,
                        lng: coords.longitude,
                        areaLabel:
                            prev.location.areaLabel ||
                            `Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)}`,
                    },
                }));
                setDetectingLocation(false);
            },
            () => {
                setErrors({ location: 'Could not detect location' });
                setDetectingLocation(false);
            }
        );
    };

    // Location Search Handler
    const handleLocationSearch = async (query) => {
        if (query.length > 2) {
            const results = await searchPlaces(query);
            setLocationSuggestions(results);
        } else {
            setLocationSuggestions([]);
        }
    };

    const selectLocation = (place) => {
        setFormData(prev => ({
            ...prev,
            location: {
                lat: place.lat,
                lng: place.lng,
                areaLabel: place.display_name
            }
        }));
        setLocationSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep4()) return;

        await registerUser({ ...formData });
    };

    // ------------------------------ STEP COMPONENTS ------------------------------ //

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-white mb-1">Create Your Account</h2>
                <p className="text-[#8A90A2]">Start by entering your details</p>
            </div>

            {/* Full Name */}
            <div>
                <label className="block text-sm font-medium text-[#E6E9EF] mb-1">
                    Full Name <span className="text-[#60A5FA]">*</span>
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-[#8A90A2]" />
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full h-12 pl-10 pr-3 text-base rounded-lg 
                            bg-white/5 border
                            text-[#E6E9EF] placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-[#3B82F6]
                            ${errors.name ? 'border-red-500' : 'border-white/20'}
                        `}
                        placeholder="John Doe"
                    />
                </div>
                {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-[#E6E9EF] mb-1">
                    Email <span className="text-[#60A5FA]">*</span>
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#8A90A2]" />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full h-12 pl-10 pr-3 text-base rounded-lg 
                            bg-white/5 border
                            text-[#E6E9EF] placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-[#3B82F6]
                            ${errors.email ? 'border-red-500' : 'border-white/20'}
                        `}
                        placeholder="your.email@example.com"
                    />
                </div>
                {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
                <label className="block text-sm font-medium text-[#E6E9EF] mb-1">
                    Password <span className="text-[#60A5FA]">*</span>
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#8A90A2]" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full h-12 pl-10 pr-10 text-base rounded-lg 
                            bg-white/5 border
                            text-[#E6E9EF] placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-[#3B82F6]
                            ${errors.password ? 'border-red-500' : 'border-white/20'}
                        `}
                        placeholder="At least 8 characters"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-[#8A90A2] hover:text-white"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
                <PasswordStrength password={formData.password} />
            </div>

            {/* Confirm Password */}
            <div>
                <label className="block text-sm font-medium text-[#E6E9EF] mb-1">
                    Confirm Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#8A90A2]" />
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full h-12 pl-10 pr-3 text-base rounded-lg 
                            bg-white/5 border
                            text-[#E6E9EF] placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-[#3B82F6]
                            ${errors.confirmPassword ? 'border-red-500' : 'border-white/20'}
                        `}
                        placeholder="Re-enter password"
                    />
                </div>
                {errors.confirmPassword && (
                    <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-white">What can you teach?</h2>
                <p className="text-[#8A90A2]">Add skills you can share with others</p>
            </div>

            <TagInput
                tags={formData.teachTags}
                setTags={(tags) => setFormData({ ...formData, teachTags: tags })}
                suggestions={POPULAR_SKILLS}
                placeholder="Type or select skills..."
                maxTags={10}
                theme="blue"
            />

            {errors.teachTags && <p className="text-sm text-red-400">{errors.teachTags}</p>}

            {/* Popular Skills */}
            <div>
                <p className="text-sm font-medium text-[#E6E9EF] mb-3">Popular Skills:</p>
                <div className="flex flex-wrap gap-2">
                    {POPULAR_SKILLS.slice(0, 12).map((skill, index) => (
                        <button
                            key={index}
                            type="button"
                            className="
                                px-3 py-1.5 rounded-full text-sm font-medium
                                bg-gradient-to-r from-[#2563EB]/20 to-[#3B82F6]/20
                                text-[#E6E9EF]
                                border border-[#3B82F6]/30
                                backdrop-blur-sm
                                shadow-[0_2px_10px_rgba(37,99,235,0.25)]
                                hover:shadow-[0_4px_15px_rgba(37,99,235,0.45)]
                                hover:bg-gradient-to-r hover:from-[#2563EB]/30 hover:to-[#3B82F6]/30
                                transition
                            "
                            onClick={() =>
                                setFormData({
                                    ...formData,
                                    teachTags: [
                                        ...new Set([...formData.teachTags, skill.toLowerCase()])
                                    ],
                                })
                            }
                        >
                            {skill}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-white">What do you want to learn?</h2>
                <p className="text-[#8A90A2]">Add skills you'd like to acquire</p>
            </div>

            <TagInput
                tags={formData.learnTags}
                setTags={(tags) => setFormData({ ...formData, learnTags: tags })}
                suggestions={POPULAR_SKILLS}
                placeholder="Type or select skills..."
                maxTags={10}
                theme="purple"
            />

            {errors.learnTags && <p className="text-sm text-red-400">{errors.learnTags}</p>}

            {formData.teachTags.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-[#E6E9EF] mb-3">Suggested for you:</p>
                    <div className="flex flex-wrap gap-2">
                        {POPULAR_SKILLS.slice(0, 8).map((skill, index) => (
                            <button
                                key={index}
                                type="button"
                                className="
                                    px-4 py-1.5 rounded-full text-sm font-medium
                                    bg-[linear-gradient(135deg,rgba(37,99,235,0.25),rgba(59,130,246,0.18))]
                                    border border-[rgba(59,130,246,0.45)]
                                    text-[#E6E9EF]
                                    shadow-[0_2px_10px_rgba(59,130,246,0.35)]
                                    hover:shadow-[0_4px_18px_rgba(59,130,246,0.55)]
                                    transition
                                "
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        learnTags: [...new Set([...formData.learnTags, skill.toLowerCase()])],
                                    })
                                }
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
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center mb-2">
                <h2 className="text-2xl font-bold text-white">Almost there!</h2>
                <p className="text-[#8A90A2]">Just a few more details</p>
            </div>

            {/* Location */}
            <div className="relative">
                <label className="block text-sm font-medium text-[#E6E9EF] mb-1">
                    Location <span className="text-[#60A5FA]">*</span>
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-[#8A90A2]" /> {/* Replaced MapPin with User as per new lucide-react import */}
                    <input
                        name="location"
                        value={formData.location.areaLabel}
                        onChange={(e) => {
                            handleInputChange(e);
                            handleLocationSearch(e.target.value);
                        }}
                        className={`w-full h-12 pl-10 pr-24 text-base rounded-lg 
                            bg-white/5 border
                            text-[#E6E9EF] placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-[#3B82F6]
                            ${errors.location ? 'border-red-500' : 'border-white/20'}
                        `}
                        placeholder="Search city or area..."
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="absolute right-3 top-3 text-xs text-[#60A5FA] hover:text-[#3B82F6]"
                    >
                        {detectingLocation ? 'Detecting…' : 'Use my location'}
                    </button>
                </div>

                {/* Location Suggestions */}
                {locationSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-[#0A0F1F] border border-white/20 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {locationSuggestions.map((place) => (
                            <button
                                key={place.place_id}
                                type="button"
                                onClick={() => selectLocation(place)}
                                className="w-full px-4 py-3 text-left text-sm text-[#E6E9EF] hover:bg-white/10 border-b border-white/5 last:border-0 transition-colors"
                            >
                                {place.display_name}
                            </button>
                        ))}
                    </div>
                )}

                {errors.location && <p className="text-sm text-red-400 mt-1">{errors.location}</p>}
            </div>

            {/* Availability */}
            <div>
                <label className="block text-sm font-medium text-[#E6E9EF] mb-1">
                    Availability
                </label>
                <div className="space-y-2">
                    {[
                        { value: 'morning', label: 'Morning person' },
                        { value: 'evening', label: 'Evening person' },
                        { value: 'weekends', label: 'Weekends' },
                        { value: 'flexible', label: 'Flexible' },
                    ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="availability"
                                value={option.value}
                                checked={formData.availability === option.value}
                                onChange={handleInputChange}
                                className="text-[#60A5FA] focus:ring-[#3B82F6] bg-transparent border-gray-500"
                            />
                            <span className="text-[#E6E9EF]">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Bio */}
            <div>
                <label className="block text-sm font-medium text-[#E6E9EF]">
                    Bio <span className="text-[#8A90A2]">(Optional)</span>
                </label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-white/20 bg-white/5 text-[#E6E9EF]
                        focus:outline-none focus:ring-2 focus:ring-[#3B82F6] p-3 text-base
                        placeholder-gray-400"
                    rows="4"
                    maxLength={500}
                    placeholder="Tell others about yourself..."
                />
                <p className="text-right text-sm text-[#8A90A2]">
                    {formData.bio.length} / 500
                </p>
            </div>
        </div>
    );

    // ------------------------------ MAIN LAYOUT ------------------------------ //

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6
                bg-gradient-to-br from-[#020617] via-[#0F172A] to-[#020617]
                relative text-[#E6E9EF] overflow-hidden
            "
        >
            {/* Glow spots */}
            <div className="pointer-events-none absolute -top-32 -left-24 w-80 h-80 bg-[#3B82F6]/18 blur-3xl rounded-full" />
            <div className="pointer-events-none absolute bottom-[-60px] right-[-40px] w-96 h-96 bg-[#2563EB]/22 blur-3xl rounded-full" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_55%)]" />

            {/* MAIN CARD */}
            <div
                className="w-full max-w-md relative z-10
                    bg-white/[0.05] backdrop-blur-3xl
                    rounded-3xl p-6 lg:p-8
                    border border-white/10
                    shadow-[0_8px_32px_rgba(37,99,235,0.18),inset_0_1px_0_rgba(255,255,255,0.1)]
                "
            >
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link to="/" className="flex items-center justify-center gap-0 mb-8">
                        <div className="w-16 h-16 flex items-center justify-center">
                            <DotLottieReact
                                src="/logo_final.lottie"
                                loop
                                autoplay
                                className="w-full h-full"
                            />
                        </div>
                        <span className="text-3xl font-bold -skew-x-6 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent tracking-tight -ml-1">
                            killSwap
                        </span>
                    </Link>
                </div>

                {/* Heading */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Join SkillSwap</h1>
                    <p className="text-[#8A90A2]">Step {currentStep} of 4</p>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 justify-center mb-6">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`h-2 w-12 rounded-full transition-all ${step <= currentStep
                                ? 'bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA]'
                                : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>

                {/* Auth error (if any) */}
                {authError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 rounded-xl">
                        <p className="text-sm text-red-300">{authError}</p>
                    </div>
                )}

                {/* Form */}
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
                                variant="ghostWarm"
                                onClick={handleBack}
                                className="flex-1 border border-white/20 text-[#E6E9EF] hover:bg-white/5"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
                            </Button>
                        )}

                        {currentStep < 4 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="flex-1 py-3 text-white font-semibold rounded-xl
                                    bg-gradient-to-r from-[#2563EB] to-[#3B82F6]
                                    shadow-[0_4px_20px_rgba(37,99,235,0.4)]
                                    hover:shadow-[0_6px_30px_rgba(37,99,235,0.6)]
                                "
                            >
                                Next
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-3 text-white font-semibold rounded-xl
                                    bg-gradient-to-r from-[#2563EB] to-[#3B82F6]
                                    shadow-[0_4px_20px_rgba(37,99,235,0.4)]
                                    hover:shadow-[0_6px_30px_rgba(37,99,235,0.6)]
                                "
                            >
                                {isLoading ? 'Creating Account…' : 'Create Account'}
                            </Button>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-[#8A90A2]">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="text-[#60A5FA] font-semibold">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;