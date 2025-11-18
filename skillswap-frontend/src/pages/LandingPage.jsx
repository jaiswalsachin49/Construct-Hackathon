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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-blue-600">SkillSwap</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/auth/login')}
                            >
                                Log In
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/auth/register')}
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="text-center">
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6">
                        Learn. Teach. Connect.
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join SkillSwap to discover people nearby who want to share skills,
                        learn together, and build meaningful real-life connections.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            variant="primary"
                            onClick={() => navigate('/auth/register')}
                        >
                            Get Started Free
                        </Button>
                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={() => navigate('/auth/login')}
                        >
                            Log In
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} shadow="lg" padding="lg">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                                    <feature.icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-blue-600 rounded-2xl p-12 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to start swapping skills?
                    </h2>
                    <p className="text-blue-100 mb-8 text-lg">
                        Join thousands of learners and teachers in your area.
                    </p>
                    <Button
                        size="lg"
                        variant="secondary"
                        onClick={() => navigate('/auth/register')}
                    >
                        Create Your Account
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-600">
                        © 2025 SkillSwap. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
