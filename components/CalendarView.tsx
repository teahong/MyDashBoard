import React from 'react';
import { CalendarEvent } from '../types';
import { Calendar as CalendarIcon, Clock, ExternalLink } from 'lucide-react';

interface Props {
    events: CalendarEvent[];
    loading: boolean;
}

export const CalendarView: React.FC<Props> = ({ events, loading }) => {
    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center text-white/50">
                <div className="animate-pulse">일정을 불러오는 중...</div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-white/30 h-40">
                <CalendarIcon size={32} className="mb-2 opacity-50" />
                <p className="text-sm">예정된 일정이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4">
            {events.map((event) => {
                const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date || '');
                const isAllDay = !event.start.dateTime;

                return (
                    <div key={event.id} className="group relative overflow-hidden rounded-lg bg-white/5 p-3 hover:bg-white/10 transition-colors border border-white/5">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isAllDay ? 'bg-blue-400' : 'bg-purple-400'}`} />
                        <div className="pl-3 pr-6">
                            <h4 className="font-medium text-white/90 truncate text-sm">{event.summary}</h4>
                            <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
                                <Clock size={12} />
                                <span>
                                    {isAllDay
                                        ? start.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
                                        : `${start.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} ${start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
                                    }
                                </span>
                            </div>
                        </div>
                        {event.htmlLink && (
                            <a
                                href={event.htmlLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition-opacity p-2"
                                title="Google Calendar에서 보기"
                            >
                                <ExternalLink size={14} />
                            </a>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
