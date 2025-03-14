'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { getTweet, getTweetReplies } from '@/lib/api/tweets';
import { Tweet } from '@/lib/api/tweets';
import TweetCard from '@/components/tweets/TweetCard';
import CreateTweetForm from '@/components/tweets/CreateTweetForm';
import { useAuth } from '@/contexts/AuthContext';

export default function TweetDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [tweet, setTweet] = useState<Tweet | null>(null);
    const [replies, setReplies] = useState<Tweet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTweetData = async () => {
        if (!id) return;

        try {
            setIsLoading(true);

            // Fetch tweet
            const tweetData = await getTweet(id as string);
            setTweet(tweetData);

            // Fetch replies
            const repliesResponse = await getTweetReplies(id as string);
            setReplies(repliesResponse.data);

            setError(null);
        } catch (err) {
            setError('Failed to load tweet. Please try again.');
            console.error('Error fetching tweet data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTweetData();
    }, [id]);

    const handleReplyCreated = () => {
        fetchTweetData();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !tweet) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error || 'Tweet not found'}</p>
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
            <div className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center">
                <button
                    onClick={() => router.back()}
                    className="mr-6 hover:bg-gray-200 rounded-full p-2"
                >
                    <FaArrowLeft />
                </button>
                <h1 className="text-xl font-bold">Tweet</h1>
            </div>

            <div className="border-b border-gray-200">
                <TweetCard tweet={tweet} onTweetUpdate={fetchTweetData} />
            </div>

            {isAuthenticated && (
                <div className="border-b border-gray-200">
                    <CreateTweetForm replyToId={tweet.id} onTweetCreated={handleReplyCreated} />
                </div>
            )}

            {replies.length > 0 ? (
                <div className="divide-y divide-gray-200">
                    {replies.map((reply) => (
                        <TweetCard key={reply.id} tweet={reply} onTweetUpdate={fetchTweetData} />
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-gray-500">
                    <p className="text-xl font-bold mb-2">No replies yet</p>
                    <p>Be the first to reply to this tweet!</p>
                </div>
            )}
        </div>
    );
} 