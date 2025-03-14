'use client';

import React, { useEffect, useState } from 'react';
import ConversationList from '@/components/messages/ConversationList';
import MessageList from '@/components/messages/MessageList';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getConversation, Conversation } from '@/lib/api/messages';
import { FaArrowLeft } from 'react-icons/fa';

export default function ConversationPage({ params }: { params: { id: string } }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [isFetchingConversation, setIsFetchingConversation] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        const fetchConversation = async () => {
            if (!params.id || !user) return;

            try {
                const data = await getConversation(params.id);
                setConversation(data);
            } catch (error) {
                console.error('Error fetching conversation:', error);
                router.push('/messages');
            } finally {
                setIsFetchingConversation(false);
            }
        };

        if (!isLoading && user) {
            fetchConversation();
        }
    }, [params.id, user, isLoading, router]);

    if (isLoading || isFetchingConversation) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const getOtherParticipants = () => {
        if (!conversation || !user) return [];

        return conversation.participants.filter(
            (participant) => participant.userId !== user.id
        );
    };

    const otherParticipants = getOtherParticipants();

    return (
        <div className="h-screen flex flex-col">
            <div className="p-4 border-b flex items-center">
                <button
                    onClick={() => router.push('/messages')}
                    className="mr-4 md:hidden"
                >
                    <FaArrowLeft />
                </button>
                <div className="flex items-center">
                    {otherParticipants.length > 0 && (
                        <img
                            src={otherParticipants[0].user.profileImageUrl || 'https://via.placeholder.com/40'}
                            alt={otherParticipants[0].user.displayName || otherParticipants[0].user.username}
                            className="w-10 h-10 rounded-full mr-3"
                        />
                    )}
                    <h1 className="text-xl font-bold">
                        {otherParticipants
                            .map((p) => p.user.displayName || p.user.username)
                            .join(', ')}
                    </h1>
                </div>
            </div>

            <div className="flex-1 flex">
                <div className="w-80 md:flex hidden">
                    <ConversationList />
                </div>

                <div className="flex-1">
                    <MessageList conversationId={params.id} />
                </div>
            </div>
        </div>
    );
} 