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
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">SkillSwap</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                        <p className="text-gray-600">Log in to continue to SkillSwap</p>
                    </div>

                    {/* Error Banner */}
                    {authError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{authError}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                                    {...register('email')}
                                    type="email"
                                    id="email"
                                    disabled={isLoading}
                                    className={`
                    block w-full pl-10 pr-3 py-2.5 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${errors.email ? 'border-red-500' : 'border-gray-300'}
                  `}
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
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
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    disabled={isLoading}
                                    className={`
                    block w-full pl-10 pr-10 py-2.5 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${errors.password ? 'border-red-500' : 'border-gray-300'}
                  `}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link
                                to="/auth/forgot-password"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </Button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/auth/register" className="text-blue-600 font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Hero Section (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12">
                <div className="max-w-md text-white">
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mb-4">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-6">
                        Connect. Learn. Grow.
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of learners and teachers sharing skills and building meaningful connections.
                    </p>
                    <div className="border-l-4 border-white/30 pl-4">
                        <p className="text-lg italic mb-2">
                            "SkillSwap changed my life. I learned guitar and taught coding. Made amazing friends along the way!"
                        </p>
                        <p className="text-sm text-blue-200">— Sarah K., San Francisco</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
