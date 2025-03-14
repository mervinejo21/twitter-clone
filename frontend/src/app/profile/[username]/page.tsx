'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getUserByUsername, getFollowers, getFollowing } from '@/lib/api/users';
import { getUserTweets } from '@/lib/api/tweets';
import { User } from '@/lib/api/users';
import { Tweet } from '@/lib/api/tweets';
import ProfileHeader from '@/components/users/ProfileHeader';
import TweetCard from '@/components/tweets/TweetCard';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!username) return;

            try {
                setIsLoading(true);

                // Fetch user profile
                const userData = await getUserByUsername(username as string);
                setUser(userData);

                // Fetch user tweets
                const tweetsResponse = await getUserTweets(userData.id);
                setTweets(tweetsResponse.data);

                // Fetch followers and following
                const followersData = await getFollowers(userData.id);
                const followingData = await getFollowing(userData.id);

                setFollowersCount(followersData.length);
                setFollowingCount(followingData.length);

                // Check if current user is following this user
                if (currentUser) {
                    const isAlreadyFollowing = followersData.some(
                        follower => follower.followerId === currentUser.id
                    );
                    setIsFollowing(isAlreadyFollowing);
                }

                setError(null);
            } catch (err) {
                setError('Failed to load user profile. Please try again.');
                console.error('Error fetching user data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [username, currentUser]);

    const handleFollowToggle = () => {
        setIsFollowing(!isFollowing);
        if (isFollowing) {
            setFollowersCount((prev) => prev - 1);
        } else {
            setFollowersCount((prev) => prev + 1);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error || 'User not found'}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <ProfileHeader
                user={user}
                isFollowing={isFollowing}
                followersCount={followersCount}
                followingCount={followingCount}
                onFollowToggle={handleFollowToggle}
            />

            <div className="divide-y divide-gray-200">
                {tweets.length > 0 ? (
                    tweets.map((tweet) => (
                        <TweetCard key={tweet.id} tweet={tweet} />
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <p className="text-xl font-bold mb-2">No tweets yet</p>
                        <p>When this user posts tweets, they'll show up here.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 