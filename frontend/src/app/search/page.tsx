'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { searchTweets } from '@/lib/api/tweets';
import { Tweet } from '@/lib/api/tweets';
import TweetCard from '@/components/tweets/TweetCard';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';

    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchSearchResults = async (pageNum = 1) => {
        if (!query) {
            setTweets([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await searchTweets(query, pageNum);

            if (pageNum === 1) {
                setTweets(response.data);
            } else {
                setTweets((prev) => [...prev, ...response.data]);
            }

            setHasMore(pageNum < response.meta.pages);
            setError(null);
        } catch (err) {
            setError('Failed to load search results. Please try again.');
            console.error('Error fetching search results:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchSearchResults(1);
    }, [query]);

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchSearchResults(nextPage);
        }
    };

    return (
        <div>
            <div className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center">
                <button
                    onClick={() => router.back()}
                    className="mr-6 hover:bg-gray-200 rounded-full p-2"
                >
                    <FaArrowLeft />
                </button>
                <h1 className="text-xl font-bold">Search</h1>
            </div>

            {query && (
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold">Search results for "{query}"</h2>
                </div>
            )}

            {isLoading && page === 1 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="p-8 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => fetchSearchResults(page)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full"
                    >
                        Retry
                    </button>
                </div>
            ) : tweets.length > 0 ? (
                <div className="divide-y divide-gray-200">
                    {tweets.map((tweet) => (
                        <TweetCard key={tweet.id} tweet={tweet} />
                    ))}
                </div>
            ) : (
                <div className="p-8 text-center text-gray-500">
                    {query ? (
                        <>
                            <p className="text-xl font-bold mb-2">No results found</p>
                            <p>Try searching for something else</p>
                        </>
                    ) : (
                        <>
                            <p className="text-xl font-bold mb-2">Search for tweets</p>
                            <p>Enter a search term in the search box above</p>
                        </>
                    )}
                </div>
            )}

            {isLoading && page > 1 && (
                <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
            )}

            {!isLoading && !error && hasMore && tweets.length > 0 && (
                <div className="p-4 text-center">
                    <button
                        onClick={handleLoadMore}
                        className="bg-transparent hover:bg-blue-50 text-blue-500 font-semibold py-2 px-4 border border-blue-500 rounded-full"
                    >
                        Load more
                    </button>
                </div>
            )}

            {!isLoading && !error && !hasMore && tweets.length > 0 && (
                <div className="p-4 text-center text-gray-500">
                    You've reached the end
                </div>
            )}
        </div>
    );
} 