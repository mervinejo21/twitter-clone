'use client';

import React from 'react';
import SettingsLayout from '@/components/layout/SettingsLayout';
import PushNotificationsToggle from '@/components/settings/PushNotificationsToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotificationSettingsPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <SettingsLayout>
            <div>
                <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
                <PushNotificationsToggle />

                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Email Notifications</h2>
                    <div className="space-y-4">
                        {[
                            { id: 'email-new-follower', label: 'New followers' },
                            { id: 'email-direct-messages', label: 'Direct messages' },
                            { id: 'email-announcements', label: 'Twitter announcements and updates' }
                        ].map(item => (
                            <div key={item.id} className="flex items-center">
                                <input
                                    id={item.id}
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <label htmlFor={item.id} className="ml-2">
                                    {item.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
} 