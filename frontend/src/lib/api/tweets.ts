import api from './axios';

export interface Tweet {
    id: string;
    content: string;
    images: string[];
    videoUrl?: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    retweetId?: string;
    replyToId?: string;
    user: {
        id: string;
        username: string;
        displayName?: string;
        profileImageUrl?: string;
        isVerified: boolean;
    };
    likes: { userId: string }[];
    _count: {
        comments: number;
        likes: number;
        retweets: number;
    };
    poll?: {
        id: string;
        question: string;
        expiresAt: string;
        options: {
            id: string;
            text: string;
            responses?: { userId: string }[];
            _count: {
                responses: number;
            };
        }[];
        _count: {
            options: number;
            responses: number;
        };
    };
    retweet?: Tweet;
    replyTo?: Tweet;
}

export interface CreateTweetData {
    content: string;
    images?: string[];
    videoUrl?: string;
    poll?: {
        question: string;
        options: string[];
        expiresAt: string;
    };
    retweetId?: string;
    replyToId?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export const createTweet = async (data: CreateTweetData): Promise<Tweet> => {
    const response = await api.post<Tweet>('/tweets', data);
    return response.data;
};

export const getTweets = async (page = 1, limit = 10): Promise<PaginatedResponse<Tweet>> => {
    const response = await api.get<PaginatedResponse<Tweet>>(`/tweets?page=${page}&limit=${limit}`);
    return response.data;
};

export const getTweet = async (id: string): Promise<Tweet> => {
    const response = await api.get<Tweet>(`/tweets/${id}`);
    return response.data;
};

export const updateTweet = async (id: string, data: Partial<CreateTweetData>): Promise<Tweet> => {
    const response = await api.patch<Tweet>(`/tweets/${id}`, data);
    return response.data;
};

export const deleteTweet = async (id: string): Promise<void> => {
    await api.delete(`/tweets/${id}`);
};

export const likeTweet = async (id: string): Promise<void> => {
    await api.post(`/tweets/${id}/like`);
};

export const unlikeTweet = async (id: string): Promise<void> => {
    await api.delete(`/tweets/${id}/like`);
};

export const getTweetLikes = async (id: string): Promise<{ user: Tweet['user'] }[]> => {
    const response = await api.get<{ user: Tweet['user'] }[]>(`/tweets/${id}/likes`);
    return response.data;
};

export const getTweetReplies = async (id: string, page = 1, limit = 10): Promise<PaginatedResponse<Tweet>> => {
    const response = await api.get<PaginatedResponse<Tweet>>(`/tweets/${id}/replies?page=${page}&limit=${limit}`);
    return response.data;
};

export const getUserTweets = async (userId: string, page = 1, limit = 10): Promise<PaginatedResponse<Tweet>> => {
    const response = await api.get<PaginatedResponse<Tweet>>(`/tweets/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
};

export const getUserFeed = async (page = 1, limit = 10): Promise<PaginatedResponse<Tweet>> => {
    const response = await api.get<PaginatedResponse<Tweet>>(`/tweets/feed/me?page=${page}&limit=${limit}`);
    return response.data;
};

export const respondToPoll = async (optionId: string): Promise<void> => {
    await api.post(`/tweets/poll/option/${optionId}/respond`);
};

export const removePollResponse = async (pollId: string): Promise<void> => {
    await api.delete(`/tweets/poll/${pollId}/response`);
};

export const searchTweets = async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<Tweet>> => {
    const response = await api.get<PaginatedResponse<Tweet>>(`/tweets/search/${query}?page=${page}&limit=${limit}`);
    return response.data;
};

export const getTweetsByHashtag = async (tag: string, page = 1, limit = 10): Promise<PaginatedResponse<Tweet>> => {
    const response = await api.get<PaginatedResponse<Tweet>>(`/tweets/hashtag/${tag}?page=${page}&limit=${limit}`);
    return response.data;
}; 