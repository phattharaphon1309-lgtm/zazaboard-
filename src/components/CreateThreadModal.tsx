import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoomCategory, Thread } from '../types';
import { X, Sparkles, Image, Hash, HelpCircle, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: RoomCategory[];
  onCreated: (newThread: Thread) => void;
  defaultRoom?: string;
}

export const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  isOpen,
  onClose,
  rooms,
  onCreated,
  defaultRoom = 'silom',
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [room, setRoom] = useState(defaultRoom === 'all' ? 'general' : defaultRoom);
  const [threadType, setThreadType] = useState<'discussion' | 'question' | 'review' | 'microblog'>('discussion');
  const [tagsInput, setTagsInput] = useState('#พูดคุย, #สายเทค');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อนตั้งกระทู้');
      return;
    }

    if (!title.trim()) {
      setError('กรุณาระบุหัวข้อกระทู้');
      return;
    }

    if (!content.trim()) {
      setError('กรุณาระบุเนื้อหากระทู้');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedTags = tagsInput
        .split(/[, ]+/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => (t.startsWith('#') ? t : `#${t}`));

      const res = await api.createThread({
        title,
        content,
        room,
        threadType,
        tags: parsedTags,
        imageUrl: imageUrl.trim() || undefined,
      });

      onCreated(res.thread);
      onClose();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างกระทู้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-purple-800/60 rounded-2xl shadow-2xl p-6 sm:p-7 max-h-[92vh] flex flex-col">
        
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              ตั้งกระทู้ใหม่ / โพสต์ข้อความ (Form 1)
            </h2>
          </div>
          <p className="text-xs text-purple-300/80 mt-0.5">
            ข้อมูลจะถูกบันทึกลงฐานข้อมูลและแสดงผลกลับสู่หน้าฟีดทันที
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/70 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-4 custom-scrollbar">
          
          {/* Thread Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ประเภทกระทู้
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'discussion', label: '💬 กระทู้สนทนา', desc: 'แลกเปลี่ยนความเห็น' },
                { key: 'question', label: '❓ กระทู้คำถาม', desc: 'ขอคำแนะนำหรือถามปัญหา' },
                { key: 'review', label: '⭐ กระทู้รีวิว', desc: 'รีวิวสินค้าหรือบริการ' },
                { key: 'microblog', label: '⚡ โพสต์สไตล์ X', desc: 'ข้อความสั้น เกาะกระแส' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setThreadType(item.key as any)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition ${
                    threadType === item.key
                      ? 'bg-purple-950/90 border-purple-500 text-purple-200 font-bold shadow'
                      : 'bg-slate-950 border-purple-900/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Room Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              เลือกห้องสนทนาสไตล์พันทิป <span className="text-red-400">*</span>
            </label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {rooms.filter(r => r.id !== 'all').map((r) => (
                <option key={r.id} value={r.id}>
                  {r.icon} {r.name} - {r.description}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              หัวข้อกระทู้ <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ขอคำแนะนำแนวทางการทำงานสายซอฟต์แวร์..."
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              เนื้อหากระทู้ / ข้อความ <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="พิมพ์เนื้อหาที่ต้องการเล่า หรือสอบถามเพื่อนสมาชิก..."
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              แฮชแท็ก (#Tags สไตล์ X คั่นด้วยจุลภาคหรือเว้นวรรค)
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="#สายไอที, #แชร์ประสบการณ์, #มนุษย์เงินเดือน"
                className="w-full bg-slate-950 border border-purple-900/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Image URL (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              แนบรูปภาพประกอบ (URL รูปภาพ)
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-950 border border-purple-900/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden h-24 w-40 bg-slate-950 border border-purple-900/40">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          {/* Author Attribution Note */}
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-300 flex items-center justify-between">
            <span>ผู้โพสต์: <strong className="text-white">@{user?.username}</strong></span>
            <span className="text-[10px] text-emerald-400 font-semibold">🔒 กำหนดความเป็นเจ้าของ (Owner)</span>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึกลงฐานข้อมูล...' : 'โพสต์กระทู้ทันที'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
