import api from './axios';

export interface User {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    bio?: string;
    profileImageUrl?: string;
    bannerImageUrl?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUserData {
    email?: string;
    username?: string;
    displayName?: string;
    password?: string;
    bio?: string;
    profileImageUrl?: string;
    bannerImageUrl?: string;
}

export interface FollowData {
    id: string;
    followerId: string;
    followingId: string;
    following: {
        id: string;
        username: string;
        displayName?: string;
        profileImageUrl?: string;
        isVerified: boolean;
    };
}

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
};

export const getUser = async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
};

export const getUserByUsername = async (username: string): Promise<User> => {
    const response = await api.get<User>(`/users/username/${username}`);
    return response.data;
};

export const updateUser = async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
};

export const getFollowers = async (id: string): Promise<FollowData[]> => {
    const response = await api.get<FollowData[]>(`/users/${id}/followers`);
    return response.data;
};

export const getFollowing = async (id: string): Promise<FollowData[]> => {
    const response = await api.get<FollowData[]>(`/users/${id}/following`);
    return response.data;
};

export const followUser = async (id: string): Promise<FollowData> => {
    const response = await api.post<FollowData>(`/users/${id}/follow`);
    return response.data;
};

export const unfollowUser = async (id: string): Promise<void> => {
    await api.delete(`/users/${id}/follow`);
}; 