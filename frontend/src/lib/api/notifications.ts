import api from './axios';

export interface Notification {
    id: string;
    type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'RETWEET' | 'MENTION' | 'SYSTEM';
    content: string;
    isRead: boolean;
    createdAt: string;
    userId: string;
    targetId?: string;
    tweetId?: string;
    target?: {
        id: string;
        username: string;
        displayName?: string;
        profileImageUrl?: string;
        isVerified: boolean;
    };
}

export const getNotifications = async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/notifications');
    return response.data;
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/notifications/unread');
    return response.data;
};

export const markAsRead = async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
    await api.patch('/notifications/read-all');
}; 