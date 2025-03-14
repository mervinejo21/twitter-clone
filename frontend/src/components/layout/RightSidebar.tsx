'use client';

import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RightSidebar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const trendingTopics = [
        { id: 1, name: 'Programming', count: '25.5K tweets' },
        { id: 2, name: 'JavaScript', count: '15.2K tweets' },
        { id: 3, name: 'React', count: '12.8K tweets' },
        { id: 4, name: 'NextJS', count: '8.7K tweets' },
        { id: 5, name: 'TypeScript', count: '7.3K tweets' },
    ];

    const whoToFollow = [
        { id: 1, name: 'John Doe', username: 'johndoe', avatar: 'https://via.placeholder.com/40' },
        { id: 2, name: 'Jane Smith', username: 'janesmith', avatar: 'https://via.placeholder.com/40' },
        { id: 3, name: 'Bob Johnson', username: 'bobjohnson', avatar: 'https://via.placeholder.com/40' },
    ];

    return (
        <div className="h-full sticky top-0 overflow-y-auto w-full p-4 hidden lg:block">
            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search Twitter"
                        className="bg-gray-800 text-white w-full rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute left-3 top-2.5">
                        <FaSearch className="text-gray-500" />
                    </div>
                </div>
            </div>

            {/* Trends */}
            <div className="bg-gray-800 rounded-xl mb-6">
                <h2 className="font-bold text-xl p-4">Trends for you</h2>
                <ul>
                    {trendingTopics.map((topic) => (
                        <li key={topic.id} className="hover:bg-gray-100 p-2 rounded transition-colors">
                            <Link href={`/search?q=${encodeURIComponent(topic.name)}`} className="block">
                                <p className="text-gray-500 text-sm">Trending</p>
                                <p className="font-bold">#{topic.name}</p>
                                <p className="text-gray-500 text-sm">{topic.count}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link href="/explore" className="text-blue-500 block mt-4 hover:underline">
                    Show more
                </Link>
            </div>

            {/* Who to follow */}
            <div className="bg-gray-800 rounded-xl">
                <h2 className="font-bold text-xl p-4">Who to follow</h2>
                <ul>
                    {whoToFollow.map((user) => (
                        <li key={user.id} className="flex items-center justify-between hover:bg-gray-100 p-2 rounded transition-colors">
                            <Link href={`/profile/${user.username}`} className="flex items-center">
                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                                <div>
                                    <p className="font-bold">{user.name}</p>
                                    <p className="text-gray-500">@{user.username}</p>
                                </div>
                            </Link>
                            <button className="bg-black text-white rounded-full px-4 py-1.5 font-bold text-sm hover:bg-gray-800">
                                Follow
                            </button>
                        </li>
                    ))}
                </ul>
                <Link href="/connect" className="text-blue-500 block mt-4 hover:underline">
                    Show more
                </Link>
            </div>

            {/* Footer */}
            <div className="text-gray-500 text-sm">
                <div className="flex flex-wrap gap-2">
                    <Link href="/terms" className="hover:underline">Terms of Service</Link>
                    <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                    <Link href="/cookies" className="hover:underline">Cookie Policy</Link>
                    <Link href="/accessibility" className="hover:underline">Accessibility</Link>
                    <Link href="/ads" className="hover:underline">Ads info</Link>
                    <Link href="/about" className="hover:underline">About</Link>
                </div>
                <p className="mt-2">© 2023 Twitter Clone</p>
            </div>
        </div>
    );
};

export default RightSidebar; 