import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Zap, Shield, Heart } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Users,
            title: 'Connect Locally',
            description: 'Find people near you who share your interests and want to learn what you can teach.',
        },
        {
            icon: Zap,
            title: 'Skill Exchange',
            description: 'Trade skills and knowledge. Teach what you know, learn what you want.',
        },
        {
            icon: Shield,
            title: 'Safe Meetups',
            description: 'Built-in safety features and community reporting to ensure secure connections.',
        },
        {
            icon: Heart,
            title: 'Build Community',
            description: 'Join local communities, share stories, and create lasting friendships.',
        },
    ];

    const skills = [
        "Photography", "Guitar", "Coding", "Yoga", "Cooking",
        "Painting", "Running", "Dancing", "Fitness Training",
        "Language Exchange", "Public Speaking", "Meditation"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#101726] to-[#0A0F1F] text-[#E6E9EF]">

            {/* Navigation */}
            <nav className="backdrop-blur-lg bg-white/5 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        <div className="flex items-center gap-0">
                            <div className="w-16 h-16 flex items-center justify-center">
                                <DotLottieReact
                                    src="/logo_final.lottie"
                                    loop
                                    autoplay
                                    className="w-full h-full"
                                />
                            </div>
                            <span className="text-3xl font-extrabold -skew-x-6 tracking-tight bg-gradient-to-r from-[#00F5A0] to-[#00C4FF] bg-clip-text text-transparent -ml-1">
                                killSwap
                            </span>
                        </div>

                        <div className="flex items-center gap-4">

                            {/* Uses ghostWarm variant */}
                            <Button
                                variant="ghostWarm"
                                onClick={() => navigate('/auth/login')}
                            >
                                Log In
                            </Button>

                            {/* Uses warm variant */}
                            <Button
                                variant="warm"
                                onClick={() => navigate('/auth/register')}
                            >
                                Get Started
                            </Button>

                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center">

                <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 text-white">
                    Learn. Teach.{' '}
                    <span className="bg-gradient-to-r from-[#00C4FF] to-[#7A3EF9] bg-clip-text text-transparent">
                        Connect.
                    </span>
                </h1>

                <p className="text-xl text-[#8A90A2] max-w-2xl mx-auto mb-12">
                    Discover people nearby who want to share skills, learn together,
                    and build meaningful real-life connections.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">

                    {/* Primary CTA */}
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => navigate('/auth/register')}
                    >
                        Get Started Free
                    </Button>

                    {/* Outline neon CTA */}
                    <Button
                        size="lg"
                        variant="ghostWarm"
                        onClick={() => navigate('/auth/login')}
                    >
                        Log In
                    </Button>

                </div>

                {/* Skill Scroller */}
                <section className="overflow-hidden py-10 space-y-4">
                    <div className="flex whitespace-nowrap animate-scroll-fast gap-6 px-4">
                        {skills.concat(skills).map((skill, index) => (
                            <div
                                key={index}
                                className={`
                                    px-5 py-2 
                                    bg-white/10 
                                    backdrop-blur-lg
                                    border border-white/20
                                    shadow 
                                    rounded-full 
                                    text-sm 
                                    inline-block 
                                    text-[#E6E9EF]
                                    hover:scale-105 transition
                                    h-[50%]
                                    ${index % 2 === 0 ? '-mt-2' : 'mt-2'}
                                `}
                            >
                                {skill}
                            </div>
                        ))}
                    </div>
                </section>

            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 hover:bg-white/10 transition"
                        >
                            <div className="text-center space-y-4">

                                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-[#00C4FF] to-[#7A3EF9] flex items-center justify-center shadow-lg">
                                    <feature.icon className="h-8 w-8 text-white" />
                                </div>

                                <h3 className="text-xl font-semibold text-white">
                                    {feature.title}
                                </h3>

                                <p className="text-[#8A90A2] text-sm leading-relaxed">
                                    {feature.description}
                                </p>

                            </div>
                        </Card>
                    ))}

                </div>
            </section>

            {/* Why Section */}
            <section className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-12 text-center">
                    <h2 className="text-4xl font-semibold text-white mb-6">
                        Why{' '}
                        <span className="bg-gradient-to-r from-[#00F5A0] to-[#00C4FF] bg-clip-text text-transparent">
                            SkillSwap
                        </span>
                        ?
                    </h2>

                    <p className="text-[#8A90A2] max-w-3xl mx-auto text-lg leading-relaxed">
                        People today feel more disconnected than ever. SkillSwap helps bring
                        people together by sharing what they love and building genuine relationships.
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
                <div className="rounded-3xl p-14 text-center shadow-2xl 
                    bg-gradient-to-r from-[#7A3EF9] via-[#00C4FF] to-[#00F5A0]">

                    <h2 className="text-4xl font-extrabold text-black mb-6">
                        Ready to find your people?
                    </h2>

                    <p className="text-black/80 text-lg mb-8">
                        Join creators, learners and local communities near you.
                    </p>

                    {/* Neon glass button */}
                    <Button
                        size="lg"
                        variant="warmAlt"
                        onClick={() => navigate('/auth/register')}
                    >
                        Create Your Account
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8">
                <p className="text-center text-[#8A90A2]">
                    ©️ 2025 SkillSwap — All Rights Reserved.
                </p>
            </footer>

        </div>
    );
};

export default LandingPage;