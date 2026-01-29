import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';

interface Props {
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
}

export const LoginButton: React.FC<Props> = ({ user, onLogin, onLogout }) => {
    if (user) {
        return (
            <button
                onClick={onLogout}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-all hover:bg-white/20 border border-white/10"
            >
                <img
                    src={user.photoURL || ''}
                    alt={user.displayName || 'User'}
                    className="h-6 w-6 rounded-full border border-white/30"
                />
                <span className="hidden sm:inline">로그아웃</span>
                <LogOut size={16} />
            </button>
        );
    }

    return (
        <button
            onClick={onLogin}
            className="flex items-center gap-2 rounded-full bg-blue-600/80 px-5 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-all hover:bg-blue-500 hover:shadow-blue-500/30 border border-blue-400/30"
        >
            <LogIn size={18} />
            <span>Google 로그인</span>
        </button>
    );
};
