'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, User } from '@/lib/api/users';
import { createConversation } from '@/lib/api/messages';

const NewConversationForm: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                // Filter out current user
                const filteredUsers = data.filter((u) => u.id !== user?.id);
                setUsers(filteredUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [user]);

    const handleUserSelect = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedUsers.length === 0 || isCreating) return;

        setIsCreating(true);

        try {
            const conversation = await createConversation({
                participantIds: selectedUsers,
            });

            router.push(`/messages/${conversation.id}`);
        } catch (error) {
            console.error('Error creating conversation:', error);
            alert('Failed to create conversation. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const searchLower = searchQuery.toLowerCase();
        const usernameLower = user.username.toLowerCase();
        const displayNameLower = user.displayName?.toLowerCase() || '';

        return usernameLower.includes(searchLower) || displayNameLower.includes(searchLower);
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">New Conversation</h2>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="border rounded-lg overflow-hidden mb-4">
                    <div className="max-h-80 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                            <p className="p-4 text-gray-500">No users found</p>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b"
                                    onClick={() => handleUserSelect(user.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => { }}
                                        className="mr-3"
                                    />
                                    <img
                                        src={user.profileImageUrl || 'https://via.placeholder.com/40'}
                                        alt={user.displayName || user.username}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                    <div>
                                        <p className="font-bold">{user.displayName || user.username}</p>
                                        <p className="text-gray-500">@{user.username}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => router.push('/messages')}
                        className="text-blue-500 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={selectedUsers.length === 0 || isCreating}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isCreating ? 'Creating...' : 'Start conversation'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewConversationForm; 