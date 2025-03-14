'use client';

import React from 'react';
import ConversationList from '@/components/messages/ConversationList';
import NewConversationForm from '@/components/messages/NewConversationForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewMessagePage() {
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

                <div className="flex-1">
                    <NewConversationForm />
                </div>
            </div>
        </div>
    );
} 