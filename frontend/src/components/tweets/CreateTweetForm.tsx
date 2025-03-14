'use client';

import React, { useState, useRef } from 'react';
import { FaImage, FaVideo, FaPoll, FaSmile } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { createTweet } from '@/lib/api/tweets';

interface CreateTweetFormProps {
    onTweetCreated?: () => void;
    replyToId?: string;
}

const DEFAULT_PROFILE_IMAGE = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid";

const CreateTweetForm: React.FC<CreateTweetFormProps> = ({ onTweetCreated, replyToId }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPollForm, setShowPollForm] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [pollDuration, setPollDuration] = useState('1d');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddImage = () => {
        // In a real app, this would open a file picker or image upload dialog
        const newImageUrl = prompt('Enter image URL:');
        if (newImageUrl) {
            setImages([...images, newImageUrl]);
        }
    };

    const handleAddVideo = () => {
        // In a real app, this would open a file picker or video upload dialog
        const newVideoUrl = prompt('Enter video URL:');
        if (newVideoUrl) {
            setVideoUrl(newVideoUrl);
        }
    };

    const handleAddPollOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const handlePollOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const handleRemovePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            const newOptions = [...pollOptions];
            newOptions.splice(index, 1);
            setPollOptions(newOptions);
        }
    };

    const getPollExpirationDate = () => {
        const now = new Date();

        switch (pollDuration) {
            case '1d':
                now.setDate(now.getDate() + 1);
                break;
            case '3d':
                now.setDate(now.getDate() + 3);
                break;
            case '7d':
                now.setDate(now.getDate() + 7);
                break;
            default:
                now.setDate(now.getDate() + 1);
        }

        return now.toISOString();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('Tweet content cannot be empty');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const tweetData = {
                content,
                images: images.length > 0 ? images : undefined,
                videoUrl: videoUrl || undefined,
                replyToId: replyToId,
                poll: showPollForm
                    ? {
                        question: pollQuestion,
                        options: pollOptions.filter((option) => option.trim() !== ''),
                        expiresAt: getPollExpirationDate(),
                    }
                    : undefined,
            };

            await createTweet(tweetData);

            // Reset form
            setContent('');
            setImages([]);
            setVideoUrl('');
            setShowPollForm(false);
            setPollQuestion('');
            setPollOptions(['', '']);

            if (onTweetCreated) {
                onTweetCreated();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create tweet. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="border-b border-gray-200 p-4">
            <form onSubmit={handleSubmit}>
                <div className="flex">
                    <div className="mr-3">
                        <img
                            src={user.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                            alt={user.displayName || user.username}
                            className="w-12 h-12 rounded-full"
                        />
                    </div>

                    <div className="flex-1">
                        <textarea
                            placeholder={replyToId ? "Tweet your reply" : "What's happening?"}
                            className="w-full border-none resize-none focus:outline-none text-xl min-h-[120px]"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={280}
                        />

                        {images.length > 0 && (
                            <div className={`mt-3 grid gap-2 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={image}
                                            alt={`Tweet image ${index + 1}`}
                                            className="rounded-lg max-h-80 w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                                            onClick={() => {
                                                const newImages = [...images];
                                                newImages.splice(index, 1);
                                                setImages(newImages);
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {videoUrl && (
                            <div className="mt-3 relative">
                                <video
                                    src={videoUrl}
                                    controls
                                    className="rounded-lg max-h-80 w-full"
                                />
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                                    onClick={() => setVideoUrl('')}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {showPollForm && (
                            <div className="mt-3 border border-gray-200 rounded-lg p-3">
                                <input
                                    type="text"
                                    placeholder="Ask a question..."
                                    className="w-full border-none focus:outline-none text-lg mb-3"
                                    value={pollQuestion}
                                    onChange={(e) => setPollQuestion(e.target.value)}
                                />

                                {pollOptions.map((option, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            placeholder={`Option ${index + 1}`}
                                            className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={option}
                                            onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                        />
                                        {index > 1 && (
                                            <button
                                                type="button"
                                                className="ml-2 text-gray-500"
                                                onClick={() => handleRemovePollOption(index)}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {pollOptions.length < 4 && (
                                    <button
                                        type="button"
                                        className="text-blue-500 mt-2"
                                        onClick={handleAddPollOption}
                                    >
                                        Add option
                                    </button>
                                )}

                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Poll length
                                    </label>
                                    <select
                                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={pollDuration}
                                        onChange={(e) => setPollDuration(e.target.value)}
                                    >
                                        <option value="1d">1 day</option>
                                        <option value="3d">3 days</option>
                                        <option value="7d">7 days</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-3 text-red-500 text-sm">{error}</div>
                        )}

                        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                            <div className="flex space-x-4 text-blue-500">
                                <button
                                    type="button"
                                    onClick={handleAddImage}
                                    disabled={videoUrl !== '' || images.length >= 4}
                                    className={`${videoUrl !== '' || images.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <FaImage size={20} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddVideo}
                                    disabled={images.length > 0 || videoUrl !== ''}
                                    className={`${images.length > 0 || videoUrl !== '' ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <FaVideo size={20} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPollForm(!showPollForm)}
                                    disabled={images.length > 0 || videoUrl !== ''}
                                    className={`${images.length > 0 || videoUrl !== '' ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <FaPoll size={20} />
                                </button>
                                <button type="button">
                                    <FaSmile size={20} />
                                </button>
                            </div>

                            <div className="flex items-center">
                                <span className="text-gray-500 mr-3">
                                    {content.length}/280
                                </span>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || content.trim() === ''}
                                    className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full ${isSubmitting || content.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isSubmitting ? 'Posting...' : 'Tweet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateTweetForm; 