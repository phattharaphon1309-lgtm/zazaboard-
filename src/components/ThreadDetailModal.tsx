import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Thread, Comment } from '../types';
import { 
  X, 
  MessageSquare, 
  Send, 
  Lock, 
  Pin, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Trash2, 
  Repeat2, 
  Bookmark, 
  Share2, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';

interface ThreadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: Thread | null;
  onThreadUpdated: (thread: Thread) => void;
  onOpenEdit: (thread: Thread) => void;
  onDeleteThread: (threadId: string) => void;
}

export const ThreadDetailModal: React.FC<ThreadDetailModalProps> = ({
  isOpen,
  onClose,
  thread,
  onThreadUpdated,
  onOpenEdit,
  onDeleteThread,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('like');
  const [commentImageUrl, setCommentImageUrl] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedPhone, setRevealedPhone] = useState(false);

  useEffect(() => {
    if (isOpen && thread) {
      loadThreadDetail(thread.id);
    }
  }, [isOpen, thread?.id]);

  const loadThreadDetail = async (threadId: string) => {
    setLoading(true);
    try {
      const data = await api.getThread(threadId);
      setComments(data.comments);
      onThreadUpdated(data.thread);
    } catch (err: any) {
      console.error('Failed to load thread details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !thread) return null;

  const isOwner = user?.id === thread.authorId;
  const isAdmin = user?.role === 'admin';
  const isSelfOrAdmin = isOwner || isAdmin;

  // Form 2: Submit Comment (Requirement 4)
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อนตอบกระทู้');
      return;
    }
    if (!commentContent.trim()) {
      setError('กรุณากรอกข้อความแสดงความคิดเห็น');
      return;
    }

    setSubmittingComment(true);
    setError(null);

    try {
      const res = await api.addComment(thread.id, {
        content: commentContent,
        pantipEmotion: selectedEmotion,
        imageUrl: commentImageUrl.trim() || undefined,
      });

      setComments((prev) => [...prev, res.comment]);
      setCommentContent('');
      setCommentImageUrl('');

      // Refresh thread to update comment count
      loadThreadDetail(thread.id);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถส่งความคิดเห็นได้');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('ต้องการลบความคิดเห็นนี้ใช่หรือไม่?')) return;
    try {
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const emotionsList = [
    { key: 'like', icon: '👍', label: 'ถูกใจ' },
    { key: 'love', icon: '❤️', label: 'หลงรัก' },
    { key: 'laugh', icon: '😂', label: 'ขำกลิ้ง' },
    { key: 'impressed', icon: '😲', label: 'ทึ่ง' },
    { key: 'sad', icon: '🥺', label: 'ซึ้ง' },
    { key: 'scare', icon: '😱', label: 'สยอง' },
  ];

  const displayPhone = (revealedPhone && isSelfOrAdmin)
    ? thread.author.phoneNumber
    : thread.author.maskedPhone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-800/60 rounded-2xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {thread.roomInfo && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-semibold flex items-center gap-1">
                <span>{thread.roomInfo.icon}</span>
                <span>{thread.roomInfo.name}</span>
              </span>
            )}
            {thread.isPinned && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold flex items-center gap-1">
                <Pin className="w-3 h-3 fill-current" /> ปักหมุด
              </span>
            )}
            {thread.isLocked && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> ล็อคห้ามตอบ
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* Author Card & Privacy Masking showcase */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-purple-900/50">
            <div className="flex items-center gap-3">
              <img
                src={thread.author.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${thread.author.username}`}
                alt={thread.author.displayName}
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
              />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-white text-base">{thread.author.displayName}</span>
                  <span className="text-xs text-purple-400">@{thread.author.username}</span>
                  {thread.author.role === 'admin' && (
                    <span className="text-[10px] font-bold bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded border border-purple-600 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> แอดมิน
                    </span>
                  )}
                </div>

                {/* Personal Data Masking (Requirement 5) */}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 flex-wrap">
                  <div className="flex items-center gap-1 font-mono bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/50">
                    <span className="text-purple-300">📱 {displayPhone}</span>
                    {isSelfOrAdmin ? (
                      <button
                        onClick={() => setRevealedPhone(!revealedPhone)}
                        className="ml-1.5 text-purple-300 hover:text-white underline flex items-center gap-0.5"
                      >
                        {revealedPhone ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span className="text-[10px]">{revealedPhone ? 'ซ่อน' : 'ดูจริง'}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-sans">(Masked)</span>
                    )}
                  </div>

                  <span className="text-slate-500 text-xs">
                    {new Date(thread.createdAt).toLocaleString('th-TH')}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner Actions */}
            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenEdit(thread);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 rounded-lg transition"
                >
                  แก้ไข
                </button>
              )}
              {(isOwner || isAdmin) && (
                <button
                  onClick={() => {
                    if (confirm('คุณต้องการลบกระทู้นี้ใช่หรือไม่?')) {
                      onDeleteThread(thread.id);
                      onClose();
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg transition"
                >
                  ลบ
                </button>
              )}
            </div>
          </div>

          {/* Thread Content */}
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-white mb-3 leading-snug">
              {thread.title}
            </h1>
            <div className="text-sm sm:text-base text-slate-200 whitespace-pre-line leading-relaxed font-normal">
              {thread.content}
            </div>
          </div>

          {/* Thread Image */}
          {thread.imageUrl && (
            <div className="rounded-xl overflow-hidden bg-slate-950 border border-purple-900/40">
              <img src={thread.imageUrl} alt="Thread media" className="w-full max-h-96 object-contain" />
            </div>
          )}

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {thread.tags.map((t, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-purple-900/30 pt-4" />

          {/* Comments Section Heading */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              ความคิดเห็น ({comments.length})
            </h3>
            <span className="text-xs text-slate-400">ระบบแสดงความคิดเห็นสไตล์พันทิป</span>
          </div>

          {/* Form 2: Comment Input Form (Requirement 4) */}
          {!thread.isLocked ? (
            <form onSubmit={handleCommentSubmit} className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-purple-900/60 shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                  ✍️ ร่วมแสดงความคิดเห็น (Form 2)
                </span>
                <span className="text-[11px] text-slate-400">บันทึกลงฐานข้อมูลทันที</span>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <textarea
                required
                rows={3}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder={user ? "พิมพ์ความคิดเห็นของคุณที่นี่..." : "กรุณาเข้าสู่ระบบก่อนตอบกระทู้"}
                disabled={!user}
                className="w-full bg-slate-900 border border-purple-900/50 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />

              {/* Pantip Emotion Picker for this Comment */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">อารมณ์:</span>
                  {emotionsList.map((emo) => (
                    <button
                      key={emo.key}
                      type="button"
                      onClick={() => setSelectedEmotion(emo.key)}
                      className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition ${
                        selectedEmotion === emo.key
                          ? 'bg-purple-800 text-white font-bold border border-purple-500'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                      title={emo.label}
                    >
                      <span>{emo.icon}</span>
                      <span className="text-[10px] hidden md:inline">{emo.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submittingComment || !user || !commentContent.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingComment ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-900/60 text-amber-300 text-xs text-center flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              <span>กระทู้นี้ถูกล็อคโดยผู้ดูแลระบบ ไม่อนุญาตให้ตอบความคิดเห็นเพิ่มเติม</span>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4 pt-2">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                ยังไม่มีความคิดเห็น เป็นคนแรกที่ตอบกระทู้นี้!
              </div>
            ) : (
              comments.map((comment) => {
                const canDeleteThisComment = user && (user.id === comment.authorId || user.role === 'admin');
                const commentEmotion = emotionsList.find(e => e.key === comment.pantipEmotion);
                return (
                  <div
                    key={comment.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-purple-900/30 hover:border-purple-800/50 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-400">
                          #ความคิดเห็นที่ {comment.commentNumber}
                        </span>
                        {commentEmotion && (
                          <span className="text-xs bg-purple-950 px-2 py-0.5 rounded text-purple-300 border border-purple-900/60 flex items-center gap-1">
                            <span>{commentEmotion.icon}</span>
                            <span>{commentEmotion.label}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                          {new Date(comment.createdAt).toLocaleString('th-TH')}
                        </span>
                        {canDeleteThisComment && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/40"
                            title="ลบความคิดเห็น"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comment Content */}
                    <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line mb-3 leading-relaxed">
                      {comment.content}
                    </p>

                    {/* Comment Author Bar */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-purple-950">
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.author?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                          alt={comment.author?.displayName || 'User'}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-slate-300 font-semibold">{comment.author?.displayName}</span>
                        <span className="text-purple-400">@{comment.author?.username}</span>
                      </div>

                      {/* Masked info preview */}
                      <span className="font-mono text-[10px] text-purple-400/80">
                        📱 {comment.author?.maskedPhone || '08x-***-xxxx'}
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
