import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = '삭제',
    cancelText = '취소'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#1a1a2e] border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                        <AlertCircle size={28} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
                    <p className="mb-6 text-sm text-gray-400">{message}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-lg bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors border border-white/10"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 text-white/50 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};
