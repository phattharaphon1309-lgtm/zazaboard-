import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Thread } from '../types';
import { 
  Pin, 
  Lock, 
  MessageSquare, 
  Repeat2, 
  Bookmark, 
  Heart, 
  Eye, 
  EyeOff,
  MoreVertical, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  Share2, 
  Check, 
  AlertCircle
} from 'lucide-react';

interface ThreadCardProps {
  thread: Thread;
  onOpenDetail: (thread: Thread) => void;
  onOpenEdit: (thread: Thread) => void;
  onDelete: (threadId: string) => void;
  onReact: (threadId: string, emotion?: string, type?: 'emotion' | 'repost' | 'bookmark') => void;
  onReport: (thread: Thread) => void;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({
  thread,
  onOpenDetail,
  onOpenEdit,
  onDelete,
  onReact,
  onReport,
}) => {
  const { user } = useAuth();
  const [showEmotions, setShowEmotions] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ownershipNotice, setOwnershipNotice] = useState<string | null>(null);

  const isOwner = user?.id === thread.authorId;
  const isAdmin = user?.role === 'admin';
  const canModify = isOwner;
  const canDelete = isOwner || isAdmin;

  // Pantip emotion options
  const emotionsList = [
    { key: 'like', label: 'ถูกใจ', icon: '👍', color: 'text-cyan-400' },
    { key: 'love', label: 'หลงรัก', icon: '❤️', color: 'text-pink-400' },
    { key: 'laugh', label: 'ขำกลิ้ง', icon: '😂', color: 'text-amber-400' },
    { key: 'impressed', label: 'ทึ่ง', icon: '😲', color: 'text-purple-400' },
    { key: 'sad', label: 'ซึ้ง', icon: '🥺', color: 'text-teal-400' },
    { key: 'scare', label: 'สยอง', icon: '😱', color: 'text-emerald-400' },
  ];

  // Calculate total reactions
  const totalReactions = Object.values(thread.reactions || {}).reduce(
    (sum, arr) => sum + (arr ? arr.length : 0),
    0
  );

  const handleUnauthorizedEdit = () => {
    setOwnershipNotice('⚠️ คุณไม่มีสิทธิ์แก้ไขกระทู้นี้ เฉพาะเจ้าของกระทู้ (@' + thread.author.username + ') เท่านั้น');
    setTimeout(() => setOwnershipNotice(null), 3500);
  };

  const handleUnauthorizedDelete = () => {
    setOwnershipNotice('⚠️ คุณไม่มีสิทธิ์ลบกระทู้ของสมาชิกท่านอื่น (ตามกฎความเป็นเจ้าของข้อมูล)');
    setTimeout(() => setOwnershipNotice(null), 3500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '#' + thread.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Masking presentation
  const isSelfOrAdmin = isOwner || isAdmin;
  const displayPhone = (revealedPhone && isSelfOrAdmin)
    ? thread.author.phoneNumber
    : thread.author.maskedPhone;

  return (
    <article className="relative bg-[#090e1f]/90 border border-cyan-500/25 hover:border-cyan-400/60 rounded-2xl p-5 shadow-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md transition-all duration-200">
      
      {/* Pinned or Locked Badge */}
      <div className="flex items-center gap-2 mb-3">
        {thread.isPinned && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-black shadow-sm font-['Chakra_Petch',sans-serif]">
            <Pin className="w-3 h-3 fill-current" />
            PINNED BY ADMIN
          </span>
        )}
        {thread.isLocked && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600 font-mono">
            <Lock className="w-3 h-3" />
            LOCKED (READ ONLY)
          </span>
        )}
        {thread.roomInfo && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono">
            <span>{thread.roomInfo.icon}</span>
            <span>{thread.roomInfo.name}</span>
          </span>
        )}
        <span className="text-[10px] text-slate-500 ml-auto font-mono">
          {new Date(thread.createdAt).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Ownership Violation Warning Popup */}
      {ownershipNotice && (
        <div className="mb-3 p-3 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs flex items-center gap-2 animate-bounce font-['Prompt',sans-serif]">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{ownershipNotice}</span>
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <img
            src={thread.author.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${thread.author.username}`}
            alt={thread.author.displayName}
            className="w-10 h-10 rounded-xl object-cover border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span 
                className="font-bold text-white text-sm hover:underline cursor-pointer font-['Chakra_Petch',sans-serif] hover:text-cyan-300 transition" 
                onClick={() => onOpenDetail(thread)}
              >
                {thread.author.displayName}
              </span>
              <span className="text-xs text-cyan-400/80 font-mono">@{thread.author.username}</span>
              {thread.author.role === 'admin' && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-fuchsia-950 text-fuchsia-300 px-1.5 py-0.2 rounded border border-fuchsia-500/60 font-mono">
                  <ShieldCheck className="w-3 h-3 text-fuchsia-300" /> ADMIN
                </span>
              )}
            </div>

            {/* Masked Personal Data Badge (Demonstrating Requirement #5) */}
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <div 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#050814] text-cyan-200 border border-cyan-500/30"
                title="ข้อมูลส่วนบุคคลถูกปกป้อง (Privacy Masking)"
              >
                <span className="text-cyan-400">📱 {displayPhone}</span>
                {isSelfOrAdmin ? (
                  <button
                    onClick={() => setRevealedPhone(!revealedPhone)}
                    className="ml-1 text-cyan-300 hover:text-white underline cursor-pointer flex items-center gap-0.5"
                    title={revealedPhone ? 'คลิกเพื่อซ่อน' : 'คลิกเพื่อดูข้อมูลจริง (เฉพาะเจ้าของ/แอดมิน)'}
                  >
                    {revealedPhone ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                    <span className="text-[9px]">{revealedPhone ? 'ซ่อน' : 'ดูจริง'}</span>
                  </button>
                ) : (
                  <span className="text-[9px] text-slate-500 font-mono">(MASKED)</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Action Menu (Edit, Delete, Report) */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-[#0c142c] transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-1 w-52 rounded-xl bg-[#090e1f] border border-cyan-500/50 shadow-2xl p-1.5 z-30 animate-in fade-in cyber-glow-cyan"
              onClick={() => setMenuOpen(false)}
            >
              {/* Edit Thread (Owner Only) */}
              {canModify ? (
                <button
                  onClick={() => onOpenEdit(thread)}
                  className="w-full text-left px-2.5 py-2 text-xs text-cyan-300 hover:bg-cyan-950/70 rounded-lg flex items-center gap-2 font-['Prompt',sans-serif]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  แก้ไขกระทู้ (เจ้าของ)
                </button>
              ) : (
                <button
                  onClick={handleUnauthorizedEdit}
                  className="w-full text-left px-2.5 py-2 text-xs text-slate-500 hover:bg-slate-900 rounded-lg flex items-center gap-2 cursor-not-allowed font-['Prompt',sans-serif]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  แก้ไข (เฉพาะเจ้าของ)
                </button>
              )}

              {/* Delete Thread (Owner or Admin) */}
              {canDelete ? (
                <button
                  onClick={() => {
                    if (confirm('คุณต้องการลบกระทู้นี้ใช่หรือไม่?')) {
                      onDelete(thread.id);
                    }
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center gap-2 font-['Prompt',sans-serif]"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  {isOwner ? 'ลบกระทู้ของฉัน' : 'ลบกระทู้ (สิทธิ์แอดมิน)'}
                </button>
              ) : (
                <button
                  onClick={handleUnauthorizedDelete}
                  className="w-full text-left px-2.5 py-2 text-xs text-slate-500 hover:bg-slate-900 rounded-lg flex items-center gap-2 cursor-not-allowed font-['Prompt',sans-serif]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  ลบกระทู้ (เฉพาะเจ้าของ)
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="w-full text-left px-2.5 py-2 text-xs text-slate-300 hover:bg-cyan-950/70 rounded-lg flex items-center gap-2 font-['Prompt',sans-serif]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
                {copied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์กระทู้'}
              </button>

              <button
                onClick={() => onReport(thread)}
                className="w-full text-left px-2.5 py-2 text-xs text-amber-400 hover:bg-amber-950/40 rounded-lg flex items-center gap-2 border-t border-cyan-500/20 mt-1 pt-1.5 font-['Prompt',sans-serif]"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                แจ้งรายงานกระทู้
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Thread Title */}
      <h3
        onClick={() => onOpenDetail(thread)}
        className="text-base sm:text-lg font-bold text-white hover:text-cyan-300 cursor-pointer mb-2 transition leading-snug font-['Chakra_Petch',sans-serif]"
      >
        {thread.title}
      </h3>

      {/* Thread Content Preview */}
      <p
        onClick={() => onOpenDetail(thread)}
        className="text-xs sm:text-sm text-slate-300 whitespace-pre-line line-clamp-3 mb-3 cursor-pointer leading-relaxed font-['Prompt',sans-serif]"
      >
        {thread.content}
      </p>

      {/* Image if present */}
      {thread.imageUrl && (
        <div 
          onClick={() => onOpenDetail(thread)}
          className="mb-3 rounded-xl overflow-hidden max-h-80 bg-[#050814] border border-cyan-500/30 cursor-pointer shadow-inner"
        >
          <img
            src={thread.imageUrl}
            alt="Thread media"
            className="w-full h-full object-cover hover:scale-[1.01] transition duration-300"
          />
        </div>
      )}

      {/* Tags */}
      {thread.tags && thread.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {thread.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono text-cyan-300 hover:text-cyan-100 bg-cyan-950/70 hover:bg-cyan-900/70 px-2.5 py-0.5 rounded-full border border-cyan-500/40 cursor-pointer transition shadow-[0_0_6px_rgba(6,182,212,0.15)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions & Reactions Footer */}
      <div className="flex items-center justify-between border-t border-cyan-500/20 pt-3 text-slate-400 text-xs font-mono">
        
        {/* Pantip Emotions Button & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowEmotions(!showEmotions)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition ${
              totalReactions > 0
                ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 font-semibold'
                : 'hover:bg-cyan-950/40 hover:text-cyan-200'
            }`}
          >
            <span>❤️</span>
            <span>{totalReactions > 0 ? totalReactions : 'แสดงอารมณ์'}</span>
          </button>

          {showEmotions && (
            <div
              className="absolute left-0 bottom-full mb-2 bg-[#090e1f] border border-cyan-500/60 rounded-2xl shadow-2xl p-2 flex items-center gap-1.5 z-20 animate-in fade-in cyber-glow-cyan"
              onMouseLeave={() => setShowEmotions(false)}
            >
              {emotionsList.map((emo) => {
                const count = (thread.reactions[emo.key] || []).length;
                const hasReacted = user ? (thread.reactions[emo.key] || []).includes(user.id) : false;
                return (
                  <button
                    key={emo.key}
                    onClick={() => {
                      onReact(thread.id, emo.key, 'emotion');
                      setShowEmotions(false);
                    }}
                    className={`flex flex-col items-center p-1.5 rounded-xl hover:bg-cyan-900/50 transition transform hover:scale-125 ${
                      hasReacted ? 'bg-cyan-900/80 border border-cyan-400' : ''
                    }`}
                    title={`${emo.label} (${count})`}
                  >
                    <span className="text-lg">{emo.icon}</span>
                    <span className="text-[9px] text-slate-300 mt-0.5 font-['Prompt',sans-serif]">{emo.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Comments Count */}
        <button
          onClick={() => onOpenDetail(thread)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/40 hover:text-cyan-300 transition"
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="font-['Prompt',sans-serif]">{thread.commentsCount} ความเห็น</span>
        </button>

        {/* X Repost */}
        <button
          onClick={() => onReact(thread.id, undefined, 'repost')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition ${
            thread.userReactions.hasReposted
              ? 'text-pink-400 bg-pink-950/80 border border-pink-500/50 font-semibold'
              : 'hover:bg-cyan-950/40 hover:text-pink-300'
          }`}
          title="รีโพสต์กระทู้นี้สไตล์ X"
        >
          <Repeat2 className="w-4 h-4" />
          <span>{thread.reposts?.length || 0}</span>
        </button>

        {/* Views Count */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>{thread.views}</span>
        </div>

      </div>

    </article>
  );
};
