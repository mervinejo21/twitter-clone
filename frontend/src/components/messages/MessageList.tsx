'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMessages, createMessage, Message } from '@/lib/api/messages';
import { formatDistanceToNow } from 'date-fns';

interface MessageListProps {
    conversationId: string;
}

const MessageList: React.FC<MessageListProps> = ({ conversationId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const data = await getMessages(conversationId);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (conversationId) {
            fetchMessages();
        }
    }, [conversationId]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || isSending) return;

        setIsSending(true);

        try {
            const sentMessage = await createMessage({
                content: newMessage,
                conversationId,
            });

            setMessages((prev) => [...prev, sentMessage]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isCurrentUser = message.userId === user?.id;

                        return (
                            <div
                                key={message.id}
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className="flex items-end">
                                    {!isCurrentUser && (
                                        <img
                                            src={message.user.profileImageUrl || 'https://via.placeholder.com/40'}
                                            alt={message.user.displayName || message.user.username}
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                    )}
                                    <div
                                        className={`px-4 py-2 rounded-lg max-w-xs break-words ${isCurrentUser
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-gray-200 rounded-bl-none'
                                            }`}
                                    >
                                        <p>{message.content}</p>
                                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {formatTime(message.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t p-4">
                <div className="flex">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border rounded-l-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={isSending || !newMessage.trim()}
                        className="bg-blue-500 text-white rounded-r-full px-6 py-2 font-medium hover:bg-blue-600 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MessageList; 