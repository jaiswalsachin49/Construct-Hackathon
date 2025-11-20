import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Zap, Shield, Heart } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-rose-100">
            {/* Navigation */}
            <nav className="backdrop-blur-lg bg-white/80 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight">
                            SkillSwap
                        </h1>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghostWarm"
                                onClick={() => navigate('/auth/login')}
                            >
                                Log In
                            </Button>
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
                <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6">
                    Learn. Teach. <span className=" font-extrabold text-pink-600 tracking-tight">Connect.</span>
                </h1>

                <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
                    Join SkillSwap to discover people nearby who want to share skills,
                    learn together, and build meaningful real-life connections.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
                    <Button size="lg" variant="warm" onClick={() => navigate('/auth/register')}>
                        Get Started Free
                    </Button>
                    <Button size="lg" variant="ghostWarm" onClick={() => navigate('/auth/login')}>
                        Log In
                    </Button>
                </div>

                {/* Zig-Zag Double Strip of Skills */}
                <section className="overflow-hidden py-10 space-y-4">

                    {/* Strip 2 (slightly offset + faster speed) */}
                    <div className="flex whitespace-nowrap animate-scroll-fast gap-6 px-4 ">
                        {skills.concat(skills).map((skill, index) => (
                            <div
                                key={`s2-${index}`}
                                className={`
                                    px-5 py-2 bg-white shadow rounded-full text-sm font-medium text-gray-700 
                                    inline-block transition-transform duration-200 hover:scale-105 h-[50%]
                                    ${index % 2 === 0 ? '-mt-2' : 'mt-2'}
                                `}
                            >
                                {skill}
                            </div>
                        ))}
                    </div>

                </section>


            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 ">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            shadow="xl"
                            padding="none"
                            className="rounded-2xl bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 border border-gray-100"
                        >
                            <div className="text-center space-y-3">

                                {/* Icon area */}
                                <div className="mx-auto h-14 w-14 rounded-full bg-pink-100 flex items-center justify-center shadow-md">
                                    <feature.icon className="h-6 w-6 text-pink-600" />
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {feature.title}
                                </h3>

                                {/* Divider line */}
                                <div className="mx-auto w-10 h-[2px] bg-pink-300 rounded-full opacity-60"></div>

                                {/* Description */}
                                <p className="text-gray-600 text-sm leading-relaxed px-2">
                                    {feature.description}
                                </p>

                            </div>
                        </Card>

                    ))}
                </div>
            </section>

            {/* Why SkillSwap */}
            <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Why <span className=" font-extrabold text-pink-600 tracking-tight">SkillSwap</span>?
                    </h2>
                    <p className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed">
                        People today feel more disconnected than ever. SkillSwap helps bring people
                        together by sharing what they love, learning with others, and building genuine friendships.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
                <div className="bg-gradient-to-r from-pink-400 to-orange-300 rounded-3xl p-14 text-center shadow-xl">
                    <h2 className="text-4xl font-extrabold text-white mb-4">
                        Ready to find your people?
                    </h2>
                    <p className="text-white/90 text-lg mb-8">
                        Join learners, creators, teachers, and local communities near you.
                    </p>
                    <Button size="lg" variant="warmAlt" onClick={() => navigate('/auth/register')}>
                        Create Your Account
                    </Button>
                </div>
            </section>

            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <p className="text-center text-gray-600">
                        ©️ 2025 SkillSwap. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;