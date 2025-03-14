'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaBell, FaUser } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

const MobileNav = () => {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) return null;

    const navItems = [
        { icon: <FaHome size={20} />, label: 'Home', href: '/' },
        { icon: <FaSearch size={20} />, label: 'Explore', href: '/explore' },
        { icon: <FaBell size={20} />, label: 'Notifications', href: '/notifications' },
        { icon: <FaUser size={20} />, label: 'Profile', href: `/profile/${user?.username}` },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
            <nav className="flex justify-around items-center h-14">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center p-2 ${pathname === item.href ? 'text-blue-500' : 'text-white'
                            }`}
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default MobileNav; 