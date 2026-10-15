import express from 'express';
import { db, toSafeUser, ROOMS } from '../db.js';
import { requireAuth, optionalAuth, AuthRequest } from '../authMiddleware.js';
import { Thread, Comment, Report } from '../types.js';

const router = express.Router();

// Helper to format thread with author info
function formatThread(thread: Thread, requestingUserId?: string, requestingUserRole?: string) {
  const author = db.findUserById(thread.authorId);
  const canViewUnmasked = requestingUserRole === 'admin' || (requestingUserId && requestingUserId === thread.authorId);
  const safeAuthor = author
    ? toSafeUser(author, Boolean(canViewUnmasked))
    : {
        id: 'unknown',
        username: 'deleted_user',
        displayName: 'ผู้ใช้นิรนาม',
        role: 'user',
        email: 'u***@unknown.com',
        phoneNumber: '0xx-***-xxxx',
        citizenId: 'x-xxxx-*****-xx-x',
        maskedEmail: 'u***@unknown.com',
        maskedPhone: '0xx-***-xxxx',
        maskedCitizenId: 'x-xxxx-*****-xx-x',
        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=deleted',
        bio: '',
        isVerified: false,
        isSuspended: false,
        createdAt: '',
      };

  const comments = db.getComments(thread.id);
  const roomInfo = ROOMS.find(r => r.id === thread.room) || ROOMS[0];

  return {
    ...thread,
    author: safeAuthor,
    commentsCount: comments.length,
    roomInfo,
    userReactions: {
      hasLiked: requestingUserId ? (thread.reactions.like || []).includes(requestingUserId) : false,
      hasReposted: requestingUserId ? thread.reposts.includes(requestingUserId) : false,
      hasBookmarked: requestingUserId ? thread.bookmarks.includes(requestingUserId) : false,
    },
  };
}

// GET all rooms
router.get('/rooms', (_req, res) => {
  return res.json(ROOMS);
});

// GET /api/threads (with filters, sorting, search)
router.get('/', optionalAuth, (req: AuthRequest, res) => {
  const { room, tag, sort, search, authorId } = req.query;
  let threads = [...db.getThreads()];

  if (room && room !== 'all') {
    threads = threads.filter(t => t.room === room);
  }

  if (tag) {
    const targetTag = (tag as string).startsWith('#') ? tag : `#${tag}`;
    threads = threads.filter(t => t.tags.some(tTag => tTag.toLowerCase() === (targetTag as string).toLowerCase()));
  }

  if (authorId) {
    threads = threads.filter(t => t.authorId === authorId);
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    threads = threads.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      t.tags.some(tg => tg.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sort === 'hot' || sort === 'trending') {
    threads.sort((a, b) => {
      const aScore = Object.values(a.reactions).reduce((acc, arr) => acc + arr.length, 0) + a.reposts.length * 2 + a.views * 0.1;
      const bScore = Object.values(b.reactions).reduce((acc, arr) => acc + arr.length, 0) + b.reposts.length * 2 + b.views * 0.1;
      return bScore - aScore;
    });
  } else if (sort === 'views') {
    threads.sort((a, b) => b.views - a.views);
  } else {
    // Newest first, with pinned on top
    threads.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  const requestingUserId = req.user?.id;
  const requestingUserRole = req.user?.role;
  const formatted = threads.map(t => formatThread(t, requestingUserId, requestingUserRole));

  return res.json(formatted);
});

// GET /api/threads/:id (Single thread detail with comments)
router.get('/:id', optionalAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const thread = db.findThreadById(id);

  if (!thread) {
    return res.status(404).json({ error: 'ไม่พบกระทู้ที่ค้นหา' });
  }

  // Increment view count
  thread.views += 1;
  db.save();

  const requestingUserId = req.user?.id;
  const requestingUserRole = req.user?.role;

  const rawComments = db.getComments(id);
  const formattedComments = rawComments.map(c => {
    const author = db.findUserById(c.authorId);
    const canViewUnmasked = requestingUserRole === 'admin' || (requestingUserId && requestingUserId === c.authorId);
    return {
      ...c,
      author: author ? toSafeUser(author, Boolean(canViewUnmasked)) : null,
      isOwner: requestingUserId === c.authorId,
    };
  });

  return res.json({
    thread: formatThread(thread, requestingUserId, requestingUserRole),
    comments: formattedComments,
  });
});

// POST /api/threads (Create thread - Form 1)
router.post('/', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ' });

  const { title, content, room, threadType, tags, imageUrl } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกหัวข้อกระทู้' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกเนื้อหากระทู้' });
  }

  const cleanRoom = room || 'general';
  const cleanTags = Array.isArray(tags)
    ? tags.map(t => (t.startsWith('#') ? t.trim() : `#${t.trim()}`)).filter(t => t.length > 1)
    : [];

  const newThread: Thread = {
    id: 'th_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    authorId: req.user.id,
    title: title.trim(),
    content: content.trim(),
    room: cleanRoom,
    threadType: threadType || 'discussion',
    tags: cleanTags,
    imageUrl: imageUrl?.trim() || undefined,
    isPinned: false,
    isLocked: false,
    views: 1,
    reactions: {
      like: [],
      love: [],
      laugh: [],
      scare: [],
      impressed: [],
      sad: [],
    },
    reposts: [],
    bookmarks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addThread(newThread);

  return res.status(201).json({
    message: 'สร้างกระทู้ใหม่สำเร็จ!',
    thread: formatThread(newThread, req.user.id, req.user.role),
  });
});

// PUT /api/threads/:id (Update thread - Strict Ownership Check!)
router.put('/:id', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ' });

  const { id } = req.params;
  const thread = db.findThreadById(id);

  if (!thread) {
    return res.status(404).json({ error: 'ไม่พบกระทู้ที่ต้องการแก้ไข' });
  }

  // Requirement 3: User A CANNOT edit User B's post!
  if (thread.authorId !== req.user.id) {
    return res.status(403).json({
      error: 'คุณไม่มีสิทธิ์แก้ไขกระทู้นี้ (เฉพาะเจ้าของกระทู้เท่านั้นที่สามารถแก้ไขเนื้อหาได้)',
    });
  }

  if (thread.isLocked && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'กระทู้นี้ถูกล็อคโดยผู้ดูแลระบบ ไม่สามารถแก้ไขได้' });
  }

  const { title, content, room, threadType, tags, imageUrl } = req.body;

  const updates: Partial<Thread> = {};
  if (typeof title === 'string' && title.trim()) updates.title = title.trim();
  if (typeof content === 'string' && content.trim()) updates.content = content.trim();
  if (typeof room === 'string') updates.room = room;
  if (typeof threadType === 'string') updates.threadType = threadType as any;
  if (Array.isArray(tags)) {
    updates.tags = tags.map(t => (t.startsWith('#') ? t.trim() : `#${t.trim()}`));
  }
  if (imageUrl !== undefined) updates.imageUrl = imageUrl ? imageUrl.trim() : undefined;

  const updated = db.updateThread(id, updates);
  return res.json({
    message: 'แก้ไขกระทู้เรียบร้อยแล้ว!',
    thread: formatThread(updated!, req.user.id, req.user.role),
  });
});

// DELETE /api/threads/:id (Delete thread - Strict Ownership or Admin Check!)
router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ' });

  const { id } = req.params;
  const thread = db.findThreadById(id);

  if (!thread) {
    return res.status(404).json({ error: 'ไม่พบกระทู้ที่ต้องการลบ' });
  }

  const isOwner = thread.authorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  // Requirement 3: User A CANNOT delete User B's post!
  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: 'คุณไม่มีสิทธิ์ลบกระทู้นี้ (เฉพาะเจ้าของกระทู้ หรือ ผู้ดูแลระบบเท่านั้น)',
    });
  }

  db.deleteThread(id);

  // If deleted by admin, add audit log
  if (isAdmin && !isOwner) {
    db.addAuditLog({
      id: 'log_' + Date.now(),
      adminId: req.user.id,
      adminName: req.user.displayName,
      action: 'DELETE_THREAD',
      target: thread.id,
      details: `ลบกระทู้ "${thread.title}" ของผู้ใช้ ID: ${thread.authorId}`,
      createdAt: new Date().toISOString(),
    });
  }

  return res.json({ message: 'ลบกระทู้สำเร็จ' });
});

// POST /api/threads/:id/comments (Add Comment - Form 2)
router.post('/:id/comments', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ' });

  const { id } = req.params;
  const thread = db.findThreadById(id);

  if (!thread) {
    return res.status(404).json({ error: 'ไม่พบกระทู้' });
  }

  if (thread.isLocked && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'กระทู้นี้ถูกล็อคแล้ว ไม่สามารถตอบความคิดเห็นได้' });
  }

  const { content, imageUrl, pantipEmotion } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความแสดงความคิดเห็น' });
  }

  const existingComments = db.getComments(id);
  const commentNumber = existingComments.length + 1;

  const newComment: Comment = {
    id: 'cm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    threadId: id,
    authorId: req.user.id,
    content: content.trim(),
    imageUrl: imageUrl?.trim() || undefined,
    pantipEmotion: pantipEmotion || 'like',
    upvotes: [],
    commentNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addComment(newComment);

  return res.status(201).json({
    message: 'ส่งความคิดเห็นสำเร็จ!',
    comment: {
      ...newComment,
      author: toSafeUser(req.user, true),
      isOwner: true,
    },
  });
});

// DELETE /api/comments/:commentId (Delete Comment)
router.delete('/comments/:commentId', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ' });

  const { commentId } = req.params;
  const comment = db.findCommentById(commentId);

  if (!comment) {
    return res.status(404).json({ error: 'ไม่พบความคิดเห็น' });
  }

  const isOwner = comment.authorId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ลบความคิดเห็นของผู้อื่น' });
  }

  db.deleteComment(commentId);
  return res.json({ message: 'ลบความคิดเห็นสำเร็จ' });
});

// POST /api/threads/:id/react (Reactions & X Repost / Bookmark)
router.post('/:id/react', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ' });

  const { id } = req.params;
  const { emotion, type } = req.body; // type: 'emotion' | 'repost' | 'bookmark'
  const thread = db.findThreadById(id);

  if (!thread) {
    return res.status(404).json({ error: 'ไม่พบกระทู้' });
  }

  const userId = req.user.id;

  if (type === 'repost') {
    if (thread.reposts.includes(userId)) {
      thread.reposts = thread.reposts.filter(u => u !== userId);
    } else {
      thread.reposts.push(userId);
    }
  } else if (type === 'bookmark') {
    if (thread.bookmarks.includes(userId)) {
      thread.bookmarks = thread.bookmarks.filter(u => u !== userId);
    } else {
      thread.bookmarks.push(userId);
    }
  } else {
    // Pantip emotion (like, love, laugh, scare, impressed, sad)
    const validEmotion = emotion || 'like';
    if (!thread.reactions[validEmotion]) {
      thread.reactions[validEmotion] = [];
    }

    if (thread.reactions[validEmotion].includes(userId)) {
      // Toggle off
      thread.reactions[validEmotion] = thread.reactions[validEmotion].filter(u => u !== userId);
    } else {
      // Add reaction
      thread.reactions[validEmotion].push(userId);
    }
  }

  db.save();

  return res.json({
    message: 'อัปเดตการแสดงความรู้สึกสำเร็จ',
    thread: formatThread(thread, userId, req.user.role),
  });
});

// POST /api/threads/:id/report (User Report Form)
router.post('/:id/report', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ' });

  const { id } = req.params;
  const { reason } = req.body;
  const thread = db.findThreadById(id);

  if (!thread) {
    return res.status(404).json({ error: 'ไม่พบกระทู้' });
  }

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'กรุณาระบุเหตุผลการรายงานกระทู้' });
  }

  const newReport: Report = {
    id: 'rep_' + Date.now().toString(36),
    reporterId: req.user.id,
    targetType: 'thread',
    targetId: thread.id,
    targetTitle: thread.title,
    reason: reason.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.addReport(newReport);
  return res.status(201).json({ message: 'ส่งรายงานให้ผู้ดูแลระบบเรียบร้อยแล้ว ขอบคุณที่ร่วมดูแลชุมชนครับ' });
});

export default router;
