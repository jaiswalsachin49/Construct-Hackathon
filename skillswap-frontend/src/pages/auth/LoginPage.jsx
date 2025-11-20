import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const LoginPage = () => {
    const { login, isLoading, error: authError } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setFocus,
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        setFocus('email');
    }, [setFocus]);

    const onSubmit = async (data) => {
        await login(data.email, data.password);
    };

    return (
        <div className="min-h-screen flex">

            {/* LEFT SIDE — LOGIN FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16 bg-gradient-to-br from-orange-50 via-pink-50 to-rose-100">
                <div className="w-full max-w-lg bg-white/70 backdrop-blur-xl shadow-2xl p-10 rounded-3xl border border-pink-100">

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center shadow">
                                <Zap className="h-6 w-6 text-pink-600" />
                            </div>
                            <span className="text-2xl font-extrabold text-pink-600 tracking-tight">SkillSwap</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back!</h1>
                        <p className="text-gray-700 mt-1">Log in to continue to SkillSwap</p>
                    </div>

                    {/* Error Banner */}
                    {authError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow">
                            <p className="text-sm text-red-600">{authError}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`
                                        w-full pl-10 pr-3 py-3 rounded-xl border
                                        bg-white shadow-sm
                                        focus:outline-none focus:ring-2 focus:ring-pink-300
                                        ${errors.email ? 'border-red-500' : 'border-pink-200'}
                                    `}
                                    placeholder="your.email@example.com"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className={`
                                        w-full pl-10 pr-12 py-3 rounded-xl border
                                        bg-white shadow-sm
                                        focus:outline-none focus:ring-2 focus:ring-pink-300
                                        ${errors.password ? 'border-red-500' : 'border-pink-200'}
                                    `}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember Me + Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="accent-pink-500 rounded"
                                />
                                Remember me
                            </label>
                            <Link to="/auth/forgot-password" className="text-pink-600 text-sm hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="warm"
                            className="w-full rounded-xl py-3"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in…' : 'Log In'}
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="text-center text-gray-700 mt-6">
                        Don’t have an account?{' '}
                        <Link to="/auth/register" className="text-pink-600 font-semibold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE — HERO PANEL */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-pink-400 via-orange-300 to-purple-500 items-center justify-center p-16 relative text-white">

                {/* Ambient Glow */}
                <div className="absolute right-20 top-20 w-72 h-72 bg-purple-300/40 blur-3xl rounded-full opacity-70"></div>

                {/* GLASS CARD */}
                <div className="
                    relative z-10 max-w-xl w-full 
                    bg-white/20 backdrop-blur-2xl 
                    rounded-3xl p-10 shadow-2xl
                    border border-white/30
                    text-white
                ">
                    {/* Icon */}
                    <div className="h-14 w-14 rounded-full bg-white/30 backdrop-blur flex items-center justify-center mb-6 shadow-inner">
                        <Zap className="h-7 w-7 text-white" />
                    </div>

                    {/* Title */}
                    <h2 className="text-4xl font-extrabold leading-tight mb-4">
                        Connect. Learn. Grow.
                    </h2>

                    {/* Subtitle */}
                    <p className="text-white/90 text-lg leading-relaxed mb-8">
                        Join thousands of learners and teachers sharing skills and
                        building meaningful friendships.
                    </p>

                    {/* Quote */}
                    <div className="border-l-4 border-white/40 pl-4">
                        <p className="italic text-white/95 text-base mb-2">
                            “SkillSwap changed my life. I learned guitar and taught
                            coding. Made amazing friends along the way!”
                        </p>
                        <p className="text-white/70 text-sm">— Sarah K., San Francisco</p>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default LoginPage;