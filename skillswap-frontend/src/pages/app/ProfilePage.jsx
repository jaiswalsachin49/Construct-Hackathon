import React from 'react';
import { Edit, MapPin, Star, Award } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/authStore';

const ProfilePage = () => {
    const { user } = useAuthStore();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card padding="lg" shadow="normal">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl text-pink-600 font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.name || 'User'}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600">
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>San Francisco, CA</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current text-yellow-500" />
                                <span>4.9</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Award className="h-4 w-4" />
                                <span>5 Skills</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="primary">
                        <Edit className="h-5 w-5 mr-2" />
                        Edit Profile
                    </Button>
                </div>
            </Card>

            {/* Bio */}
            <Card padding="lg" shadow="normal">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About Me</h2>
                <p className="text-gray-700">
                    Passionate about learning and teaching. Love connecting with people and sharing knowledge.
                    Always eager to explore new skills and help others grow.
                </p>
            </Card>

            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card padding="lg" shadow="normal">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Can Teach</h2>
                    <div className="flex flex-wrap gap-2">
                        {['Guitar', 'Cooking', 'Spanish', 'Web Development'].map((skill, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </Card>

                <Card padding="lg" shadow="normal">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Wants to Learn</h2>
                    <div className="flex flex-wrap gap-2">
                        {['Photography', 'Yoga', 'Public Speaking'].map((interest, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Stats */}
            <Card padding="lg" shadow="normal">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-pink-600">15</p>
                        <p className="text-sm text-gray-600">Connections</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">8</p>
                        <p className="text-sm text-gray-600">Skills Taught</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">5</p>
                        <p className="text-sm text-gray-600">Skills Learned</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-orange-600">3</p>
                        <p className="text-sm text-gray-600">Badges</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ProfilePage;
