'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaRegComment, FaRetweet, FaRegHeart, FaHeart, FaShare } from 'react-icons/fa';
import { Tweet } from '@/lib/api/tweets';
import { useAuth } from '@/contexts/AuthContext';
import { likeTweet, unlikeTweet, respondToPoll, removePollResponse } from '@/lib/api/tweets';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { MessageSquare, Heart, Share } from 'lucide-react';
import { UserIcon } from '../UserIcon';

interface TweetCardProps {
    tweet: Tweet;
    onTweetUpdate?: () => void;
}

// Add a constant for the default profile image
const DEFAULT_PROFILE_IMAGE = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid";

const TweetCard: React.FC<TweetCardProps> = ({ tweet, onTweetUpdate }) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(
        tweet.likes.some((like) => like.userId === user?.id)
    );
    const [likeCount, setLikeCount] = useState(tweet._count.likes);
    const [isLiking, setIsLiking] = useState(false);
    const [hasVoted, setHasVoted] = useState(
        tweet.poll?.options.some(option =>
            option.responses?.some(response => response.userId === user?.id)
        ) || false
    );
    const [isVoting, setIsVoting] = useState(false);
    const [pollOptions, setPollOptions] = useState(tweet.poll?.options || []);
    const [votedOptionId, setVotedOptionId] = useState<string | null>(() => {
        if (!tweet.poll || !user) return null;

        // Find which option the user voted for
        for (const option of tweet.poll.options) {
            if (option.responses?.some(response => response.userId === user.id)) {
                return option.id;
            }
        }
        return null;
    });

    // Fix the pollPercentages initialization to handle potential undefined values
    const [pollPercentages, setPollPercentages] = useState<Record<string, number>>(() => {
        if (!tweet.poll || tweet.poll._count.responses === 0) {
            return {};
        }

        // Initialize with current percentages
        return tweet.poll.options.reduce((acc, option) => {
            // Safely access poll response count with nullish coalescing
            const totalResponses = tweet.poll?._count.responses || 1;
            acc[option.id] = (option._count.responses / totalResponses) * 100;
            return acc;
        }, {} as Record<string, number>);
    });

    // Update the poll percentage calculation function
    const calculatePercentages = (options: Array<{ id: string; _count: { responses: number } }>, totalResponses: number) => {
        const percentages: Record<string, number> = {};

        options.forEach(option => {
            percentages[option.id] = totalResponses > 0
                ? (option._count.responses / totalResponses) * 100
                : 0;
        });

        return percentages;
    };

    // Update the handleLike function to prevent feed refresh
    const handleLike = async () => {
        if (isLiking || !user) return;

        setIsLiking(true);

        try {
            // Local state update first for immediate UI feedback
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            setLikeCount(prevCount => newIsLiked ? prevCount + 1 : prevCount - 1);

            // Call API based on the new state
            if (newIsLiked) {
                await likeTweet(tweet.id);
            } else {
                await unlikeTweet(tweet.id);
            }

            // Don't call onTweetUpdate() here - this prevents refreshing the feed
        } catch (error) {
            // Revert UI changes on error
            console.error('Error toggling like:', error);
            setIsLiked(!isLiked);
            setLikeCount(prevCount => isLiked ? prevCount + 1 : prevCount - 1);

            // Only refresh on error to sync with server state
            if (onTweetUpdate) {
                onTweetUpdate();
            }
        } finally {
            setIsLiking(false);
        }
    };

    const handleVote = async (optionId: string) => {
        if (!user || isVoting || !tweet.poll || optionId === "") return;

        setIsVoting(true);

        try {
            if (hasVoted && optionId !== votedOptionId) {
                // Changing vote - total stays the same
                const previousVotedId = votedOptionId;

                // Update UI state
                setHasVoted(true);
                setVotedOptionId(optionId);

                // Create updated options with new counts
                const updatedOptions = pollOptions.map(option => {
                    if (option.id === previousVotedId) {
                        return {
                            ...option,
                            _count: {
                                ...option._count,
                                responses: Math.max(0, option._count.responses - 1)
                            }
                        };
                    }
                    if (option.id === optionId) {
                        return {
                            ...option,
                            _count: {
                                ...option._count,
                                responses: option._count.responses + 1
                            }
                        };
                    }
                    return { ...option };
                });

                // Update options state
                setPollOptions(updatedOptions);

                // Calculate and update percentages
                const totalResponses = tweet.poll._count.responses || 0;
                setPollPercentages(calculatePercentages(updatedOptions, totalResponses));

                // API calls
                try {
                    await removePollResponse(tweet.poll.id);
                    await respondToPoll(optionId);
                } catch (error) {
                    console.error("Failed to change vote:", error);
                    if (onTweetUpdate) onTweetUpdate();
                }
            }
            else if (!hasVoted) {
                // First vote
                setHasVoted(true);
                setVotedOptionId(optionId);

                // Calculate new total responses
                const currentTotal = tweet.poll._count.responses || 0;
                const newTotalCount = currentTotal + 1;

                // Safely update total count in tweet poll object
                if (tweet.poll) {
                    tweet.poll._count.responses = newTotalCount;
                }

                // Create updated options
                const updatedOptions = pollOptions.map(option => {
                    if (option.id === optionId) {
                        return {
                            ...option,
                            _count: {
                                ...option._count,
                                responses: option._count.responses + 1
                            }
                        };
                    }
                    return { ...option };
                });

                // Update options state
                setPollOptions(updatedOptions);

                // Calculate and update percentages
                setPollPercentages(calculatePercentages(updatedOptions, newTotalCount));

                // API call
                try {
                    await respondToPoll(optionId);
                } catch (error) {
                    console.error("Failed to vote:", error);
                    if (onTweetUpdate) onTweetUpdate();
                }
            }
        } catch (error) {
            console.error('Error handling poll vote:', error);
            if (onTweetUpdate) onTweetUpdate();
        } finally {
            setIsVoting(false);
        }
    };

    const handleUnvote = async () => {
        if (!user || isVoting || !tweet.poll || !votedOptionId) return;

        setIsVoting(true);

        try {
            const optionToUnvoteId = votedOptionId;

            // Update UI state
            setHasVoted(false);
            setVotedOptionId(null);

            // Calculate new total
            const currentTotal = tweet.poll._count.responses || 0;
            const newTotalCount = Math.max(0, currentTotal - 1);

            // Safely update total in tweet poll object
            if (tweet.poll) {
                tweet.poll._count.responses = newTotalCount;
            }

            // Create updated options
            const updatedOptions = pollOptions.map(option => {
                if (option.id === optionToUnvoteId) {
                    return {
                        ...option,
                        _count: {
                            ...option._count,
                            responses: Math.max(0, option._count.responses - 1)
                        }
                    };
                }
                return { ...option };
            });

            // Update options state
            setPollOptions(updatedOptions);

            // Calculate and update percentages
            setPollPercentages(calculatePercentages(updatedOptions, newTotalCount));

            // API call
            await removePollResponse(tweet.poll.id);
        } catch (error) {
            console.error('Error unvoting poll:', error);
            if (onTweetUpdate) onTweetUpdate();
        } finally {
            setIsVoting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-4 mb-4 w-full max-w-full overflow-hidden">
            {/* Header section with improved mobile responsiveness */}
            <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-grow">
                    <Link href={`/profile/${tweet.user.id}`}>
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                            {tweet.user.profileImageUrl ? (
                                <Image
                                    src={tweet.user.profileImageUrl}
                                    alt={tweet.user.displayName || tweet.user.username || "user"}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <Image
                                    src={DEFAULT_PROFILE_IMAGE}
                                    alt={tweet.user.displayName || tweet.user.username || "user"}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            )}
                        </div>
                    </Link>
                    <div className="flex flex-col flex-grow min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                            <Link href={`/profile/${tweet.user.id}`} className="hover:underline">
                                <span className="font-bold text-white text-sm sm:text-base truncate">
                                    {tweet.user.displayName || tweet.user.username}
                                </span>
                            </Link>
                            <span className="text-gray-400 text-xs sm:text-sm sm:ml-1">@{tweet.user.username}</span>
                        </div>
                        <span className="text-gray-400 text-xs sm:text-sm truncate">{formatDate(tweet.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Tweet content */}
            <div className="mb-2 sm:mb-3 break-words">
                <p className="text-white text-sm sm:text-base">{tweet.content}</p>
            </div>

            {/* Poll section with responsive design */}
            {tweet.poll && (
                <div className="mt-4 mb-4 w-full">
                    <h3 className="text-white font-semibold mb-2">{tweet.poll.question}</h3>

                    <div className="flex flex-col space-y-2 w-full">
                        {pollOptions.map((option) => (
                            <div
                                key={option.id}
                                className={`flex flex-col sm:flex-row items-stretch sm:items-center 
                                          cursor-pointer hover:bg-gray-700/30 rounded-lg p-2 transition-colors
                                          ${isVoting ? 'opacity-70 pointer-events-none' : ''} 
                                          ${votedOptionId === option.id ? 'border-l-4 border-blue-500 pl-2' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!isVoting) {
                                        if (votedOptionId === option.id) {
                                            handleUnvote();
                                        } else {
                                            handleVote(option.id);
                                        }
                                    }
                                }}
                            >
                                <div className="flex-1 bg-gray-700 rounded-full h-8 overflow-hidden w-full mb-1 sm:mb-0">
                                    <div
                                        className="bg-blue-500 h-full flex items-center px-3"
                                        style={{
                                            width: `${pollPercentages[option.id] || 0}%`,
                                            minWidth: option.text.length > 0 ? '2rem' : '0',
                                            transition: 'width 0.5s ease-in-out'
                                        }}
                                    >
                                        <span className="text-white font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                            {option.text}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-gray-300 text-sm whitespace-nowrap ml-0 sm:ml-2">
                                    {option._count.responses} {option._count.responses === 1 ? 'vote' : 'votes'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 flex flex-wrap justify-between text-xs sm:text-sm gap-2">
                        <span className="text-gray-400">
                            {tweet.poll._count.responses} {tweet.poll._count.responses === 1 ? 'total vote' : 'total votes'}
                        </span>
                        <span className="text-gray-400">
                            {new Date(tweet.poll.expiresAt) > new Date()
                                ? `Ends ${formatDate(tweet.poll.expiresAt)}`
                                : 'Poll ended'}
                        </span>
                        {hasVoted && (
                            <button
                                className="text-blue-500 hover:underline text-xs sm:text-sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleUnvote();
                                }}
                            >
                                Unvote
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Image gallery - handle multiple images responsively */}
            {tweet.images && tweet.images.length > 0 && (
                <div className={`mt-2 sm:mt-3 grid gap-2 ${tweet.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} max-h-96`}>
                    {tweet.images.map((image, index) => (
                        <div key={index} className={`rounded-lg overflow-hidden ${index >= 4 ? 'hidden sm:block' : ''}`}>
                            <Image
                                src={image}
                                alt={`Tweet image ${index + 1}`}
                                width={500}
                                height={300}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Video element if available */}
            {tweet.videoUrl && (
                <div className="mt-2 sm:mt-3">
                    <video
                        src={tweet.videoUrl}
                        controls
                        className="rounded-lg max-h-80 w-full"
                    />
                </div>
            )}

            {/* Action buttons with responsive sizing */}
            <div className="flex justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-700 text-gray-400">
                <button className="flex items-center space-x-1 hover:text-blue-500 text-xs sm:text-sm">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{tweet._count.comments}</span>
                </button>

                <button
                    className={`flex items-center space-x-1 hover:text-green-500 text-xs sm:text-sm ${isLiked ? 'text-green-500' : ''}`}
                    onClick={handleLike}
                    disabled={isLiking}
                >
                    {isLiked ? <Heart className="h-4 w-4 sm:h-5 sm:w-5 fill-current" /> : <Heart className="h-4 w-4 sm:h-5 sm:w-5" />}
                    <span>{likeCount}</span>
                </button>

                <button className="flex items-center space-x-1 hover:text-blue-500 text-xs sm:text-sm">
                    <Share className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
};

export default TweetCard; 