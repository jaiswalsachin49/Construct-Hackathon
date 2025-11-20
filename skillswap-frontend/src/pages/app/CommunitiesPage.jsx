import React from 'react';
import { Users, Plus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const CommunitiesPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
                <Button variant="warm">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Community
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} padding="lg" shadow="normal">
                        <div className="text-center">
                            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Community {i}</h3>
                            <p className="text-sm text-gray-600 mb-2">San Francisco, CA</p>
                            <p className="text-sm text-gray-500 mb-4">128 members</p>
                            <Button variant="primary" size="sm" className="w-full">
                                Join Community
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default CommunitiesPage;
