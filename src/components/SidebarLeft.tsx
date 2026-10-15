import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RoomCategory } from '../types';
import { 
  Home, 
  Flame, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Cpu,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

interface SidebarLeftProps {
  rooms: RoomCategory[];
  activeRoom: string;
  onSelectRoom: (roomId: string) => void;
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenAuthModal: () => void;
  onOpenGuideModal: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  rooms,
  activeRoom,
  onSelectRoom,
  activeView,
  onSelectView,
  onOpenAuthModal,
  onOpenGuideModal,
}) => {
  const { user } = useAuth();

  return (
    <aside className="w-full lg:w-64 space-y-5">
      
      {/* Primary Navigation - CYBER MAIN MENU */}
      <div className="bg-[#0a0f1d]/90 border border-cyan-500/30 rounded-2xl p-3 shadow-xl backdrop-blur-md cyber-glow-cyan">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-cyan-400 flex items-center justify-between font-mono">
          <span>// เมนูหลัก (NAV)</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>

        <div className="space-y-1.5 mt-2">
          
          {/* Requirement: Move the 6-Feature Testing Guide to Main Menu */}
          <button
            onClick={onOpenGuideModal}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition bg-gradient-to-r from-cyan-950 via-indigo-950 to-fuchsia-950 border border-cyan-400/60 text-cyan-200 hover:text-white hover:border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] group transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base group-hover:scale-125 transition transform">🧪</span>
              <div className="text-left">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="font-['Chakra_Petch',sans-serif]">ทดสอบ 6 ฟีเจอร์</span>
                  <span className="text-[9px] bg-cyan-900 text-cyan-300 border border-cyan-500/60 px-1 rounded font-mono font-bold">
                    6/6
                  </span>
                </div>
                <div className="text-[10px] text-cyan-300/80 font-normal">ทดสอบได้ทันที 1 คลิก</div>
              </div>
            </div>
            <span className="text-cyan-400 group-hover:translate-x-1 transition transform font-bold">→</span>
          </button>

          {/* Timeline Feed */}
          <button
            onClick={() => onSelectView('home')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeView === 'home'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30 border border-cyan-400/50'
                : 'text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-300'
            }`}
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span className="font-['Chakra_Petch',sans-serif]">หน้าแรก (Timeline)</span>
          </button>

          {/* Trending Hot */}
          <button
            onClick={() => onSelectView('trending')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeView === 'trending'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/30 border border-pink-400/50'
                : 'text-slate-300 hover:bg-pink-950/40 hover:text-pink-300'
            }`}
          >
            <Flame className="w-4 h-4 text-pink-400" />
            <span className="font-['Chakra_Petch',sans-serif]">กระทู้เด็ด / มาแรง (X Hot)</span>
          </button>

          {/* My Posts */}
          <button
            onClick={() => {
              if (!user) {
                onOpenAuthModal();
              } else {
                onSelectView('my-threads');
              }
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeView === 'my-threads'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/30 border border-cyan-400/50'
                : 'text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="font-['Chakra_Petch',sans-serif]">กระทู้ของฉัน (My Posts)</span>
            </div>
            {!user && <Lock className="w-3 h-3 text-slate-500" />}
          </button>

          {/* Admin Dashboard */}
          <button
            onClick={() => onSelectView('admin')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeView === 'admin'
                ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 text-white shadow-md shadow-purple-500/40 border border-fuchsia-400/50'
                : 'text-purple-300 hover:bg-purple-950/60 hover:text-purple-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
              <span className="font-['Chakra_Petch',sans-serif]">แดชบอร์ดแอดมิน (Admin)</span>
            </div>
            {user?.role === 'admin' ? (
              <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 px-1.5 py-0.5 rounded font-mono">
                ADMIN
              </span>
            ) : (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                <Lock className="w-2.5 h-2.5" /> LOCK
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pantip Rooms List with Cyberpunk styling */}
      <div className="bg-[#0a0f1d]/90 border border-cyan-500/20 rounded-2xl p-3 shadow-lg backdrop-blur-md">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between font-mono">
          <span>// ห้องสนทนา (ROOMS)</span>
          <span className="text-[10px] text-slate-400 font-normal">7 NODES</span>
        </div>
        <div className="space-y-1 mt-1.5">
          {rooms.map((room) => {
            const isSelected = activeRoom === room.id && activeView !== 'admin';
            return (
              <button
                key={room.id}
                onClick={() => {
                  onSelectRoom(room.id);
                  if (activeView === 'admin') onSelectView('home');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition text-left group ${
                  isSelected
                    ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/60 shadow-sm shadow-cyan-500/20 font-semibold'
                    : 'text-slate-300 hover:bg-cyan-950/30 hover:text-white'
                }`}
              >
                <span className="text-base group-hover:scale-110 transition transform">{room.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{room.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{room.englishName}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cyber Masking & PDPA Card */}
      <div className="bg-gradient-to-br from-[#0c1427] to-[#120f29] border border-cyan-500/30 rounded-2xl p-4 text-xs text-slate-300 shadow-md">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-1.5 font-mono">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>[PDPA // DATA_MASKING]</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-['Prompt',sans-serif]">
          เบอร์โทรและอีเมลจะถูก Masking อัตโนมัติเป็น <span className="text-cyan-300 font-mono">08x-***-xxxx</span> ให้บุคคลทั่วไป เพื่อความปลอดภัยระดับ Cyber Security
        </p>
      </div>

    </aside>
  );
};
