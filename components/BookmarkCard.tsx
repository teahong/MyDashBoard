import React from 'react';
import { ExternalLink, Edit2, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Bookmark } from '../types';

interface Props {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (id: string) => void;
}

export const BookmarkCard: React.FC<Props> = ({ bookmark, onEdit, onDelete }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(bookmark);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(bookmark.id);
  };

  // Dynamic Icon Rendering
  // 아이콘 이름을 기반으로 Lucide 아이콘 컴포넌트를 동적으로 가져옵니다. 
  // 아이콘이 없거나 유효하지 않은 경우 기본 지구본(Globe) 아이콘을 사용합니다.
  const IconComponent = bookmark.iconName && (Icons as any)[bookmark.iconName]
    ? (Icons as any)[bookmark.iconName]
    : Icons.Globe; // Default fallback

  // XSS 방지: javascript: 프로토콜 차단
  const isSafeUrl = (url: string) => {
    const lowerUrl = url.trim().toLowerCase();
    return !lowerUrl.startsWith('javascript:');
  };

  const secureHref = isSafeUrl(bookmark.url) ? bookmark.url : '#';

  return (
    <a
      href={secureHref}
      onClick={(e) => {
        if (secureHref === '#') {
          e.preventDefault();
          alert('안전하지 않은 주소입니다.');
        }
      }}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/20 aspect-square p-3"
    >
      {/* Icon Area - Centered and Large */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative p-6 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
          <IconComponent size={52} strokeWidth={1.5} className="text-white drop-shadow-lg" />
        </div>
      </div>

      {/* Text Area */}
      <div className="mt-1 text-center w-full z-10">
        <h3 className="text-base font-bold text-white tracking-wide group-hover:text-purple-200 transition-colors line-clamp-1">
          {bookmark.title}
        </h3>
      </div>

      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Actions (Only visible on hover) */}
      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-white hover:text-black hover:scale-110 transition-all backdrop-blur-sm border border-white/10"
              title="수정"
              type="button" // Prevent navigation
            >
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-red-500 hover:text-white hover:scale-110 transition-all backdrop-blur-sm border border-white/10"
              title="삭제"
              type="button" // Prevent navigation
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </a>
  );
};