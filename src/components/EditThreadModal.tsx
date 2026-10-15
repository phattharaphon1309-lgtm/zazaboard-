import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Thread, RoomCategory } from '../types';
import { X, Edit3, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface EditThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: Thread;
  rooms: RoomCategory[];
  onUpdated: (updatedThread: Thread) => void;
}

export const EditThreadModal: React.FC<EditThreadModalProps> = ({
  isOpen,
  onClose,
  thread,
  rooms,
  onUpdated,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(thread.title);
  const [content, setContent] = useState(thread.content);
  const [room, setRoom] = useState(thread.room);
  const [tagsInput, setTagsInput] = useState(thread.tags.join(', '));
  const [imageUrl, setImageUrl] = useState(thread.imageUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner = user?.id === thread.authorId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      setError('คุณไม่มีสิทธิ์แก้ไขกระทู้นี้ (เฉพาะเจ้าของกระทู้เท่านั้น)');
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

      const res = await api.updateThread(thread.id, {
        title,
        content,
        room,
        tags: parsedTags,
        imageUrl: imageUrl.trim() || undefined,
      });

      onUpdated(res.thread);
      onClose();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการแก้ไขกระทู้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-purple-800/60 rounded-2xl shadow-2xl p-6 max-h-[92vh] flex flex-col">
        
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">แก้ไขกระทู้ (Edit Post)</h2>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-purple-300">
              เจ้าของกระทู้: <strong className="text-white">@{thread.author.username}</strong>
            </span>
            {isOwner ? (
              <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                ✓ คุณเป็นเจ้าของกระทู้ มีสิทธิ์แก้ไข
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800">
                ✕ คุณไม่ใช่เจ้าของกระทู้
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/70 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-4 custom-scrollbar">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ห้องสนทนา
            </label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {rooms.filter(r => r.id !== 'all').map((r) => (
                <option key={r.id} value={r.id}>
                  {r.icon} {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              หัวข้อกระทู้
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              เนื้อหากระทู้
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              แฮชแท็ก (#Tags)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL รูปภาพประกอบ
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !isOwner}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-40"
            >
              {loading ? 'กำลังบันทึกการแก้ไข...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
