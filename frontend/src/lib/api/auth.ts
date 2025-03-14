import api from './axios';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    displayName?: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        username: string;
        displayName?: string;
        profileImageUrl?: string;
        bannerImageUrl?: string;
        bio?: string;
        isVerified: boolean;
        createdAt: string;
        updatedAt: string;
    };
    access_token: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);

    // Store the token in localStorage
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
    }

    return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);

    // Store the token in localStorage
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
    }

    return response.data;
};

export const logout = (): void => {
    localStorage.removeItem('token');
};

export const getProfile = async (): Promise<AuthResponse['user']> => {
    const response = await api.get<AuthResponse['user']>('/auth/profile');
    return response.data;
}; 