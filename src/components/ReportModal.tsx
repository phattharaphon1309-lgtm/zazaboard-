import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Thread } from '../types';
import { X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: Thread | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, thread }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('เนื้อหาไม่เหมาะสม / ละเมิดกฎชุมชน');
  const [customDetail, setCustomDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !thread) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อนรายงานกระทู้');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullReason = `${reason}${customDetail.trim() ? `: ${customDetail.trim()}` : ''}`;
      await api.reportThread(thread.id, fullReason);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งรายงาน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-800/60 rounded-2xl shadow-2xl p-6">
        
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-500 to-purple-500" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">แจ้งรายงานกระทู้ต่อแอดมิน</h2>
        </div>

        <p className="text-xs text-slate-300 mb-4 bg-purple-950/40 p-2.5 rounded-xl border border-purple-900/40">
          กระทู้: <strong className="text-white">"{thread.title}"</strong> โดย @{thread.author.username}
        </p>

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-950 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>ส่งรายงานให้ผู้ดูแลระบบเรียบร้อยแล้ว ขอบคุณที่ร่วมดูแลชุมชนครับ!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-xl bg-red-950 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                สาเหตุที่รายงาน
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="เนื้อหาไม่เหมาะสม / ลามกอนาจาร">เนื้อหาไม่เหมาะสม / ลามกอนาจาร</option>
                <option value="สแปม / โฆษณาขายของหลอกลวง">สแปม / โฆษณาขายของหลอกลวง</option>
                <option value="กลั่นแกล้ง / ใช้ถ้อยคำหยาบคาย">กลั่นแกล้ง / ใช้ถ้อยคำหยาบคาย</option>
                <option value="เผยแพร่ข้อมูลเท็จ / Fake news">เผยแพร่ข้อมูลเท็จ / Fake news</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                รายละเอียดเพิ่มเติม (ถ้ามี)
              </label>
              <textarea
                rows={3}
                value={customDetail}
                onChange={(e) => setCustomDetail(e.target.value)}
                placeholder="ระบุข้อเท็จจริงเพื่อช่วยแอดมินพิจารณา..."
                className="w-full bg-slate-950 border border-purple-900/50 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition disabled:opacity-50"
            >
              {loading ? 'กำลังส่งรายงาน...' : 'ส่งรายงานถึงผู้ดูแลระบบ'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
