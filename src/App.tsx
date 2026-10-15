import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { ThreadCard } from './components/ThreadCard';
import { CreateThreadModal } from './components/CreateThreadModal';
import { EditThreadModal } from './components/EditThreadModal';
import { ThreadDetailModal } from './components/ThreadDetailModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { ReportModal } from './components/ReportModal';
import { AdminDashboard } from './components/AdminDashboard';
import { TestingGuideModal } from './components/TestingGuideModal';
import { Thread, RoomCategory } from './types';
import { api } from './services/api';
import { 
  PlusCircle, 
  Flame, 
  Clock, 
  Eye, 
  Sparkles, 
  Layers, 
  MessageSquare, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

function MainApp() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [rooms, setRooms] = useState<RoomCategory[]>([]);
  const [activeRoom, setActiveRoom] = useState('all');
  const [activeView, setActiveView] = useState<'home' | 'trending' | 'my-threads' | 'admin'>('home');
  const [sortFilter, setSortFilter] = useState<'newest' | 'hot' | 'views'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedThreadForDetail, setSelectedThreadForDetail] = useState<Thread | null>(null);
  const [selectedThreadForEdit, setSelectedThreadForEdit] = useState<Thread | null>(null);
  const [selectedThreadForReport, setSelectedThreadForReport] = useState<Thread | null>(null);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Initial Rooms Fetch
  useEffect(() => {
    api.getRooms().then(setRooms).catch(console.error);
  }, []);

  // Fetch threads whenever filters change
  const fetchThreads = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeRoom !== 'all') params.room = activeRoom;
      if (activeTag) params.tag = activeTag;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      if (activeView === 'trending') {
        params.sort = 'hot';
      } else if (activeView === 'my-threads' && user) {
        params.authorId = user.id;
      } else {
        params.sort = sortFilter;
      }

      const data = await api.getThreads(params);
      setThreads(data);
    } catch (err) {
      console.error('Failed to fetch threads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView !== 'admin') {
      fetchThreads();
    }
  }, [activeRoom, activeView, sortFilter, searchQuery, activeTag, user?.id]);

  // Thread CRUD handlers
  const handleThreadCreated = (newThread: Thread) => {
    setThreads(prev => [newThread, ...prev]);
    // Also select the new thread to view details right away
    setSelectedThreadForDetail(newThread);
  };

  const handleThreadUpdated = (updatedThread: Thread) => {
    setThreads(prev => prev.map(t => (t.id === updatedThread.id ? updatedThread : t)));
    if (selectedThreadForDetail?.id === updatedThread.id) {
      setSelectedThreadForDetail(updatedThread);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      await api.deleteThread(threadId);
      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (selectedThreadForDetail?.id === threadId) {
        setSelectedThreadForDetail(null);
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบกระทู้');
    }
  };

  const handleReact = async (threadId: string, emotion?: string, type?: 'emotion' | 'repost' | 'bookmark') => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await api.reactThread(threadId, { emotion, type });
      setThreads(prev => prev.map(t => (t.id === threadId ? res.thread : t)));
      if (selectedThreadForDetail?.id === threadId) {
        setSelectedThreadForDetail(res.thread);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const currentRoomInfo = rooms.find(r => r.id === activeRoom) || rooms[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        onOpenCreateModal={() => {
          if (!user) {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          } else {
            setCreateModalOpen(true);
          }
        }}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onSelectAdminView={() => setActiveView('admin')}
        activeView={activeView}
        onSelectHome={() => {
          setActiveView('home');
          setActiveRoom('all');
          setActiveTag('');
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenGuideModal={() => setGuideModalOpen(true)}
      />

      {/* Main Body Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar: Pantip Rooms & Nav */}
        <SidebarLeft
          rooms={rooms}
          activeRoom={activeRoom}
          onSelectRoom={(roomId) => {
            setActiveRoom(roomId);
            setActiveTag('');
            if (activeView === 'admin') setActiveView('home');
          }}
          activeView={activeView}
          onSelectView={(v) => {
            setActiveView(v as any);
            setActiveTag('');
          }}
          onOpenAuthModal={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
          onOpenGuideModal={() => setGuideModalOpen(true)}
        />

        {/* Center Main Content */}
        <main className="flex-1 min-w-0 space-y-5">

          {activeView === 'admin' ? (
            <AdminDashboard onBackToHome={() => setActiveView('home')} />
          ) : (
            <>
              {/* Room Banner / Feed Header - CYBER HUD */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#0b1329] via-[#090e1f] to-[#140b24] border border-cyan-500/30 rounded-2xl p-5 shadow-xl cyber-glow-cyan">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">{currentRoomInfo?.icon || '🌐'}</span>
                      <h2 className="text-lg sm:text-xl font-black text-white font-['Chakra_Petch',sans-serif] tracking-wide flex items-center gap-2">
                        {activeView === 'trending'
                          ? '🔥 กระทู้มาแรง & ติดเทรนด์ X'
                          : activeView === 'my-threads'
                          ? '📑 กระทู้ของฉัน (My Threads)'
                          : currentRoomInfo?.name || 'รวมทุกห้อง'}
                        <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                          CYBER.NET
                        </span>
                      </h2>
                    </div>
                    <p className="text-xs text-cyan-300/80 mt-1 font-['Prompt',sans-serif]">
                      {activeView === 'trending'
                        ? 'กระทู้ที่ได้รับการโต้ตอบ รีโพสต์ และแสดงความรู้สึกสูงสุดใน 24 ชั่วโมง'
                        : activeView === 'my-threads'
                        ? 'กระทู้ที่คุณเป็นเจ้าของ สามารถแก้ไขและจัดการได้ตามสิทธิ์'
                        : currentRoomInfo?.description || 'ศูนย์รวมการพูดคุยและแลกเปลี่ยนความเห็นสไตล์พันทิปผสมเอ็กซ์'}
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <button
                    onClick={() => {
                      if (!user) {
                        setAuthModalMode('login');
                        setAuthModalOpen(true);
                      } else {
                        setCreateModalOpen(true);
                      }
                    }}
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-black shadow-lg shadow-cyan-500/30 transition whitespace-nowrap font-['Chakra_Petch',sans-serif]"
                  >
                    <PlusCircle className="w-4 h-4 font-bold" />
                    <span>ตั้งกระทู้ใหม่</span>
                  </button>
                </div>

                {/* Active Tag filter indicator */}
                {activeTag && (
                  <div className="mt-3 pt-3 border-t border-cyan-500/20 flex items-center justify-between">
                    <span className="text-xs text-cyan-300 font-mono">
                      // FILTER_TAG: <strong className="text-white font-mono">{activeTag}</strong>
                    </span>
                    <button
                      onClick={() => setActiveTag('')}
                      className="text-xs text-slate-400 hover:text-white underline font-mono"
                    >
                      CLEAR_FILTER [X]
                    </button>
                  </div>
                )}
              </div>

              {/* X-Style Quick Post Box - CYBER TERMINAL */}
              <div className="bg-[#0a0f1d]/90 border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex items-center gap-3 cyber-glow-cyan">
                <img
                  src={user?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=guest'}
                  alt="Avatar"
                  className="w-10 h-10 rounded-xl object-cover border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                />
                <button
                  onClick={() => {
                    if (!user) {
                      setAuthModalMode('login');
                      setAuthModalOpen(true);
                    } else {
                      setCreateModalOpen(true);
                    }
                  }}
                  className="flex-1 text-left bg-[#060a17] hover:bg-[#080d21] text-xs sm:text-sm text-cyan-200/60 px-4 py-2.5 rounded-xl border border-cyan-500/30 hover:border-cyan-400 transition font-['Prompt',sans-serif]"
                >
                  {user ? `คุณกำลังคิดอะไรอยู่ @${user.username}? หรืออยากตั้งคำถามในโลกไซเบอร์...` : 'เข้าสู่ระบบเพื่อร่วมตั้งกระทู้และส่งความคิดเห็น...'}
                </button>
              </div>

              {/* Feed Sort Tabs */}
              {activeView !== 'trending' && activeView !== 'my-threads' && (
                <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSortFilter('newest')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        sortFilter === 'newest'
                          ? 'bg-purple-950 text-purple-200 border border-purple-700/60'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>ล่าสุด</span>
                    </button>

                    <button
                      onClick={() => setSortFilter('hot')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        sortFilter === 'hot'
                          ? 'bg-purple-950 text-purple-200 border border-purple-700/60'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>กระทู้เด็ด (Hot)</span>
                    </button>

                    <button
                      onClick={() => setSortFilter('views')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        sortFilter === 'views'
                          ? 'bg-purple-950 text-purple-200 border border-purple-700/60'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>ยอดดูสูงสุด</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    พบ {threads.length} กระทู้
                  </span>
                </div>
              )}

              {/* Threads Feed */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-slate-900/60 border border-purple-900/30 rounded-2xl p-5 animate-pulse space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800" />
                        <div className="space-y-1.5 flex-1">
                          <div className="w-32 h-3.5 bg-slate-800 rounded" />
                          <div className="w-20 h-2.5 bg-slate-800 rounded" />
                        </div>
                      </div>
                      <div className="w-3/4 h-5 bg-slate-800 rounded" />
                      <div className="w-full h-12 bg-slate-800 rounded" />
                    </div>
                  ))}
                </div>
              ) : threads.length === 0 ? (
                <div className="bg-slate-900/60 border border-purple-900/30 rounded-2xl p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-950 flex items-center justify-center mx-auto text-purple-400 mb-3">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">ไม่พบกระทู้ที่ตรงกับเงื่อนไข</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    ยังไม่มีกระทู้ในหมวดหมู่นี้ เป็นคนแรกที่เริ่มเปิดบทสนทนา!
                  </p>
                  <button
                    onClick={() => {
                      if (!user) {
                        setAuthModalMode('login');
                        setAuthModalOpen(true);
                      } else {
                        setCreateModalOpen(true);
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow transition"
                  >
                    ตั้งกระทู้ใหม่
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {threads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      onOpenDetail={(t) => setSelectedThreadForDetail(t)}
                      onOpenEdit={(t) => setSelectedThreadForEdit(t)}
                      onDelete={handleDeleteThread}
                      onReact={handleReact}
                      onReport={(t) => setSelectedThreadForReport(t)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

        </main>

        {/* Right Sidebar: Trends & Verification Checklist */}
        <SidebarRight
          onSelectTag={(tag) => {
            setActiveTag(tag);
            if (activeView === 'admin') setActiveView('home');
          }}
          activeTag={activeTag}
          onOpenGuideModal={() => setGuideModalOpen(true)}
        />

      </div>

      {/* Modals */}
      <TestingGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        onOpenCreateThread={() => {
          if (!user) {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          } else {
            setCreateModalOpen(true);
          }
        }}
        onOpenAdmin={() => setActiveView('admin')}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
      />
      <CreateThreadModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        rooms={rooms}
        onCreated={handleThreadCreated}
        defaultRoom={activeRoom}
      />

      {selectedThreadForEdit && (
        <EditThreadModal
          isOpen={Boolean(selectedThreadForEdit)}
          onClose={() => setSelectedThreadForEdit(null)}
          thread={selectedThreadForEdit}
          rooms={rooms}
          onUpdated={handleThreadUpdated}
        />
      )}

      {selectedThreadForDetail && (
        <ThreadDetailModal
          isOpen={Boolean(selectedThreadForDetail)}
          onClose={() => setSelectedThreadForDetail(null)}
          thread={selectedThreadForDetail}
          onThreadUpdated={handleThreadUpdated}
          onOpenEdit={(t) => setSelectedThreadForEdit(t)}
          onDeleteThread={handleDeleteThread}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      <ReportModal
        isOpen={Boolean(selectedThreadForReport)}
        onClose={() => setSelectedThreadForReport(null)}
        thread={selectedThreadForReport}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
