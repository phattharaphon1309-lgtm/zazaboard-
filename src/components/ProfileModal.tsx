import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Phone, Mail, ShieldCheck, Eye, EyeOff, Save, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [revealPrivate, setRevealPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile({
        displayName,
        bio,
        phoneNumber,
        avatar,
      });
      setSuccess('อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว!');
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-purple-800/60 rounded-2xl shadow-2xl p-6 max-h-[92vh] flex flex-col">
        
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative">
            <img
              src={avatar || user.avatar}
              alt={user.displayName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500 shadow-md"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-white">{user.displayName}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                user.role === 'admin'
                  ? 'bg-purple-900/90 text-purple-200 border-purple-600'
                  : 'bg-blue-900/90 text-blue-200 border-blue-600'
              }`}>
                {user.role === 'admin' ? '🛡️ ผู้ดูแลระบบ' : '👤 สมาชิก'}
              </span>
            </div>
            <p className="text-xs text-purple-400">@{user.username}</p>
          </div>
        </div>

        {/* Privacy Masking Demonstration Box (Requirement 5) */}
        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 mb-4 text-xs space-y-2">
          <div className="flex items-center justify-between text-purple-300 font-bold text-xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              การแสดงผลข้อมูลส่วนบุคคล (PDPA Masking)
            </span>
            <button
              type="button"
              onClick={() => setRevealPrivate(!revealPrivate)}
              className="text-purple-300 hover:text-white flex items-center gap-1 underline text-[11px]"
            >
              {revealPrivate ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{revealPrivate ? 'ซ่อนข้อมูลจริง' : 'ดูข้อมูลจริงเต็ม (Owner View)'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2 rounded-lg bg-slate-950/70 border border-purple-950">
              <span className="text-slate-400 block text-[10px]">เบอร์โทรศัพท์ (คนอื่นเห็นแบบนี้):</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {revealPrivate ? user.phoneNumber : user.maskedPhone}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/70 border border-purple-950">
              <span className="text-slate-400 block text-[10px]">อีเมล (คนอื่นเห็นแบบนี้):</span>
              <span className="font-mono text-cyan-300 font-semibold truncate block">
                {revealPrivate ? user.email : user.maskedEmail}
              </span>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-3.5 custom-scrollbar">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ชื่อแสดงผล (Display Name)
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              เบอร์โทรศัพท์ส่วนตัว
              <span className="text-[10px] text-purple-400 ml-1.5">(ระบบจะ Masking อัตโนมัติเมื่อแสดงผล)</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="เช่น 0891234567"
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              แนะนำตัวสั้นๆ (Bio)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="ความชอบ ความสนใจ สไตล์การพูดคุย..."
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL รูปภาพโปรไฟล์ (Avatar)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/30 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไขโปรไฟล์'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
