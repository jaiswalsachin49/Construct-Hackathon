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

            {/* LEFT — LOGIN PANEL */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16
                bg-gradient-to-br from-[#0A0F1F] via-[#101726] to-[#0A0F1F]">

                <div className="
                    w-full max-w-lg 
                    bg-white/10 backdrop-blur-2xl 
                    rounded-3xl p-10 
                    border border-white/20 
                    shadow-[0_0_25px_rgba(0,244,255,0.15)]
                    text-[#E6E9EF]
                ">

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2">
                            <div className="
                                h-12 w-12 rounded-full 
                                bg-gradient-to-r from-[#00F5A0] to-[#00C4FF]
                                flex items-center justify-center shadow-xl
                            ">
                                <Zap className="h-6 w-6 text-black" />
                            </div>
                            <span className="
                                text-2xl font-extrabold 
                                bg-gradient-to-r from-[#00F5A0] to-[#00C4FF]
                                bg-clip-text text-transparent
                            ">
                                SkillSwap
                            </span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-extrabold text-white">Welcome Back</h1>
                        <p className="text-[#8A90A2] mt-1">Log in to continue</p>
                    </div>

                    {/* Error Banner */}
                    {authError && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-xl">
                            <p className="text-sm text-red-400">{authError}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="text-sm font-medium text-[#E6E9EF] mb-1 block">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-[#8A90A2]" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`
                                        w-full pl-10 pr-3 py-3 rounded-xl
                                        bg-white/5 border
                                        text-[#E6E9EF]
                                        placeholder-gray-400
                                        focus:outline-none
                                        focus:ring-2 focus:ring-[#00C4FF]
                                        ${errors.email ? 'border-red-500' : 'border-white/20'}
                                    `}
                                    placeholder="your.email@example.com"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm font-medium text-[#E6E9EF] mb-1 block">
                                Password
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-[#8A90A2]" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className={`
                                        w-full pl-10 pr-12 py-3 rounded-xl
                                        bg-white/5 border
                                        text-[#E6E9EF]
                                        placeholder-gray-400
                                        focus:outline-none
                                        focus:ring-2 focus:ring-[#00C4FF]
                                        ${errors.password ? 'border-red-500' : 'border-white/20'}
                                    `}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-[#8A90A2] hover:text-white"
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between text-[#E6E9EF]">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="accent-[#00F5A0]"
                                />
                                Remember me
                            </label>

                            <Link
                                to="/auth/forgot-password"
                                className="text-[#00C4FF] text-sm hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button — Neon CTA */}
                        <Button
                            type="submit"
                            className="
                                w-full py-3 text-black font-semibold rounded-xl
                                bg-gradient-to-r from-[#00F5A0] to-[#00C4FF]
                                shadow-[0_0_15px_rgba(0,244,255,0.4)]
                                hover:shadow-[0_0_25px_rgba(0,244,255,0.6)]
                            "
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in…' : 'Log In'}
                        </Button>
                    </form>

                    {/* Sign Up */}
                    <p className="text-center text-[#8A90A2] mt-6">
                        Don’t have an account?{' '}
                        <Link to="/auth/register" className="text-[#00F5A0] font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* RIGHT — HERO PANEL */}
            <div className="hidden lg:flex w-1/2 justify-center items-center p-16 
                bg-gradient-to-br from-[#101726] via-[#0A0F1F] to-[#101726]
                text-white relative">

                {/* Glow */}
                <div className="absolute right-20 top-20 w-80 h-80 bg-[#00C4FF]/30 blur-3xl rounded-full"></div>

                {/* Glass Card */}
                <div className="
                    bg-white/10 backdrop-blur-2xl
                    border border-white/20
                    rounded-3xl p-10 shadow-2xl max-w-xl
                ">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#7A3EF9] to-[#00C4FF] flex items-center justify-center mb-6 shadow-xl">
                        <Zap className="h-7 w-7 text-black" />
                    </div>

                    <h2 className="text-4xl font-extrabold mb-4">Connect. Learn. Grow.</h2>

                    <p className="text-[#E6E9EF]/80 text-lg mb-8">
                        Meet people, exchange skills, and create meaningful friendships.
                    </p>

                    <div className="border-l-4 border-[#00C4FF]/40 pl-4">
                        <p className="italic text-[#E6E9EF] mb-2">
                            “SkillSwap helped me learn guitar and teach coding.
                            Best experience ever!”
                        </p>
                        <p className="text-[#8A90A2] text-sm">— Sarah K.</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LoginPage;