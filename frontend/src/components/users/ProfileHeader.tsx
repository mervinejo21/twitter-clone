'use client';

import React, { useState } from 'react';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/api/users';
import { useAuth } from '@/contexts/AuthContext';
import { followUser, unfollowUser } from '@/lib/api/users';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

// Add default profile image constant
const DEFAULT_PROFILE_IMAGE = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid";

interface ProfileHeaderProps {
    user: User;
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
    onFollowToggle: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    isFollowing,
    followersCount,
    followingCount,
    onFollowToggle,
}) => {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleFollowToggle = async () => {
        if (!currentUser || isLoading) return;

        setIsLoading(true);

        try {
            if (isFollowing) {
                await unfollowUser(user.id);
            } else {
                await followUser(user.id);
            }

            onFollowToggle();
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `Joined ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    };

    const isCurrentUser = currentUser?.id === user.id;

    return (
        <div>
            {/* Header with back button */}
            <div className="flex items-center p-4 sticky top-0 bg-white z-10 border-b border-gray-200">
                <button
                    onClick={() => router.back()}
                    className="mr-6 hover:bg-gray-200 rounded-full p-2"
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="font-bold text-xl">{user.displayName || user.username}</h1>
                    <p className="text-gray-500 text-sm">
                        {user._count?.tweets || 0} Tweets
                    </p>
                </div>
            </div>

            {/* Banner image */}
            <div
                className="h-48 bg-blue-500"
                style={{
                    backgroundImage: user.bannerImageUrl ? `url(${user.bannerImageUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Profile info section */}
            <div className="p-4 border-b border-gray-200 relative">
                {/* Profile image */}
                <div className="absolute -top-16 left-4 border-4 border-white rounded-full overflow-hidden">
                    <Image
                        src={user.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                        alt={user.displayName || user.username || "User"}
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-full object-cover"
                    />
                </div>

                {/* Follow/Edit button */}
                <div className="flex justify-end mb-12">
                    {isCurrentUser ? (
                        <button
                            onClick={() => router.push('/settings/profile')}
                            className="border border-gray-300 font-bold px-4 py-2 rounded-full hover:bg-gray-100"
                        >
                            Edit profile
                        </button>
                    ) : (
                        <button
                            onClick={handleFollowToggle}
                            disabled={isLoading}
                            className={`font-bold px-4 py-2 rounded-full ${isFollowing
                                ? 'border border-gray-300 hover:border-red-500 hover:text-red-500 hover:bg-red-50'
                                : 'bg-black text-white hover:bg-gray-800'
                                }`}
                        >
                            {isLoading
                                ? 'Loading...'
                                : isFollowing
                                    ? 'Following'
                                    : 'Follow'}
                        </button>
                    )}
                </div>

                {/* User info */}
                <div>
                    <h1 className="font-bold text-xl">{user.displayName || user.username}</h1>
                    <p className="text-gray-500">@{user.username}</p>

                    {user.bio && <p className="mt-3">{user.bio}</p>}

                    <div className="flex items-center mt-3 text-gray-500">
                        <div className="flex items-center mr-4">
                            <FaCalendarAlt className="mr-2" />
                            <span>{formatDate(user.createdAt)}</span>
                        </div>
                    </div>

                    <div className="flex mt-3">
                        <div className="mr-4">
                            <span className="font-bold">{followingCount}</span>{' '}
                            <span className="text-gray-500">Following</span>
                        </div>
                        <div>
                            <span className="font-bold">{followersCount}</span>{' '}
                            <span className="text-gray-500">Followers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-gray-200">
                <button className="flex-1 py-4 font-bold border-b-4 border-blue-500">
                    Tweets
                </button>
                <button className="flex-1 py-4 text-gray-500 hover:bg-gray-100">
                    Tweets & replies
                </button>
                <button className="flex-1 py-4 text-gray-500 hover:bg-gray-100">
                    Media
                </button>
                <button className="flex-1 py-4 text-gray-500 hover:bg-gray-100">
                    Likes
                </button>
            </div>
        </div>
    );
};

export default ProfileHeader; 