'use client';

import React, { useState, useEffect } from 'react';
import { getTweets } from '@/lib/api/tweets';
import { Tweet } from '@/lib/api/tweets';
import TweetCard from '@/components/tweets/TweetCard';
import CreateTweetForm from '@/components/tweets/CreateTweetForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const router = useRouter();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchTweets = async (pageNum = 1) => {
    try {
      setIsPageLoading(true);
      const response = await getTweets(pageNum);

      if (pageNum === 1) {
        setTweets(response.data);
      } else {
        setTweets((prev) => [...prev, ...response.data]);
      }

      setHasMore(pageNum < response.meta.pages);
      setError(null);
    } catch (err) {
      setError('Failed to load tweets. Please try again.');
      console.error('Error fetching tweets:', err);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        setIsPageLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleLoadMore = () => {
    if (!isPageLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      setIsLoadingMore(true);
      fetchTweets(nextPage);
    }
  };

  const handleTweetCreated = () => {
    // Reset to page 1 and fetch tweets again
    setPage(1);
    fetchTweets(1);
  };

  if (authLoading || isPageLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-black bg-opacity-90 backdrop-blur-sm border-b border-gray-800">
        <h1 className="text-xl font-bold p-4">Home</h1>
      </div>

      {/* Scrollable content (both tweet form and tweets) */}
      <div className="flex-1">
        {isAuthenticated && <CreateTweetForm onTweetCreated={handleTweetCreated} />}

        <div className="tweets-container pb-16 md:pb-0">
          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} onTweetUpdate={fetchTweets} />
          ))}

          {/* Loading and end indicators */}
          {hasMore && (
            <div className="flex justify-center py-4">
              <button
                onClick={handleLoadMore}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
              >
                Load More
              </button>
            </div>
          )}

          {/* Other UI elements like loading, error states, etc. */}
          {isPageLoading && page === 1 ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          ) : tweets.length === 0 ? (
            <div className="p-4 text-center">
              No tweets yet. Be the first to tweet!
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              You've reached the end
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
