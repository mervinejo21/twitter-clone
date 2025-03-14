'use client';

import React from 'react';
import { FaTwitter } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Add default profile image constant
const DEFAULT_PROFILE_IMAGE = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid";

interface MobileHeaderProps {
    title?: string;
    onMenuClick?: () => void;
}

const MobileHeader = ({ title, onMenuClick }: MobileHeaderProps) => {
    const { user } = useAuth();
    const pathname = usePathname();

    // Determine the page title based on the current path
    const getPageTitle = () => {
        if (pathname === '/') return 'Home';
        if (pathname === '/explore') return 'Explore';
        if (pathname.startsWith('/profile')) return 'Profile';
        if (pathname === '/notifications') return 'Notifications';
        if (pathname === '/messages') return 'Messages';
        return title || 'Twitter';
    };

    const pageTitle = getPageTitle();

    return (
        <div className="md:hidden sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur p-3 border-b border-gray-800 flex items-center justify-between">
            <div className="w-8">
                {user && (
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                        <Image
                            src={user.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                            alt={user.displayName || user.username || "User"}
                            width={32}
                            height={32}
                            className="object-cover"
                        />
                    </div>
                )}
            </div>

            <div className="flex-1 text-center">
                {pageTitle === 'Home' ? (
                    <Link href="/">
                        <FaTwitter className="text-blue-500 mx-auto" size={24} />
                    </Link>
                ) : (
                    <h1 className="font-bold text-xl">{pageTitle}</h1>
                )}
            </div>

            <div className="w-8">
                {/* Empty space for balance */}
            </div>
        </div>
    );
};

export default MobileHeader; 