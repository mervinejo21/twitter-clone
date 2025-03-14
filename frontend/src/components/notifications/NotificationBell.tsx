'use client';

import React, { useEffect, useState, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/lib/api/notifications';

const NotificationBell: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchUnreadCount = async () => {
        if (!isAuthenticated) return;

        try {
            const data = await getUnreadCount();
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();

            // Poll for new notifications every 30 seconds
            intervalRef.current = setInterval(fetchUnreadCount, 30000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAuthenticated]);

    const handleClick = () => {
        router.push('/notifications');
    };

    if (!isAuthenticated) return null;

    return (
        <button
            onClick={handleClick}
            className="relative p-2 rounded-full hover:bg-gray-700 bg-gray-700 transition-colors duration-200"
            aria-label="Notifications"
        >
            <FaBell size={20} />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
};

export default NotificationBell; 