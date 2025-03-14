'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getConversations, Conversation } from '@/lib/api/messages';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const ConversationList: React.FC = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await getConversations();
                setConversations(data);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, []);

    const getOtherParticipants = (conversation: Conversation) => {
        return conversation.participants.filter(
            (participant) => participant.userId !== user?.id
        );
    };

    const getLastMessage = (conversation: Conversation) => {
        return conversation.messages[0]?.content || 'No messages yet';
    };

    const formatTime = (dateString: string) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Loading conversations...</p>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="text-center p-6 border-b">
                <p className="text-gray-500">No conversations yet</p>
                <Link href="/messages/new" className="text-blue-500 hover:underline mt-2 inline-block">
                    Start a new conversation
                </Link>
            </div>
        );
    }

    return (
        <div className="border-r h-full overflow-y-auto">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Messages</h2>
            </div>
            <ul>
                {conversations.map((conversation) => {
                    const otherParticipants = getOtherParticipants(conversation);
                    const isActive = pathname === `/messages/${conversation.id}`;

                    return (
                        <li key={conversation.id}>
                            <Link href={`/messages/${conversation.id}`}>
                                <div
                                    className={`flex p-4 hover:bg-gray-50 ${isActive ? 'bg-blue-50' : 'border-b'
                                        }`}
                                >
                                    <div className="relative mr-3">
                                        <img
                                            src={otherParticipants[0]?.user.profileImageUrl || 'https://via.placeholder.com/40'}
                                            alt={otherParticipants[0]?.user.displayName || otherParticipants[0]?.user.username}
                                            className="w-12 h-12 rounded-full"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between">
                                            <h3 className="font-bold truncate">
                                                {otherParticipants
                                                    .map((p) => p.user.displayName || p.user.username)
                                                    .join(', ')}
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                {formatTime(conversation.updatedAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 truncate">{getLastMessage(conversation)}</p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ConversationList; 