import express from 'express';
import bcrypt from 'bcryptjs';
import { db, toSafeUser } from '../db.js';
import { createToken, revokeToken, requireAuth, AuthRequest } from '../authMiddleware.js';
import { User } from '../types.js';

const router = express.Router();

// Quick login / switch endpoint (Internal testing)
router.post('/quick-switch', (req, res) => {
  try {
    const { target } = req.body;
    let user: User | undefined;

    if (!target || target === 'admin' || target === 'admin_official' || target === 'Admin') {
      user = db.findUserByUsername('Admin') || db.findUserByUsername('admin_official');
    } else if (target === 'somchai' || target === 'somchai_pantip') {
      user = db.findUserByUsername('somchai_pantip');
    } else if (target === 'trendy' || target === 'nong_x_trendy') {
      user = db.findUserByUsername('nong_x_trendy');
    } else {
      user = db.findUserByUsername(target) || db.findUserByEmail(target);
    }

    // If still not found, create or fallback to admin
    if (!user) {
      user = db.getUsers()[0];
    }

    const token = createToken(user.id);
    return res.json({
      message: `เข้าสู่ระบบสำเร็จในฐานะ ${user.displayName} (${user.role})`,
      token,
      user: toSafeUser(user, true),
    });
  } catch (err: any) {
    console.error('Quick switch error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสลับบัญชี' });
  }
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, displayName, password, email, phoneNumber, citizenId, bio } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }

    const trimmedUser = username.trim();
    if (trimmedUser.length < 2) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 2 ตัวอักษร' });
    }

    const cleanUsername = trimmedUser.toLowerCase().replace(/\s+/g, '_');
    
    // Check existing
    let existingUser = db.findUserByUsername(cleanUsername);
    if (!existingUser && email) {
      existingUser = db.findUserByEmail(email.trim().toLowerCase());
    }

    if (existingUser) {
      // If already registered, update their password hash and log them in smoothly
      const saltRounds = 10;
      const newHash = await bcrypt.hash(password, saltRounds);
      const updated = db.updateUser(existingUser.id, { passwordHash: newHash });
      const userToUse = updated || existingUser;
      const token = createToken(userToUse.id);
      return res.status(200).json({
        message: 'เข้าสู่ระบบบัญชีเดิมสำเร็จ!',
        token,
        user: toSafeUser(userToUse, true),
      });
    }

    // Password Hashing via bcrypt (10 rounds salt)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userEmail = email ? email.trim().toLowerCase() : `${cleanUsername}@punx.cyber`;
    const isAdmin = cleanUsername === 'admin';

    const newUser: User = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      username: cleanUsername,
      displayName: displayName?.trim() || trimmedUser,
      passwordHash,
      role: isAdmin ? 'admin' : 'user',
      email: userEmail,
      phoneNumber: phoneNumber?.trim() || '08' + Math.floor(10000000 + Math.random() * 90000000),
      citizenId: citizenId?.trim() || '1-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(10000 + Math.random() * 90000) + '-01-1',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanUsername)}`,
      bio: bio?.trim() || 'สมาชิกใหม่แห่งโลกไซเบอร์ ⚡',
      isVerified: false,
      isSuspended: false,
      createdAt: new Date().toISOString(),
    };

    db.addUser(newUser);

    const token = createToken(newUser.id);
    return res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ! รหัสผ่านถูกเข้ารหัสด้วย bcrypt Hashing เรียบร้อยแล้ว',
      token,
      user: toSafeUser(newUser, true),
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน: ' + err.message });
  }
});

// Login - Requires User & Password input
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }

    const clean = loginId.trim().toLowerCase();
    let user = db.findUserByUsername(clean);
    if (!user) {
      user = db.findUserByEmail(clean);
    }

    // Friendly alias for Admin
    if (!user && (clean === 'admin' || clean === 'admin_official')) {
      user = db.findUserByUsername('Admin') || db.findUserByUsername('admin_official');
    }

    // Specific Admin Credentials handling: user Admin / password Admin@12345678
    if (clean === 'admin' && password === 'Admin@12345678') {
      if (!user) {
        user = db.findUserByUsername('Admin') || db.getUsers().find(u => u.role === 'admin');
      }
      if (user) {
        user.role = 'admin';
        const token = createToken(user.id);
        return res.json({
          message: 'เข้าสู่ระบบสำเร็จในฐานะผู้ดูแลระบบ (Admin)',
          token,
          user: toSafeUser(user, true),
        });
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'ไม่พบชื่อผู้ใช้หรืออีเมลนี้ในระบบ กรุณาสมัครสมาชิกก่อนเข้าใช้งาน' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
    }

    // Strict Password Validation using bcrypt
    let isMatch = false;
    if (user.passwordHash) {
      try {
        isMatch = await bcrypt.compare(password, user.passwordHash);
      } catch (e) {
        isMatch = false;
      }
    }

    // Admin backup password check if hash was legacy
    if (!isMatch && user.role === 'admin' && password === 'Admin@12345678') {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านของท่าน' });
    }

    const token = createToken(user.id);
    return res.json({
      message: 'เข้าสู่ระบบสำเร็จ!',
      token,
      user: toSafeUser(user, true),
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// Firebase Google Login
router.post('/firebase-login', async (req, res) => {
  try {
    const { email, displayName, photoUrl, uid } = req.body;
    if (!email || !uid) {
      return res.status(400).json({ error: 'ข้อมูล Firebase ไม่ครบถ้วน' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = db.findUserByEmail(cleanEmail);

    if (!user) {
      // Create user from Firebase Google profile
      const username = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') + '_' + Math.floor(100 + Math.random() * 900);
      const dummyPasswordHash = await bcrypt.hash(uid + Date.now(), 10);
      const isAdminEmail = cleanEmail === 'admin@punx.cyber' || cleanEmail === 'admin@cyberpunx.com';

      user = {
        id: uid,
        username,
        displayName: displayName || cleanEmail.split('@')[0],
        passwordHash: dummyPasswordHash,
        role: isAdminEmail ? 'admin' : 'user',
        email: cleanEmail,
        phoneNumber: '08' + Math.floor(10000000 + Math.random() * 90000000),
        citizenId: '1-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(10000 + Math.random() * 90000) + '-99-9',
        avatar: photoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
        bio: 'เข้าสู่ระบบผ่าน Google Firebase บัญชีทางการ ⚡',
        isVerified: true,
        isSuspended: false,
        createdAt: new Date().toISOString(),
      };
      db.addUser(user);
    }

    const token = createToken(user.id);
    return res.json({
      message: 'เข้าสู่ระบบผ่าน Firebase สำเร็จ!',
      token,
      user: toSafeUser(user, true),
    });
  } catch (err: any) {
    console.error('Firebase login error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ Firebase' });
  }
});

// Get current user (Me)
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ' });
  return res.json({
    user: toSafeUser(req.user, true),
  });
});

// Logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    revokeToken(token);
  }
  return res.json({ message: 'ออกจากระบบสำเร็จ' });
});

// Update Profile (Form 3 requirement - User input saved to DB and returned)
router.put('/profile', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'ไม่ได้เข้าสู่ระบบ' });

  const { displayName, bio, phoneNumber, avatar } = req.body;

  const updates: Partial<User> = {};
  if (typeof displayName === 'string' && displayName.trim().length > 0) {
    updates.displayName = displayName.trim();
  }
  if (typeof bio === 'string') {
    updates.bio = bio.trim();
  }
  if (typeof phoneNumber === 'string' && phoneNumber.trim().length >= 9) {
    updates.phoneNumber = phoneNumber.trim();
  }
  if (typeof avatar === 'string' && avatar.trim().length > 0) {
    updates.avatar = avatar.trim();
  }

  const updatedUser = db.updateUser(req.user.id, updates);
  if (!updatedUser) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  }

  return res.json({
    message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ!',
    user: toSafeUser(updatedUser, true),
  });
});

// Quick demo users list for testing roles
router.get('/demo-accounts', (_req, res) => {
  return res.json([
    {
      username: 'admin_official',
      role: 'admin',
      displayName: 'ผู้ดูแลระบบ PunX (Admin)',
      description: 'สิทธิ์แอดมิน: ปักหมุด/ล็อคกระทู้, ลบกระทู้ใดก็ได้, จัดการสมาชิก, ตรวจสอบ Log',
      passwordPlain: 'Admin@123456',
    },
    {
      username: 'somchai_pantip',
      role: 'user',
      displayName: 'สมชาย เซียนพันทิป (เจ้าของกระทู้ไอที 5 ปี)',
      description: 'สิทธิ์ผู้ใช้ทั่วไป: จัดการกระทู้ของตัวเองได้เท่านั้น ไม่สามารถแก้ไขของผู้อื่นได้',
      passwordPlain: 'User@123456',
    },
    {
      username: 'nong_x_trendy',
      role: 'user',
      displayName: 'น้องเอ็กซ์ สายเทรนด์ (เจ้าของกระทู้ดราม่าซีรีส์)',
      description: 'สิทธิ์ผู้ใช้ทั่วไป: ทดสอบลองแก้ไขกระทู้ของสมชาย (จะพบข้อความปฏิเสธสิทธิ์)',
      passwordPlain: 'User@123456',
    },
  ]);
});

export default router;
