import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  X,
  ChevronDown,
  KeyRound,
  Terminal,
  Cpu,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onOpenProfileModal: () => void;
  onSelectAdminView: () => void;
  activeView: string;
  onSelectHome: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenGuideModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  onOpenAuthModal,
  onOpenProfileModal,
  onSelectAdminView,
  activeView,
  onSelectHome,
  searchQuery,
  setSearchQuery,
  onOpenGuideModal,
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#060a17]/90 border-b border-cyan-500/30 shadow-[0_4px_25px_rgba(6,182,212,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand / Logo - CYBER STYLE */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={onSelectHome}>
          <div className="relative group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 p-0.5 shadow-lg shadow-cyan-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-[#050814] rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent font-['Chakra_Petch',sans-serif]">
                  PX
                </span>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-cyan-300 via-teal-200 to-fuchsia-300 bg-clip-text text-transparent font-['Chakra_Petch',sans-serif]">
                PunX <span className="text-xs text-cyan-400 font-mono font-normal">CYBER</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                NODE: board007
              </span>
            </div>
            <p className="text-[10px] text-cyan-400/70 hidden sm:block font-mono tracking-tight">
              // เว็ปบอร์ดไซเบอร์พังค์ 007
            </p>
          </div>
        </div>

        {/* Search Bar - CYBER TERMINAL STYLE */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหากระทู้, #CYBER_TAG, สมาชิก..."
            className="w-full bg-[#080d21] text-sm text-cyan-100 placeholder-slate-500 pl-10 pr-4 py-2 rounded-xl border border-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-['Prompt',sans-serif] shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          


          {/* Test Guide button directly in Navbar */}
          {onOpenGuideModal && (
            <button
              onClick={onOpenGuideModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)] transition"
              title="ดูคู่มือทดสอบ 6 ฟีเจอร์ตามข้อกำหนด"
            >
              <span>🧪</span>
              <span className="hidden sm:inline font-['Chakra_Petch',sans-serif]">ทดสอบ 6 ข้อ</span>
              <span className="sm:hidden">6 ข้อ</span>
            </button>
          )}

          {/* New Thread Button (Form 1) */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 via-teal-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 active:scale-95 font-['Chakra_Petch',sans-serif]"
          >
            <PlusCircle className="w-4 h-4 text-black font-bold" />
            <span className="hidden sm:inline">ตั้งกระทู้</span>
          </button>

          {/* User Account / Login State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-[#0c142c] border border-cyan-500/40 transition"
              >
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-lg object-cover border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                />
                <span className="text-xs font-medium text-cyan-100 hidden lg:inline max-w-[100px] truncate">
                  {user.displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#090e1f] border border-cyan-500/50 shadow-2xl p-2 z-50 animate-in fade-in cyber-glow-cyan"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="p-2 border-b border-cyan-500/20">
                    <div className="font-bold text-white text-sm truncate font-['Chakra_Petch',sans-serif]">{user.displayName}</div>
                    <div className="text-xs text-cyan-400 font-mono">@{user.username}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        user.role === 'admin' 
                          ? 'bg-fuchsia-950 text-fuchsia-200 border border-fuchsia-500/60' 
                          : 'bg-cyan-950 text-cyan-200 border border-cyan-500/60'
                      }`}>
                        {user.role === 'admin' ? '🛡️ แอดมิน (Admin)' : '👤 สมาชิก (User)'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={onOpenProfileModal}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-cyan-950/60 rounded-xl flex items-center gap-2 font-['Prompt',sans-serif]"
                    >
                      <UserIcon className="w-4 h-4 text-cyan-400" />
                      โปรไฟล์ & ข้อมูลส่วนบุคคล (Masked PII)
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={onSelectAdminView}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-fuchsia-300 hover:bg-fuchsia-950/80 rounded-xl flex items-center gap-2 font-['Chakra_Petch',sans-serif]"
                      >
                        <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
                        แดชบอร์ดผู้ดูแลระบบ (Admin Portal)
                      </button>
                    )}

                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-xl flex items-center gap-2 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="text-xs font-bold px-3 py-2 rounded-xl text-cyan-200 hover:bg-cyan-950/50 transition border border-transparent hover:border-cyan-500/40 font-['Chakra_Petch',sans-serif]"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] transition font-['Chakra_Petch',sans-serif]"
              >
                สมัครสมาชิก
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
