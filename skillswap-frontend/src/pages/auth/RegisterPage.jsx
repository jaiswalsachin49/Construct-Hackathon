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
    Zap,
} from 'lucide-react';
import Button from '../../components/common/Button';
import TagInput from '../../components/auth/TagInput';
import PasswordStrength from '../../components/auth/PasswordStrength';
import { useAuth } from '../../hooks/useAuth';

const POPULAR_SKILLS = [
    'Guitar','Piano','Cooking','Baking','Yoga','Fitness','Photography',
    'Videography','Drawing','Painting','Web Development','Mobile Development',
    'Design','UI/UX','Spanish','French','German','Japanese','Chinese','Writing',
    'Public Speaking','Marketing','Business','Dance','Singing','Acting','Comedy'
];

const RegisterPage = () => {
    const { register: registerUser, isLoading, error: authError } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep4()) return;

        await registerUser({ ...formData });
    };

    // ------------------------------ STEP COMPONENTS ------------------------------ //

    const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Your Account</h2>
            <p className="text-gray-600">Start by entering your details</p>
        </div>

        {/* Full Name */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-pink-600">*</span>
            </label>
            <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full h-12 pl-10 pr-3 text-base border rounded-lg 
                    focus:ring-2 focus:ring-pink-400 
                    ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="John Doe"
                />
            </div>
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-pink-600">*</span>
            </label>
            <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full h-12 pl-10 pr-3 text-base border rounded-lg 
                    focus:ring-2 focus:ring-pink-400 
                    ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="your.email@example.com"
                />
            </div>
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-pink-600">*</span>
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full h-12 pl-10 pr-10 text-base border rounded-lg 
                    focus:ring-2 focus:ring-pink-400 
                    ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="At least 8 characters"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            <PasswordStrength password={formData.password} />
        </div>

        {/* Confirm Password */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full h-12 pl-10 pr-3 text-base border rounded-lg 
                    focus:ring-2 focus:ring-pink-400 
                    ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Re-enter password"
                />
            </div>
            {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
        </div>
    </div>
);


    const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">What can you teach?</h2>
            <p className="text-gray-600">Add skills you can share with others</p>
        </div>

        <TagInput
            tags={formData.teachTags}
            setTags={(tags) => setFormData({ ...formData, teachTags: tags })}
            suggestions={POPULAR_SKILLS}
            placeholder="Type or select skills..."
            maxTags={10}
            theme='pink'
        />

        {errors.teachTags && <p className="text-sm text-red-600">{errors.teachTags}</p>}

        {/* Popular Skills */}
        <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Popular Skills:</p>
            <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.slice(0, 12).map((skill, index) => (
                    <button
                        key={index}
                        type="button"
                        className="px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 text-sm
                        hover:bg-pink-200 transition"
                        onClick={() =>
                            setFormData({
                                ...formData,
                                teachTags: [...new Set([...formData.teachTags, skill.toLowerCase()])],
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
        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">What do you want to learn?</h2>
            <p className="text-gray-600">Add skills you'd like to acquire</p>
        </div>

        <TagInput
            tags={formData.learnTags}
            setTags={(tags) => setFormData({ ...formData, learnTags: tags })}
            suggestions={POPULAR_SKILLS}
            placeholder="Type or select skills..."
            maxTags={10}
            theme='purple'
        />

        {errors.learnTags && <p className="text-sm text-red-600">{errors.learnTags}</p>}

        {formData.teachTags.length > 0 && (
            <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                    Suggested for you:
                </p>
                <div className="flex flex-wrap gap-2">
                    {POPULAR_SKILLS.slice(0, 8).map((skill, index) => (
                        <button
                            key={index}
                            type="button"
                            className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm hover:bg-purple-200 transition"
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
        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Almost there!</h2>
            <p className="text-gray-600">Just a few more details</p>
        </div>

        {/* LOCATION */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-pink-600">*</span>
            </label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                    name="location"
                    value={formData.location.areaLabel}
                    onChange={handleInputChange}
                    className={`w-full h-12 pl-10 pr-24 text-base border rounded-lg 
                    focus:ring-2 focus:ring-pink-400 
                    ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Koramangala, Bangalore"
                />
                <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="absolute right-3 top-3 text-xs text-pink-600 hover:text-pink-700"
                >
                    {detectingLocation ? 'Detecting…' : 'Use my location'}
                </button>
            </div>
            {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
        </div>

        {/* AVAILABILITY */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
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
                            className="text-pink-500 focus:ring-pink-400"
                        />
                        <span className="text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>

        {/* BIO */}
        <div>
            <label className="block text-sm font-medium text-gray-700">
                Bio <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-400 p-3 text-base"
                rows="4"
                maxLength={500}
                placeholder="Tell others about yourself..."
            />
            <p className="text-right text-sm text-gray-500">
                {formData.bio.length} / 500
            </p>
        </div>
    </div>
);


    // ------------------------------ MAIN LAYOUT ------------------------------ //

    return (
        <div className="min-h-screen flex items-center justify-center p-6
            bg-gradient-to-br from-orange-50 via-pink-50 to-rose-100 relative">

            {/* Violet Subtle Glow */}
            <div className="absolute right-20 bottom-20 w-72 h-72 bg-purple-300/40 blur-3xl rounded-full opacity-60"></div>

            {/* MAIN CARD */}
            <div className="w-full max-w-md relative z-10 
                bg-white/60 backdrop-blur-xl 
                shadow-2xl rounded-3xl p-8 border border-white/20">

                {/* Logo */}
                <div className="text-center mb-6">
                    <Link className="inline-flex items-center gap-3" to="/">
                        <div className="h-12 w-12 rounded-full bg-pink-500 flex items-center justify-center shadow-inner">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-3xl font-extrabold text-pink-600 tracking-tight">
                            SkillSwap
                        </span>
                    </Link>
                </div>

                {/* Heading */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Join SkillSwap</h1>
                    <p className="text-gray-600">Step {currentStep} of 4</p>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 justify-center mb-6">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`h-2 w-12 rounded-full transition-all ${
                                step <= currentStep ? 'bg-pink-500' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}

                    {/* Navigation */}
                    <div className="flex gap-3 mt-8">
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="ghostWarm"
                                onClick={handleBack}
                                className="flex-1"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" /> Back
                            </Button>
                        )}

                        {currentStep < 4 ? (
                            <Button
                                type="button"
                                variant="warm"
                                onClick={handleNext}
                                className="flex-1"
                            >
                                Next <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="warm"
                                isLoading={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? 'Creating Account…' : 'Create Account'}
                            </Button>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-gray-700">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="text-pink-600 font-semibold">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;