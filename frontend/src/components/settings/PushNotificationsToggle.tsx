'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    isPushNotificationSupported,
    requestNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
} from '@/lib/push-notifications';

export default function PushNotificationsToggle() {
    const { isAuthenticated } = useAuth();
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const init = async () => {
            const supported = isPushNotificationSupported();
            setIsSupported(supported);

            if (supported) {
                setPermission(Notification.permission);

                // Check if already subscribed
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                        const subscription = await registration.pushManager.getSubscription();
                        setIsSubscribed(!!subscription);
                    }
                }
            } else {
                setPermission('unsupported');
            }
        };

        if (isAuthenticated) {
            init();
        }
    }, [isAuthenticated]);

    const handleToggle = async () => {
        if (!isSupported || !isAuthenticated) return;

        setIsLoading(true);
        try {
            if (!isSubscribed) {
                // Request permission if not granted
                if (permission !== 'granted') {
                    const newPermission = await requestNotificationPermission();
                    setPermission(newPermission);
                    if (newPermission !== 'granted') {
                        return;
                    }
                }

                // Subscribe
                const success = await subscribeToPushNotifications();
                setIsSubscribed(success);
            } else {
                // Unsubscribe
                const success = await unsubscribeFromPushNotifications();
                setIsSubscribed(!success);
            }
        } catch (error) {
            console.error('Error toggling push notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleNotifications = () => {
        setEnabled(!enabled);
        handleToggle();
    };

    if (!isAuthenticated || !isSupported) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold">Push Notifications</h2>

            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Enable push notifications</p>
                    <p className="text-sm text-gray-500">Receive notifications about new tweets, likes and replies</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={enabled}
                        onChange={toggleNotifications}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
            </div>

            <div className="border-t pt-4 mt-2">
                <h3 className="font-medium mb-2">Notification types</h3>

                <div className="space-y-3">
                    {[
                        { id: 'likes', label: 'Likes' },
                        { id: 'replies', label: 'Replies' },
                        { id: 'retweets', label: 'Retweets' },
                        { id: 'mentions', label: 'Mentions' },
                        { id: 'new-followers', label: 'New followers' }
                    ].map(item => (
                        <div key={item.id} className="flex items-center">
                            <input
                                id={item.id}
                                type="checkbox"
                                disabled={!enabled}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <label htmlFor={item.id} className={`ml-2 ${!enabled ? 'text-gray-400' : ''}`}>
                                {item.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 