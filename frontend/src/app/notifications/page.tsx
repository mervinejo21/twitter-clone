'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markAllAsRead, markAsRead, Notification } from '@/lib/api/notifications';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { FaHeart, FaComment, FaRetweet, FaAt, FaUser, FaBell } from 'react-icons/fa';

export default function NotificationsPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [fetchingNotifications, setFetchingNotifications] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!isAuthenticated) return;

            try {
                const data = await getNotifications();
                setNotifications(data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setFetchingNotifications(false);
            }
        };

        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated]);

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    isRead: true,
                }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'LIKE':
                return <FaHeart className="text-red-500" />;
            case 'COMMENT':
                return <FaComment className="text-blue-500" />;
            case 'FOLLOW':
                return <FaUser className="text-purple-500" />;
            case 'RETWEET':
                return <FaRetweet className="text-green-500" />;
            case 'MENTION':
                return <FaAt className="text-blue-500" />;
            default:
                return <FaBell className="text-gray-500" />;
        }
    };

    const getNotificationLink = (notification: Notification) => {
        switch (notification.type) {
            case 'LIKE':
            case 'COMMENT':
            case 'RETWEET':
            case 'MENTION':
                return notification.tweetId ? `/tweets/${notification.tweetId}` : '#';
            case 'FOLLOW':
                return notification.targetId ? `/profile/${notification.target?.username}` : '#';
            default:
                return '#';
        }
    };

    if (isLoading || fetchingNotifications) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="p-4 border-b flex items-center justify-between">
                <h1 className="text-xl font-bold">Notifications</h1>
                {notifications.some((n) => !n.isRead) && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-blue-500 hover:underline text-sm"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="p-10 text-center">
                    <FaBell size={40} className="mx-auto bg-gray-700 text-gray-400 mb-4" />
                    <h2 className="text-xl font-bold mb-2">No notifications yet</h2>
                    <p className="text-gray-600">
                        When you get notifications, they'll show up here.
                    </p>
                </div>
            ) : (
                <ul>
                    {notifications.map((notification) => (
                        <li
                            key={notification.id}
                            className={`border-b ${!notification.isRead ? 'bg-blue-50' : ''
                                }`}
                            onClick={() => {
                                if (!notification.isRead) {
                                    handleMarkAsRead(notification.id);
                                }
                            }}
                        >
                            <Link href={getNotificationLink(notification)}>
                                <div className="p-4 hover:bg-gray-50 flex items-start">
                                    <div className="mr-3 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center mb-1">
                                            {notification.target && (
                                                <img
                                                    src={notification.target.profileImageUrl || 'https://via.placeholder.com/40'}
                                                    alt={notification.target.displayName || notification.target.username}
                                                    className="w-10 h-10 rounded-full mr-3"
                                                />
                                            )}
                                            <div>
                                                <p className="font-bold">
                                                    {notification.target?.displayName || notification.target?.username}
                                                </p>
                                                <p>{notification.content}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
} 