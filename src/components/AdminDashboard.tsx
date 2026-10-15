import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminStats, User, Thread, Report, AuditLog } from '../types';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  FileText, 
  AlertTriangle, 
  Pin, 
  Lock, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  UserX,
  History,
  Search
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'threads' | 'reports' | 'logs'>('users');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [unmaskToggle, setUnmaskToggle] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [s, u, t, r, l] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(unmaskToggle),
        api.getThreads(),
        api.getAdminReports(),
        api.getAdminLogs(),
      ]);
      setStats(s);
      setUsers(u);
      setThreads(t);
      setReports(r);
      setLogs(l);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, unmaskToggle]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  // User Actions
  const handleToggleUserRole = async (targetUser: User) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.setAdminUserRole(targetUser.id, newRole);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      showNotification(`✓ ${res.message}`);
      // Refresh stats
      const s = await api.getAdminStats();
      setStats(s);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleUserStatus = async (targetUser: User) => {
    const newStatus = !targetUser.isSuspended;
    try {
      const res = await api.setAdminUserStatus(targetUser.id, newStatus);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, isSuspended: newStatus } : u));
      showNotification(`✓ ${res.message}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Thread Actions
  const handlePinThread = async (threadId: string) => {
    try {
      const res = await api.adminPinThread(threadId);
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, isPinned: res.isPinned } : t));
      showNotification(`✓ ${res.message}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLockThread = async (threadId: string) => {
    try {
      const res = await api.adminLockThread(threadId);
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, isLocked: res.isLocked } : t));
      showNotification(`✓ ${res.message}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบกระทู้นี้ในฐานะผู้ดูแลระบบ?')) return;
    try {
      await api.deleteThread(threadId);
      setThreads(prev => prev.filter(t => t.id !== threadId));
      showNotification('✓ ลบกระทู้สำเร็จ');
      const s = await api.getAdminStats();
      setStats(s);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Report Actions
  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await api.resolveReport(reportId, status);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      showNotification(`✓ อัปเดตสถานะรายงานเป็น ${status}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Non-admin block screen
  if (!user || !isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-red-950/80 border border-red-700 flex items-center justify-center text-red-400 mb-4 shadow-xl">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">403 เข้าถึงไม่ได้ (Admin Only)</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          หน้านี้สงวนไว้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น บัญชีปัจจุบันของคุณ ({user ? `@${user.username}` : 'ยังไม่ล็อกอิน'}) มีบทบาทเป็น <span className="text-purple-300 font-semibold">{user?.role || 'Guest'}</span>
        </p>
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 mb-6 font-['Prompt',sans-serif]">
          💡 <strong>วิธีเข้าใช้งาน:</strong> กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin) เพื่อเข้าใช้งานหน้านี้
        </div>
        <button
          onClick={onBackToHome}
          className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border border-purple-800/50 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                แดชบอร์ดผู้ดูแลระบบ (Admin Portal)
              </h1>
              <p className="text-xs text-purple-300/80">
                ระบบจัดการสมาชิก ดูแลกระทู้ และนโยบายการปกป้องข้อมูลส่วนบุคคล (Requirement 6)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-purple-950 border border-purple-800/60 text-purple-200 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรชข้อมูล
          </button>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition shadow"
          >
            กลับหน้าฟีด
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="bg-slate-900/80 border border-purple-900/40 rounded-xl p-3.5 shadow">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>สมาชิกทั้งหมด</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{stats.totalUsers}</div>
            <div className="text-[10px] text-purple-400 mt-0.5">{stats.totalAdmins} แอดมิน</div>
          </div>

          <div className="bg-slate-900/80 border border-purple-900/40 rounded-xl p-3.5 shadow">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>กระทู้ทั้งหมด</span>
              <FileText className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{stats.totalThreads}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">รวมทุกห้อง</div>
          </div>

          <div className="bg-slate-900/80 border border-purple-900/40 rounded-xl p-3.5 shadow">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>ความคิดเห็น</span>
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{stats.totalComments}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Pantip comments</div>
          </div>

          <div className="bg-slate-900/80 border border-purple-900/40 rounded-xl p-3.5 shadow">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>ปักหมุดอยู่</span>
              <Pin className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1">{stats.pinnedThreads}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">กระทู้เด่นบนสุด</div>
          </div>

          <div className="bg-slate-900/80 border border-purple-900/40 rounded-xl p-3.5 shadow">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>รายงานค้างตรวจ</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-xl font-bold text-red-300 mt-1">{stats.pendingReports}</div>
            <div className="text-[10px] text-red-400/80 mt-0.5">ต้องการตรวจสอบ</div>
          </div>

          <div className="bg-slate-900/80 border border-purple-900/40 rounded-xl p-3.5 shadow">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>การป้องกันข้อมูล</span>
              <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xs font-bold text-cyan-300 mt-1">PDPA Masked</div>
            <div className="text-[10px] text-slate-400 mt-0.5">เปิดใช้งานตลอดเวลา</div>
          </div>

        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-purple-900/50 gap-2 overflow-x-auto pb-1">
        {[
          { key: 'users', label: '👥 จัดการสมาชิก & สิทธิ์ (Users)', count: users.length },
          { key: 'threads', label: '📝 จัดการกระทู้ (Moderation)', count: threads.length },
          { key: 'reports', label: '🚨 รายงานปัญหา (Reports)', count: reports.filter(r => r.status === 'pending').length },
          { key: 'logs', label: '📜 บันทึกการทำงาน (Audit Logs)', count: logs.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-purple-950 text-white border-t border-x border-purple-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === tab.key ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: User Management & Masking Showcase */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/90 border border-purple-900/40 rounded-2xl p-5 shadow-xl space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Search */}
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="ค้นหาชื่อผู้ใช้, อีเมล..."
                className="w-full bg-slate-950 border border-purple-900/50 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Masking Toggle Control Button (Highlighting Requirement 5) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUnmaskToggle(!unmaskToggle)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${
                  unmaskToggle
                    ? 'bg-amber-950 text-amber-200 border-amber-600 shadow-amber-900/20 shadow'
                    : 'bg-purple-950/80 text-purple-200 border-purple-700 hover:bg-purple-900'
                }`}
                title="ทดสอบฟังก์ชันปิดบังข้อมูลส่วนบุคคล (Requirement 5)"
              >
                {unmaskToggle ? <Eye className="w-4 h-4 text-amber-400" /> : <EyeOff className="w-4 h-4 text-purple-400" />}
                <span>
                  {unmaskToggle ? '👁️ กำลังแสดงข้อมูลจริง (Unmasked Mode)' : '🔒 ซ่อนข้อมูลส่วนบุคคล (Masking Mode - ค่าเริ่มต้น)'}
                </span>
              </button>
            </div>

          </div>

          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-300 leading-relaxed flex items-center justify-between flex-wrap gap-2">
            <span>
              🛡️ <strong>Requirement 5 & 2 Demonstration:</strong> เบอร์โทรศัพท์ และอีเมล จะถูกปิดบังด้วยเครื่องหมายดอกจัน (Masking) ตามมาตรฐานความปลอดภัย สามารถคลิกปุ่มด้านบนเพื่อทดสอบสลับโหมด แสดง/ซ่อนข้อมูลได้
            </span>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-xl border border-purple-900/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-purple-300 uppercase font-semibold text-[11px] border-b border-purple-900/50">
                <tr>
                  <th className="p-3">สมาชิก</th>
                  <th className="p-3">บทบาท (Role)</th>
                  <th className="p-3">เบอร์โทรศัพท์ (Masked)</th>
                  <th className="p-3">อีเมล (Masked)</th>
                  <th className="p-3">สถานะบัญชี</th>
                  <th className="p-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-purple-950/20 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`}
                          alt={u.displayName}
                          className="w-8 h-8 rounded-full object-cover border border-purple-500/50"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1">
                            {u.displayName}
                            {u.isVerified && <span className="text-[10px] text-blue-400">✓</span>}
                          </div>
                          <div className="text-[10px] text-purple-400">@{u.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.role === 'admin'
                          ? 'bg-purple-950 text-purple-200 border-purple-600'
                          : 'bg-blue-950 text-blue-200 border-blue-600'
                      }`}>
                        {u.role === 'admin' ? '🛡️ ผู้ดูแลระบบ (Admin)' : '👤 ผู้ใช้ทั่วไป (User)'}
                      </span>
                    </td>

                    {/* Masked Phone Field */}
                    <td className="p-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        unmaskToggle
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                          : 'bg-slate-950 text-cyan-300 border border-purple-900/60'
                      }`}>
                        {u.phoneNumber}
                      </span>
                    </td>

                    {/* Masked Email Field */}
                    <td className="p-3 font-mono text-[11px] text-slate-300">
                      {u.email}
                    </td>

                    <td className="p-3">
                      {u.isSuspended ? (
                        <span className="text-red-400 bg-red-950/80 px-2 py-0.5 rounded text-[10px] font-semibold border border-red-800">
                          ระงับการใช้งาน
                        </span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-800">
                          ปกติ
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Toggle Role Button (Requirement 2) */}
                        <button
                          onClick={() => handleToggleUserRole(u)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700 transition"
                          title="สลับสิทธิ์ระหว่าง User และ Admin"
                        >
                          {u.role === 'admin' ? 'ลดเป็น User' : 'ตั้งเป็น Admin'}
                        </button>

                        {/* Suspend / Unsuspend */}
                        {u.id !== user.id && (
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`p-1 rounded-lg text-xs transition ${
                              u.isSuspended
                                ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                                : 'bg-red-950 text-red-300 hover:bg-red-900'
                            }`}
                            title={u.isSuspended ? 'ปลดระงับ' : 'ระงับบัญชี'}
                          >
                            {u.isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 2: Thread Moderation */}
      {activeTab === 'threads' && (
        <div className="bg-slate-900/90 border border-purple-900/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="text-xs text-purple-300">
            แอดมินสามารถปักหมุดกระทู้สำคัญ, ล็อคกระทู้ไม่ให้มีการตอบใหม่, หรือลบกระทู้ใดก็ได้ที่ผิดกฎระเบียบ
          </div>

          <div className="overflow-x-auto rounded-xl border border-purple-900/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-purple-300 uppercase font-semibold text-[11px] border-b border-purple-900/50">
                <tr>
                  <th className="p-3">หัวข้อกระทู้</th>
                  <th className="p-3">เจ้าของกระทู้</th>
                  <th className="p-3">ห้อง</th>
                  <th className="p-3">การตอบ/ดู</th>
                  <th className="p-3">สถานะพิเศษ</th>
                  <th className="p-3 text-right">ดำเนินการ (Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950">
                {threads.map((t) => (
                  <tr key={t.id} className="hover:bg-purple-950/20 transition">
                    <td className="p-3 font-semibold text-white max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="p-3">
                      <span className="text-purple-300 font-semibold">@{t.author.username}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px]">
                        {t.roomInfo?.name || t.room}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      {t.commentsCount} ความเห็น / {t.views} ดู
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {t.isPinned && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900 text-purple-200 font-bold">
                            📌 ปักหมุด
                          </span>
                        )}
                        {t.isLocked && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
                            🔒 ล็อค
                          </span>
                        )}
                        {!t.isPinned && !t.isLocked && (
                          <span className="text-[10px] text-slate-500">ปกติ</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        <button
                          onClick={() => handlePinThread(t.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                            t.isPinned
                              ? 'bg-purple-800 text-white border-purple-500'
                              : 'bg-slate-950 text-purple-300 border-purple-900 hover:bg-purple-950'
                          }`}
                          title={t.isPinned ? 'ยกเลิกปักหมุด' : 'ปักหมุด'}
                        >
                          <Pin className="w-3 h-3 inline mr-1" />
                          {t.isPinned ? 'ถอนหมุด' : 'ปักหมุด'}
                        </button>

                        <button
                          onClick={() => handleLockThread(t.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                            t.isLocked
                              ? 'bg-amber-800 text-white border-amber-500'
                              : 'bg-slate-950 text-amber-300 border-amber-900 hover:bg-amber-950'
                          }`}
                          title={t.isLocked ? 'ปลดล็อค' : 'ล็อคกระทู้'}
                        >
                          <Lock className="w-3 h-3 inline mr-1" />
                          {t.isLocked ? 'ปลดล็อค' : 'ล็อค'}
                        </button>

                        <button
                          onClick={() => handleDeleteThread(t.id)}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 transition"
                          title="ลบกระทู้ (สิทธิ์แอดมิน)"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />
                          ลบ
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900/90 border border-purple-900/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="text-xs text-purple-300">
            รายการแจ้งรายงานเนื้อหาไม่เหมาะสมจากสมาชิก
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              ไม่มีรายการรายงานปัญหาในขณะนี้ ชุมชนเรียบร้อยดี 👍
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.status === 'pending'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : rep.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {rep.status === 'pending' ? 'รอดำเนินการ' : rep.status === 'resolved' ? 'แก้ไขแล้ว' : 'ยกเลิก'}
                      </span>
                      <span className="text-xs text-purple-300 font-semibold">
                        {rep.targetTitle || `กระทู้ ID: ${rep.targetId}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>เหตุผล:</strong> {rep.reason}
                    </p>
                    <div className="text-[10px] text-slate-500 mt-1">
                      ผู้รายงาน: {rep.reporterName || 'สมาชิก'} • {new Date(rep.createdAt).toLocaleString('th-TH')}
                    </div>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'resolved')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition"
                      >
                        รับทราบ & ดำเนินการแล้ว
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800 transition"
                      >
                        ยกฟ้อง
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900/90 border border-purple-900/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs text-purple-300">
            <History className="w-4 h-4 text-purple-400" />
            <span>ประวัติการทำงานของผู้ดูแลระบบ (Admin Action Audit Trail)</span>
          </div>

          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-purple-950 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-[11px]">[{log.action}]</span>
                    <span>{log.details}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    ผู้ดำเนินการ: <strong className="text-purple-300">{log.adminName}</strong>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('th-TH')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
