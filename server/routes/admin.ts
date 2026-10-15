import express from 'express';
import { db, toSafeUser } from '../db.js';
import { requireAdmin, AuthRequest } from '../authMiddleware.js';

const router = express.Router();

// Apply requireAdmin to all endpoints in this router
router.use(requireAdmin);

// GET /api/admin/stats - System Overview
router.get('/stats', (_req, res) => {
  const users = db.getUsers();
  const threads = db.getThreads();
  const comments = db.getComments();
  const reports = db.getReports();

  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalThreads = threads.length;
  const totalComments = comments.length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const pinnedThreads = threads.filter(t => t.isPinned).length;

  return res.json({
    totalUsers,
    totalAdmins,
    totalThreads,
    totalComments,
    pendingReports,
    pinnedThreads,
  });
});

// GET /api/admin/users - User management with masking demonstration
router.get('/users', (req: AuthRequest, res) => {
  const { unmask } = req.query;
  const showUnmasked = unmask === 'true';
  const users = db.getUsers();

  const formattedUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    role: u.role,
    avatar: u.avatar,
    isVerified: u.isVerified,
    isSuspended: u.isSuspended,
    createdAt: u.createdAt,
    // Demonstrating Masking requirement #5:
    maskedEmail: toSafeUser(u, false).maskedEmail,
    maskedPhone: toSafeUser(u, false).maskedPhone,
    maskedCitizenId: toSafeUser(u, false).maskedCitizenId,
    // Actual data if unmask requested by admin:
    email: showUnmasked ? u.email : toSafeUser(u, false).maskedEmail,
    phoneNumber: showUnmasked ? u.phoneNumber : toSafeUser(u, false).maskedPhone,
    citizenId: showUnmasked ? u.citizenId : toSafeUser(u, false).maskedCitizenId,
    isUnmasked: showUnmasked,
  }));

  return res.json(formattedUsers);
});

// PATCH /api/admin/users/:id/role - Role change (User <-> Admin)
router.patch('/users/:id/role', (req: AuthRequest, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== 'user' && role !== 'admin') {
    return res.status(400).json({ error: 'บทบาทต้องเป็น user หรือ admin เท่านั้น' });
  }

  const targetUser = db.findUserById(id);
  if (!targetUser) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้ที่ระบุ' });
  }

  // Prevent admin from removing their own admin status if they are the only admin
  if (id === req.user!.id && role === 'user') {
    const adminCount = db.getUsers().filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'ไม่สามารถปลดสิทธิ์แอดมินคนสุดท้ายของระบบได้' });
    }
  }

  const oldRole = targetUser.role;
  targetUser.role = role;
  db.save();

  db.addAuditLog({
    id: 'log_' + Date.now(),
    adminId: req.user!.id,
    adminName: req.user!.displayName,
    action: 'CHANGE_USER_ROLE',
    target: targetUser.username,
    details: `เปลี่ยนบทบาทของ @${targetUser.username} จาก "${oldRole}" เป็น "${role}"`,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    message: `เปลี่ยนบทบาทของ @${targetUser.username} เป็น ${role} เรียบร้อยแล้ว`,
    user: toSafeUser(targetUser, true),
  });
});

// PATCH /api/admin/users/:id/status - Suspend or Unsuspend User
router.patch('/users/:id/status', (req: AuthRequest, res) => {
  const { id } = req.params;
  const { isSuspended } = req.body;

  if (id === req.user!.id) {
    return res.status(400).json({ error: 'ไม่สามารถระงับการใช้งานบัญชีของตนเองได้' });
  }

  const targetUser = db.findUserById(id);
  if (!targetUser) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้ที่ระบุ' });
  }

  targetUser.isSuspended = Boolean(isSuspended);
  db.save();

  db.addAuditLog({
    id: 'log_' + Date.now(),
    adminId: req.user!.id,
    adminName: req.user!.displayName,
    action: isSuspended ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
    target: targetUser.username,
    details: isSuspended
      ? `ระงับการใช้งานของ @${targetUser.username}`
      : `ปลดระงับการใช้งานของ @${targetUser.username}`,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    message: isSuspended ? `ระงับบัญชี @${targetUser.username} แล้ว` : `ปลดการระงับบัญชีแล้ว`,
    user: toSafeUser(targetUser, true),
  });
});

// POST /api/admin/threads/:id/pin - Pin/Unpin Thread
router.post('/threads/:id/pin', (req: AuthRequest, res) => {
  const { id } = req.params;
  const thread = db.findThreadById(id);

  if (!thread) {
    return res.status(404).json({ error: 'ไม่พบกระทู้' });
  }

  thread.isPinned = !thread.isPinned;
  db.save();

  db.addAuditLog({
    id: 'log_' + Date.now(),
    adminId: req.user!.id,
    adminName: req.user!.displayName,
    action: thread.isPinned ? 'PIN_THREAD' : 'UNPIN_THREAD',
    target: thread.id,
    details: `${thread.isPinned ? 'ปักหมุด' : 'ยกเลิกปักหมุด'} กระทู้ "${thread.title}"`,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    message: thread.isPinned ? 'ปักหมุดกระทู้เรียบร้อยแล้ว' : 'ยกเลิกการปักหมุดแล้ว',
    isPinned: thread.isPinned,
  });
});

// POST /api/admin/threads/:id/lock - Lock/Unlock Thread (disable new comments)
router.post('/threads/:id/lock', (req: AuthRequest, res) => {
  const { id } = req.params;
  const thread = db.findThreadById(id);

  if (!thread) {
    return res.status(404).json({ error: 'ไม่พบกระทู้' });
  }

  thread.isLocked = !thread.isLocked;
  db.save();

  db.addAuditLog({
    id: 'log_' + Date.now(),
    adminId: req.user!.id,
    adminName: req.user!.displayName,
    action: thread.isLocked ? 'LOCK_THREAD' : 'UNLOCK_THREAD',
    target: thread.id,
    details: `${thread.isLocked ? 'ล็อคกระทู้ห้ามตอบ' : 'ปลดล็อคกระทู้'} "${thread.title}"`,
    createdAt: new Date().toISOString(),
  });

  return res.json({
    message: thread.isLocked ? 'ล็อคกระทู้เรียบร้อยแล้ว สมาชิกจะไม่สามารถแสดงความคิดเห็นเพิ่มได้' : 'ปลดล็อคกระทู้แล้ว',
    isLocked: thread.isLocked,
  });
});

// GET /api/admin/reports - View all reports
router.get('/reports', (_req, res) => {
  const reports = db.getReports();
  const formatted = reports.map(r => {
    const reporter = db.findUserById(r.reporterId);
    return {
      ...r,
      reporterName: reporter ? reporter.displayName : 'นิรนาม',
    };
  });
  return res.json(formatted);
});

// PATCH /api/admin/reports/:id - Resolve or dismiss report
router.patch('/reports/:id', (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'resolved' && status !== 'dismissed') {
    return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
  }

  const updated = db.updateReport(id, { status });
  if (!updated) {
    return res.status(404).json({ error: 'ไม่พบรายงาน' });
  }

  return res.json({ message: 'อัปเดตสถานะรายงานสำเร็จ', report: updated });
});

// GET /api/admin/audit-logs - View moderation logs
router.get('/audit-logs', (_req, res) => {
  const logs = db.getAuditLogs();
  return res.json(logs);
});

export default router;
