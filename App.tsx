import React, { useEffect, useState } from 'react';
import { BOOKMARKS as DEFAULT_BOOKMARKS } from './constants';
import { BookmarkCard } from './components/BookmarkCard';
import { TodoPanel } from './components/TodoPanel';
import { LoginButton } from './components/LoginButton';
import { AddSiteModal } from './components/AddSiteModal';
import { Clock, Plus } from 'lucide-react';
import { ConfirmModal } from './components/ConfirmModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import * as authService from './services/authService';
import * as fireStoreService from './services/fireStoreService';
import { User } from 'firebase/auth';
import { Bookmark } from './types';

function App() {
  const [time, setTime] = useState(new Date());
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Bookmark[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Bookmark | null>(null);
  const [loadingSites, setLoadingSites] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [siteToDeleteId, setSiteToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges(async (u) => {
      setUser(u);
      if (u) {
        setLoadingSites(true);
        try {
          const userSites = await fireStoreService.getSites(u.uid);
          setSites(userSites);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingSites(false);
          setAuthLoading(false);
        }
      } else {
        setSites([]);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
  };

  const openAddModal = () => {
    setEditingSite(null);
    setIsModalOpen(true);
  };

  const openEditModal = (site: Bookmark) => {
    setEditingSite(site);
    setIsModalOpen(true);
  };

  const handleSaveSite = async (siteData: Omit<Bookmark, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;

    if (editingSite) {
      // Update
      await fireStoreService.updateSite(editingSite.id, siteData);
    } else {
      // Create
      await fireStoreService.addSite(user.uid, siteData);
    }

    // Refresh
    const updated = await fireStoreService.getSites(user.uid);
    setSites(updated);
    setEditingSite(null);
  };

  const handleDeleteSite = (id: string) => {
    setSiteToDeleteId(id);
  };

  const confirmDeleteSite = async () => {
    if (!user || !siteToDeleteId) return;
    await fireStoreService.deleteSite(siteToDeleteId);
    const updated = await fireStoreService.getSites(user.uid);
    setSites(updated);
    setSiteToDeleteId(null);
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination || !user) return;

    // 순서가 변하지 않았으면 리턴
    if (result.destination.index === result.source.index) return;

    const items: Bookmark[] = Array.from(sites);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 즉시 상태 업데이트 (낙관적 UI)
    setSites(items);

    // Firebase에 변경된 모든 순서 저장
    try {
      await fireStoreService.updateSitesOrder(items);
    } catch (error) {
      console.error("Failed to save reordered sites:", error);
      // 에러 시 데이터 재로딩
      const original = await fireStoreService.getSites(user.uid);
      setSites(original);
    }
  };

  const displaySites: Bookmark[] = user ? sites : [];

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-hidden relative selection:bg-purple-500/30">
      {/* Dynamic Space Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-80 z-0 animate-pulse-slow"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black/60 to-black/80 z-0"></div>

      {/* Floating Stars/Particles */}
      <div className="absolute inset-0 z-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Main Content Container */}
      <div className="relative z-10 flex h-screen w-full flex-col md:flex-row p-4 gap-6 md:p-8 lg:gap-10 max-w-[1920px] mx-auto">

        {/* Left Section: Welcome & Bookmarks */}
        <div className="flex flex-1 flex-col space-y-8 overflow-y-auto no-scrollbar pb-10">

          {/* Header Area */}
          <div className="flex items-start justify-between pl-2 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-300">
                <Clock size={20} />
                <span className="font-medium tracking-wider">{time.toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 drop-shadow-lg">
                {time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </h1>
              <p className="text-lg text-gray-300 max-w-md">
                {user ? '뽀글쌤님, 환영합니다! 🚀' : '오늘도 활기찬 하루 되세요! 🚀'}
              </p>
            </div>

            <LoginButton user={user} onLogin={handleLogin} onLogout={handleLogout} />
          </div>

          {/* Bookmarks Grid Header */}
          <div className="flex items-center justify-between pr-0 md:pr-10">
            <h2 className="text-xl font-bold text-white/90">즐겨찾기</h2>
            {user && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition-colors"
              >
                <Plus size={16} />
                <span>추가</span>
              </button>
            )}
          </div>

          {/* Bookmarks Grid with DND (Only if logged in) */}
          <div className="pr-0 md:pr-10 pb-4">
            {loadingSites ? (
              <div className="py-10 text-center text-white/50">사이트 불러오는 중...</div>
            ) : displaySites.length > 0 ? (
              user ? (
                // @ts-ignore
                <DragDropContext onDragEnd={onDragEnd}>
                  {/* @ts-ignore */}
                  <Droppable droppableId="bookmarks-grid" direction="horizontal">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4"
                      >
                        {displaySites.map((bookmark, index) => (
                          // @ts-ignore
                          <Draggable key={bookmark.id} draggableId={bookmark.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  zIndex: snapshot.isDragging ? 9999 : (provided.draggableProps.style?.zIndex || 'auto')
                                }}
                                className={`relative group ${snapshot.isDragging ? 'scale-[1.05] !opacity-100 shadow-2xl z-[9999]' : ''}`}
                              >
                                <BookmarkCard
                                  bookmark={bookmark}
                                  onEdit={openEditModal}
                                  onDelete={handleDeleteSite}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                // Guest View (No DND)
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                  {displaySites.map((bookmark) => (
                    <div key={bookmark.id} className="relative group">
                      <BookmarkCard bookmark={bookmark} />
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="py-10 flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/10 rounded-xl">
                <p>등록된 즐겨찾기가 없습니다.</p>
                <button onClick={openAddModal} className="mt-2 text-purple-400 hover:text-purple-300">사이트 추가하기</button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Todo / Calendar */}
        <div className="flex h-[60vh] md:h-auto w-full md:w-[400px] lg:w-[450px] flex-col shrink-0">
          <TodoPanel user={user} />
        </div>
      </div>

      <AddSiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSite}
        initialData={editingSite}
      />

      <ConfirmModal
        isOpen={!!siteToDeleteId}
        onClose={() => setSiteToDeleteId(null)}
        onConfirm={confirmDeleteSite}
        title="사이트 삭제"
        message="이 즐겨찾기를 정말 삭제할까요? 삭제 후에는 다시 복구할 수 없습니다."
      />
    </div>
  );
}

export default App;