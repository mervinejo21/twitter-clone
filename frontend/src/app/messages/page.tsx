'use client';

import React from 'react';
import ConversationList from '@/components/messages/ConversationList';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function MessagesPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="p-4 border-b">
                <h1 className="text-xl font-bold">Messages</h1>
            </div>

            <div className="flex-1 flex">
                <div className="w-80 md:flex hidden">
                    <ConversationList />
                </div>

                <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Select a conversation</h2>
                        <p className="text-gray-600 mb-4">Choose an existing conversation or start a new one</p>
                        <Link
                            href="/messages/new"
                            className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-600"
                        >
                            New conversation
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 