import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Button from '../../components/common/Button';
import axios from 'axios';
import toast from 'react-hot-toast';

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // If no email passed, maybe redirect to login or ask user to type it?
            // For now, let's keep it empty and allow typing if we want, or redirect.
            // navigate('/auth/login');
        }
    }, [location.state, navigate]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = [...code];
        pastedData.split('').forEach((char, index) => {
            if (index < 6) newCode[index] = char;
        });
        setCode(newCode);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verifyCode = code.join('');
        if (verifyCode.length !== 6) {
            toast.error('Please enter the complete 6-digit code');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-email`, {
                email,
                code: verifyCode
            });
            toast.success('Email verified successfully! Please login.');
            navigate('/auth/login');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setResendLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/resend-verification`, {
                email
            });
            toast.success('Verification code sent!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to resend code');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#020617] via-[#0F172A] to-[#020617] relative text-[#E6E9EF] overflow-hidden">
            {/* Glow spots */}
            <div className="pointer-events-none absolute -top-32 -left-24 w-80 h-80 bg-[#3B82F6]/18 blur-3xl rounded-full" />
            <div className="pointer-events-none absolute bottom-[-60px] right-[-40px] w-96 h-96 bg-[#2563EB]/22 blur-3xl rounded-full" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_55%)]" />

            {/* MAIN CARD */}
            <div className="w-full max-w-md relative z-10 bg-white/[0.05] backdrop-blur-3xl rounded-3xl p-6 lg:p-8 border border-white/10 shadow-[0_8px_32px_rgba(37,99,235,0.18),inset_0_1px_0_rgba(255,255,255,0.1)]">

                {/* Logo Area */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-white/5 rounded-full ring-1 ring-white/20">
                        <Mail className="w-8 h-8 text-[#60A5FA]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
                    <p className="text-[#8A90A2]">
                        We sent a verification code to <br />
                        <span className="text-white font-medium">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between gap-2 mb-8">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                            />
                        ))}
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 text-white font-semibold rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_30px_rgba(37,99,235,0.6)] mb-4"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify Email'}
                    </Button>

                    <div className="text-center">
                        <p className="text-sm text-[#8A90A2] mb-2">Didn't receive the code?</p>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading}
                            className="text-[#60A5FA] hover:text-[#93C5FD] font-medium text-sm transition-colors disabled:opacity-50"
                        >
                            {resendLoading ? 'Sending...' : 'Click to resend'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
