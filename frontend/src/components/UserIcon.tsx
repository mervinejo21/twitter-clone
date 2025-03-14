import React from 'react';
import { User } from 'lucide-react';

interface UserIconProps {
    className?: string;
}

export const UserIcon: React.FC<UserIconProps> = ({ className }) => {
    return <User className={className || 'h-5 w-5'} />;
}; 