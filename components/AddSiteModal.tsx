import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Bookmark } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (site: Omit<Bookmark, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
    initialData?: Bookmark | null;
}

// Popular icons to choose from (expanded to 40+)
const POPULAR_ICONS = [
    'Globe', 'BookOpen', 'GraduationCap', 'Building2', 'Briefcase',
    'MessageSquare', 'ClipboardList', 'Calendar', 'CheckSquare',
    'Search', 'ShoppingBag', 'CreditCard', 'Monitor', 'IceCream2',
    'Music', 'Video', 'Image', 'FileText', 'Mail', 'Github',
    'Smartphone', 'Tv', 'Gamepad2', 'Headphones', 'Speaker',
    'Camera', 'Palette', 'Map', 'Navigation', 'Rocket',
    'Plane', 'Train', 'Car', 'Bike', 'Heart',
    'Star', 'Smile', 'Sun', 'Moon', 'Cloud',
    'Zap', 'Flame', 'Coffee', 'Pizza', 'Utensils',
    'Code2', 'Database', 'Cpu', 'Wifi', 'Lock'
].sort();

export const AddSiteModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        iconName: 'Globe'
    });
    const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    title: initialData.title,
                    url: initialData.url,
                    iconName: initialData.iconName || 'Globe'
                });
            } else {
                setFormData({ title: '', url: '', iconName: 'Globe' });
            }
            setIsIconDropdownOpen(false);
        }
    }, [isOpen, initialData]);

    const handleAutoSelectIcon = (input: string, type: 'url' | 'title') => {
        const lowerInput = input.toLowerCase();
        let suggestedIcon = formData.iconName;

        if (lowerInput.includes('school') || lowerInput.includes('edu') || lowerInput.includes('class')) suggestedIcon = 'GraduationCap';
        else if (lowerInput.includes('work') || lowerInput.includes('job') || lowerInput.includes('office')) suggestedIcon = 'Briefcase';
        else if (lowerInput.includes('padlet') || lowerInput.includes('board')) suggestedIcon = 'ClipboardList';
        else if (lowerInput.includes('ice') || lowerInput.includes('screan')) suggestedIcon = 'IceCream2';
        else if (lowerInput.includes('mail')) suggestedIcon = 'Mail';
        else if (lowerInput.includes('shop') || lowerInput.includes('store')) suggestedIcon = 'ShoppingBag';
        else if (lowerInput.includes('bank') || lowerInput.includes('pay')) suggestedIcon = 'CreditCard';
        else if (lowerInput.includes('tube') || lowerInput.includes('video')) suggestedIcon = 'Video';
        else if (lowerInput.includes('game')) suggestedIcon = 'Gamepad2';
        else if (lowerInput.includes('music')) suggestedIcon = 'Music';
        else if (lowerInput.includes('code') || lowerInput.includes('github')) suggestedIcon = 'Code2';
        else if (lowerInput.includes('travel') || lowerInput.includes('map')) suggestedIcon = 'Map';

        if (suggestedIcon !== formData.iconName) {
            setFormData(prev => ({ ...prev, iconName: suggestedIcon }));
        }
    };

    const handleChange = (field: 'title' | 'url', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (!initialData) {
            handleAutoSelectIcon(value, field);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                title: formData.title,
                url: formData.url,
                description: '', // Desc is removed from form
                iconName: formData.iconName,
                imageUrl: '' // Clear legacy image
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert('사이트 저장 실패');
        } finally {
            setLoading(false);
        }
    };

    const SelectedIcon = (Icons as any)[formData.iconName] || Icons.Globe;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#1a1a2e] border border-white/20 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-5 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">{initialData ? '사이트 수정' : '새 사이트 추가'}</h2>
                    <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Icon Selection Dropdown */}
                    <div className="space-y-2 relative">
                        <label className="block text-sm font-medium text-gray-400">아이콘 선택</label>
                        <button
                            type="button"
                            onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                            className="w-full flex items-center justify-between rounded-lg bg-black/30 border border-white/10 p-3 text-white hover:border-purple-500/50 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                                    <SelectedIcon size={24} />
                                </div>
                                <span className="font-medium">{formData.iconName}</span>
                            </div>
                            <Icons.ChevronDown size={20} className={`text-gray-500 transition-transform ${isIconDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isIconDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-60 overflow-y-auto rounded-xl bg-[#252545] border border-white/20 shadow-2xl p-2 grid grid-cols-5 gap-2 animate-in slide-in-from-top-2 duration-200">
                                {POPULAR_ICONS.map(iconName => {
                                    const Icon = (Icons as any)[iconName];
                                    if (!Icon) return null;
                                    return (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, iconName }));
                                                setIsIconDropdownOpen(false);
                                            }}
                                            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${formData.iconName === iconName ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                            title={iconName}
                                        >
                                            <Icon size={24} />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-400">사이트 이름</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => handleChange('title', e.target.value)}
                            className="w-full rounded-lg bg-black/30 border border-white/10 p-4 text-white placeholder-white/20 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-medium text-lg"
                            placeholder="예: 업무 포탈"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-400">URL</label>
                        <input
                            required
                            type="url"
                            value={formData.url}
                            onChange={e => handleChange('url', e.target.value)}
                            className="w-full rounded-lg bg-black/30 border border-white/10 p-4 text-white placeholder-white/20 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm"
                            placeholder="https://..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 p-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        <span>{initialData ? '수정 완료' : '추가하기'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
