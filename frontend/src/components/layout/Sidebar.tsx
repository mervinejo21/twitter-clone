'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaBell, FaEnvelope, FaBookmark, FaList, FaUser, FaTwitter } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount } from '@/lib/api/messages';

const Sidebar = () => {
    const pathname = usePathname();
    const { user, logout, isAuthenticated } = useAuth();

    const navItems = [
        { icon: <FaHome size={24} />, label: 'Home', href: '/' },
        { icon: <FaSearch size={24} />, label: 'Explore', href: '/explore' },
        { icon: <FaBell size={24} />, label: 'Notifications', href: '/notifications' },
        { icon: <FaBookmark size={24} />, label: 'Bookmarks', href: '/bookmarks' },
        { icon: <FaList size={24} />, label: 'Lists', href: '/lists' },
        { icon: <FaUser size={24} />, label: 'Profile', href: `/profile/${user?.username}` },
    ];

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="h-screen sticky top-0 hidden md:flex flex-col justify-between p-4 w-64">
            <div>
                <div className="mb-6 p-2">
                    <Link href="/">
                        <FaTwitter size={30} className="text-blue-500" />
                    </Link>
                </div>

                <nav>
                    <ul className="space-y-3">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center p-3 rounded-full hover:bg-gray-800 transition-colors ${pathname === item.href ? 'font-bold' : ''
                                        }`}
                                >
                                    <span className="mr-4">{item.icon}</span>
                                    <span className="text-xl">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <button
                    className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full w-full"
                >
                    Tweet
                </button>
            </div>

            <div className="mb-4">
                <button
                    onClick={logout}
                    className="flex items-center p-3 rounded-full hover:bg-gray-200 transition-colors w-full"
                >
                    <span className="mr-2">
                        <img
                            src={user?.profileImageUrl || 'https://via.placeholder.com/40'}
                            alt={user?.displayName || user?.username}
                            className="w-10 h-10 rounded-full"
                        />
                    </span>
                    <div className="flex flex-col items-start">
                        <span className="font-bold">{user?.displayName || user?.username}</span>
                        <span className="text-gray-500">@{user?.username}</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Sidebar; 