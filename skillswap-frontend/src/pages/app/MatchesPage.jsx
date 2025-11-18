import React from 'react';
import { Users, MessageCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const MatchesPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} padding="lg" shadow="normal">
                        <div className="text-center">
                            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <Users className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Match {i}</h3>
                            <p className="text-sm text-gray-600 mb-4">90% compatibility</p>
                            <Button variant="primary" size="sm" className="w-full">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Send Message
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MatchesPage;
