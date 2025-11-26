import React, { useState, useEffect } from 'react';
import { Lock, UserX, Shield, Check } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { changePassword } from '../../services/authService';
import { getBlockedUsers, unblockUser } from '../../services/discoveryService';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [isLoadingBlocked, setIsLoadingBlocked] = useState(false);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (activeTab === 'blocked') {
            loadBlockedUsers();
        }
    }, [activeTab]);

    const loadBlockedUsers = async () => {
        setIsLoadingBlocked(true);
        try {
            const users = await getBlockedUsers();
            setBlockedUsers(users);
        } catch (error) {
            console.error('Failed to load blocked users:', error);
        } finally {
            setIsLoadingBlocked(false);
        }
    };

    const handleUnblock = async (userId) => {
        try {
            await unblockUser(userId);
            setBlockedUsers(prev => prev.filter(u => u._id !== userId));
        } catch (error) {
            console.error('Failed to unblock user:', error);
            alert('Failed to unblock user');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordStatus({ type: '', message: '' });

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }

        setIsSubmitting(true);
        try {
            await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordStatus({ type: 'success', message: 'Password updated successfully' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordStatus({
                type: 'error',
                message: error.response?.data?.error || 'Failed to update password'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-[#101726] rounded-xl border border-white/10 overflow-hidden">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'general'
                                ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-l-2 border-[#3B82F6]'
                                : 'text-[#8A90A2] hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Lock className="w-5 h-5" />
                            <span className="font-medium">Security</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('blocked')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'blocked'
                                ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-l-2 border-[#3B82F6]'
                                : 'text-[#8A90A2] hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <UserX className="w-5 h-5" />
                            <span className="font-medium">Blocked Users</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'general' && (
                        <Card className="bg-[#101726] border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[#3B82F6]" />
                                Change Password
                            </h2>

                            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-[#8A90A2] mb-1">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="w-full bg-[#0A0F1F] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#8A90A2] mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full bg-[#0A0F1F] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#8A90A2] mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full bg-[#0A0F1F] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none"
                                        required
                                    />
                                </div>

                                {passwordStatus.message && (
                                    <div className={`p-3 rounded-lg text-sm ${passwordStatus.type === 'success'
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                        {passwordStatus.message}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto"
                                    >
                                        {isSubmitting ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {activeTab === 'blocked' && (
                        <Card className="bg-[#101726] border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <UserX className="w-5 h-5 text-red-400" />
                                Blocked Users
                            </h2>

                            {isLoadingBlocked ? (
                                <div className="text-center py-8 text-[#8A90A2]">Loading...</div>
                            ) : blockedUsers.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-lg border border-white/5">
                                    <Shield className="w-12 h-12 text-[#8A90A2] mx-auto mb-3" />
                                    <p className="text-[#8A90A2]">You haven't blocked anyone yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {blockedUsers.map(user => (
                                        <div key={user._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.profilePhoto || 'https://via.placeholder.com/40'}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <h3 className="font-medium text-white">{user.name}</h3>
                                                    <p className="text-sm text-[#8A90A2] line-clamp-1">{user.bio || 'No bio'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUnblock(user._id)}
                                                className="px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-red-400/20"
                                            >
                                                Unblock
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
export default SettingsPage;