import api from './axios';

export interface Conversation {
    id: string;
    createdAt: string;
    updatedAt: string;
    participants: {
        id: string;
        userId: string;
        conversationId: string;
        joinedAt: string;
        user: {
            id: string;
            username: string;
            displayName?: string;
            profileImageUrl?: string;
            isVerified: boolean;
        };
    }[];
    messages: Message[];
    _count: {
        messages: number;
    };
}

export interface Message {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    conversationId: string;
    isRead: boolean;
    user: {
        id: string;
        username: string;
        displayName?: string;
        profileImageUrl?: string;
        isVerified: boolean;
    };
}

export interface CreateConversationData {
    participantIds: string[];
}

export interface CreateMessageData {
    content: string;
    conversationId: string;
}

export const createConversation = async (data: CreateConversationData): Promise<Conversation> => {
    const response = await api.post<Conversation>('/messages/conversations', data);
    return response.data;
};

export const getConversations = async (): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>('/messages/conversations');
    return response.data;
};

export const getConversation = async (id: string): Promise<Conversation> => {
    const response = await api.get<Conversation>(`/messages/conversations/${id}`);
    return response.data;
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/messages/conversations/${conversationId}/messages`);
    return response.data;
};

export const createMessage = async (data: CreateMessageData): Promise<Message> => {
    const response = await api.post<Message>('/messages', data);
    return response.data;
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/messages/unread');
    return response.data;
}; 