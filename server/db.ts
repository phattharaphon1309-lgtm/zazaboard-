import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Thread, Comment, Report, AuditLog, RoomCategory, SafeUser } from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: User[];
  threads: Thread[];
  comments: Comment[];
  reports: Report[];
  auditLogs: AuditLog[];
}

export const ROOMS: RoomCategory[] = [
  { id: 'all', name: 'รวมทุกห้อง', englishName: 'All Rooms', icon: '🌐', description: 'กระทู้และโพสต์ทั้งหมดในระบบ', color: 'from-purple-600 to-blue-600' },
  { id: 'silom', name: 'สีลม', englishName: 'Silom', icon: '💼', description: 'การทำงาน มนุษย์เงินเดือน ธุรกิจ ลงทุน และอาชีพ', color: 'from-blue-600 to-indigo-600' },
  { id: 'mbk', name: 'มาบุญครอง', englishName: 'MBK & Tech', icon: '📱', description: 'สมาร์ทโฟน แกดเจ็ต เทคโนโลยี และแอปพลิเคชัน', color: 'from-violet-600 to-purple-600' },
  { id: 'chalermthai', name: 'เฉลิมไทย', englishName: 'Entertainment', icon: '🎬', description: 'ภาพยนตร์ ซีรีส์ ละคร ดนตรี ดารา นักแสดง', color: 'from-fuchsia-600 to-pink-600' },
  { id: 'food', name: 'ก้นครัว', englishName: 'Food & Cooking', icon: '🍜', description: 'สูตรอาหาร ร้านเด็ด รีวิวของกิน คาเฟ่', color: 'from-amber-500 to-orange-600' },
  { id: 'wahkor', name: 'หว้ากอ', englishName: 'Science & Cosmos', icon: '🔬', description: 'วิทยาศาสตร์ อวกาศ วิศวกรรม และความรู้รอบตัว', color: 'from-cyan-600 to-blue-600' },
  { id: 'general', name: 'ไร้สังกัด & เทรนด์ X', englishName: 'X Trends & Free Talk', icon: '⚡', description: 'บ่น คุยเรื่อยเปื่อย มีม และเทรนด์ยอดนิยมสไตล์ X', color: 'from-purple-500 to-blue-500' },
];

export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '0xx-xxx-xxxx';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-***-${clean.slice(7)}`;
  }
  if (clean.length >= 7) {
    return `${clean.slice(0, 3)}***${clean.slice(-3)}`;
  }
  return '0xx-***-xxxx';
}

export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return 'u***@domain.com';
  const [name, domain] = email.split('@');
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

export function maskCitizenId(id?: string): string {
  if (!id) return 'x-xxxx-xxxxx-xx-x';
  const clean = id.replace(/[^0-9]/g, '');
  if (clean.length === 13) {
    return `${clean[0]}-${clean.slice(1, 5)}-*****-**-${clean.slice(-1)}`;
  }
  return 'x-xxxx-*****-xx-x';
}

export function toSafeUser(user: User, canViewUnmasked = false): SafeUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    email: canViewUnmasked ? user.email : maskEmail(user.email),
    phoneNumber: canViewUnmasked ? user.phoneNumber : maskPhoneNumber(user.phoneNumber),
    citizenId: canViewUnmasked ? user.citizenId : maskCitizenId(user.citizenId),
    maskedEmail: maskEmail(user.email),
    maskedPhone: maskPhoneNumber(user.phoneNumber),
    maskedCitizenId: maskCitizenId(user.citizenId),
    avatar: user.avatar,
    bio: user.bio,
    isVerified: user.isVerified,
    isSuspended: user.isSuspended,
    createdAt: user.createdAt,
  };
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    threads: [],
    comments: [],
    reports: [],
    auditLogs: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`[DB] Loaded ${this.data.users.length} users, ${this.data.threads.length} threads.`);
        return;
      } catch (err) {
        console.error('[DB] Failed reading db.json, reseeding...', err);
      }
    }

    this.seedInitialData();
    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving db.json:', err);
    }
  }

  private seedInitialData() {
    const adminPasswordHash = bcrypt.hashSync('Admin@12345678', 10);
    const userPasswordHash = bcrypt.hashSync('User@123456', 10);

    const adminUser: User = {
      id: 'usr_admin',
      username: 'Admin',
      displayName: 'Admin (ผู้ดูแลระบบ)',
      passwordHash: adminPasswordHash,
      role: 'admin',
      email: 'admin@punx.cyber',
      phoneNumber: '081-999-8888',
      citizenId: '1-1004-99887-12-3',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'ผู้ดูแลระบบ PunX Cyber // สิทธิ์สูงสุด 🛡️',
      isVerified: true,
      isSuspended: false,
      createdAt: '2026-01-01T08:00:00.000Z',
    };

    const somchaiUser: User = {
      id: 'usr_somchai',
      username: 'somchai_pantip',
      displayName: 'สมชาย เซียนพันทิป',
      passwordHash: userPasswordHash,
      role: 'user',
      email: 'somchai.pantip@punx.community',
      phoneNumber: '089-123-4567',
      citizenId: '3-1005-55443-88-1',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: 'สมาชิกรุ่นบุกเบิก ชอบอ่านห้องสีลมและหว้ากอ แลกเปลี่ยนความเห็นอย่างสร้างสรรค์',
      isVerified: true,
      isSuspended: false,
      createdAt: '2026-02-10T10:30:00.000Z',
    };

    const trendyUser: User = {
      id: 'usr_trendy',
      username: 'nong_x_trendy',
      displayName: 'น้องเอ็กซ์ สายเทรนด์',
      passwordHash: userPasswordHash,
      role: 'user',
      email: 'trendy.girl@punx.community',
      phoneNumber: '062-876-5432',
      citizenId: '1-2003-88776-90-2',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'ชอบอัปเดตเทรนด์ X ไว ปั่นมีม ดูซีรีส์เกาหลี คุยกันได้ทุกเรื่องงง ✨',
      isVerified: false,
      isSuspended: false,
      createdAt: '2026-03-01T14:20:00.000Z',
    };

    this.data.users = [adminUser, somchaiUser, trendyUser];

    const thread1: Thread = {
      id: 'th_1',
      authorId: 'usr_admin',
      title: '📌 [ประกาศกฎกติกา] ยินดีต้อนรับสู่ PunX เว็ปบอร์ดลูกผสมพันทิปและเอ็กซ์',
      content: `ยินดีต้อนรับสมาชิกทุกท่านเข้าสู่ PunX! 💜💙\n\nแพลตฟอร์มนี้รวมจุดเด่นของ **พันทิป (Pantip)** เช่น การแยกหมวดหมู่ห้องชัดเจน, ระบบอารมณ์ความรู้สึกพันทิป (ถูกใจ/หลงรัก/ขำกลิ้ง/ซึ้ง/สยอง/ทึ่ง), หมายเลขความคิดเห็น และจุดเด่นของ **X (Twitter)** เช่น การติดตามแท็ก #Trending, การรีโพสต์, ฟีดที่รวดเร็วทันใจ\n\n🔒 **นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA & Privacy Masking):**\nระบบจะทำการ Masking เบอร์โทรศัพท์และอีเมลของสมาชิกสาธารณะอัตโนมัติ เพื่อความปลอดภัยสูงสุด\n\nขอให้ทุกท่านร่วมพูดคุยกันด้วยความสุภาพและสร้างสรรค์ครับ!`,
      room: 'general',
      threadType: 'discussion',
      tags: ['#ประกาศจากแอดมิน', '#PunXCommunity', '#กฎระเบียบ'],
      isPinned: true,
      isLocked: false,
      views: 342,
      reactions: {
        like: ['usr_somchai', 'usr_trendy'],
        impressed: ['usr_somchai'],
      },
      reposts: ['usr_trendy'],
      bookmarks: ['usr_somchai'],
      createdAt: '2026-03-01T09:00:00.000Z',
      updatedAt: '2026-03-01T09:00:00.000Z',
    };

    const thread2: Thread = {
      id: 'th_2',
      authorId: 'usr_somchai',
      title: 'แชร์ประสบการณ์ทำงานสายเทคโนโลยี 5 ปี คุ้มไหมที่จะย้ายงานเพื่ออัพเงินเดือน?',
      content: `สวัสดีครับเพื่อนๆ ห้องสีลม ช่วงนี้เห็นเทรนด์หลายคนเปลี่ยนงานบ่อยเพื่อเพิ่มฐานเงินเดือน 30-50%\n\nจากประสบการณ์ส่วนตัวที่ทำงานเป็น Senior Software Engineer มา 5 ปี พบว่าการย้ายงานช่วยเรื่องเงินเดือนจริง แต่สิ่งที่ต้องแลกคือความน่าเชื่อถือในทีมเดิม วัฒนธรรมองค์กรใหม่ และความเสี่ยงช่วงทดลองงาน\n\nเพื่อนๆ คิดว่าในภาวะเศรษฐกิจปัจจุบัน การอยู่ยาวเพื่อเติบโตเป็น Lead หรือย้ายเก็บเกี่ยวประสบการณ์แบบไหนตอบโจทย์กว่ากันครับ?`,
      room: 'silom',
      threadType: 'discussion',
      tags: ['#มนุษย์เงินเดือน', '#สายไอที', '#หางาน', '#สีลม'],
      isPinned: false,
      isLocked: false,
      views: 189,
      reactions: {
        like: ['usr_trendy'],
        love: ['usr_admin'],
      },
      reposts: ['usr_trendy'],
      bookmarks: ['usr_admin'],
      createdAt: '2026-03-02T11:15:00.000Z',
      updatedAt: '2026-03-02T11:15:00.000Z',
    };

    const thread3: Thread = {
      id: 'th_3',
      authorId: 'usr_trendy',
      title: 'สรุปประเด็นร้อนติดเทรนด์วันนี้! ทำไมซีรีส์เรื่องใหม่ถึงไวรัลทั่วโซเชียล? 🔥',
      content: `ทุกคนนนน ใครได้ดูตอนล่าสุดแล้วบ้างงง คือเนื้อเรื่องหักมุมมาก บทคือเฉลยแบบที่ไม่มีใครคาดคิดเลย!\n\nนักแสดงเล่นดีจนน้ำตาซึม แสง สี มุมกล้อง โทนม่วงฟ้า aesthetic สวยมากก ใครยังไม่ได้ดูรีบไปตำด่วน ไม่งั้นจะคุยกับเขาไม่รู้เรื่องแน่ๆ! 🍿✨\n\n#ซีรีส์เด็ด #รีวิวซีรีส์ #เทรนด์วันนี้`,
      room: 'chalermthai',
      threadType: 'microblog',
      tags: ['#ซีรีส์เด็ด', '#รีวิวซีรีส์', '#เทรนด์วันนี้', '#เฉลิมไทย'],
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      isPinned: false,
      isLocked: false,
      views: 265,
      reactions: {
        laugh: ['usr_somchai'],
        love: ['usr_admin', 'usr_somchai'],
      },
      reposts: ['usr_somchai', 'usr_admin'],
      bookmarks: [],
      createdAt: '2026-03-03T15:40:00.000Z',
      updatedAt: '2026-03-03T15:40:00.000Z',
    };

    this.data.threads = [thread1, thread2, thread3];

    this.data.comments = [
      {
        id: 'cm_1',
        threadId: 'th_1',
        authorId: 'usr_somchai',
        content: 'ชอบฟังก์ชันปกป้องเบอร์โทรศัพท์มากครับ ในยุคแก๊งคอลเซ็นเตอร์ระบาดแบบนี้ ปลอดภัยขึ้นเยอะเลย',
        pantipEmotion: 'love',
        upvotes: ['usr_admin', 'usr_trendy'],
        commentNumber: 1,
        createdAt: '2026-03-01T10:00:00.000Z',
        updatedAt: '2026-03-01T10:00:00.000Z',
      },
      {
        id: 'cm_2',
        threadId: 'th_2',
        authorId: 'usr_trendy',
        content: 'เห็นด้วยเลยค่ะ ย้ายบ่อยเกินไป เรซูเม่ดูไม่นิ่ง แต่ถ้าอยู่ที่เดิมเกิน 3 ปีแล้วเงินเดือนไม่ขยับ ก็ควรลองสัมภาษณ์ดูโอกาสใหม่ๆ นะคะ',
        pantipEmotion: 'like',
        upvotes: ['usr_somchai'],
        commentNumber: 1,
        createdAt: '2026-03-02T13:20:00.000Z',
        updatedAt: '2026-03-02T13:20:00.000Z',
      },
    ];

    this.data.auditLogs = [
      {
        id: 'log_1',
        adminId: 'usr_admin',
        adminName: 'ผู้ดูแลระบบ PunX (Admin)',
        action: 'PIN_THREAD',
        target: 'th_1',
        details: 'ปักหมุดกระทู้กฎกติกาการใช้งานบอร์ด',
        createdAt: '2026-03-01T09:05:00.000Z',
      },
    ];
  }

  // User Operations
  public getUsers() {
    return this.data.users;
  }

  public findUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByUsername(username: string) {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  public findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // Thread Operations
  public getThreads() {
    return this.data.threads;
  }

  public findThreadById(id: string) {
    return this.data.threads.find(t => t.id === id);
  }

  public addThread(thread: Thread) {
    this.data.threads.unshift(thread);
    this.save();
    return thread;
  }

  public updateThread(id: string, updates: Partial<Thread>) {
    const idx = this.data.threads.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.threads[idx] = { ...this.data.threads[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.threads[idx];
    }
    return null;
  }

  public deleteThread(id: string) {
    const idx = this.data.threads.findIndex(t => t.id === id);
    if (idx !== -1) {
      const deleted = this.data.threads.splice(idx, 1)[0];
      // remove associated comments
      this.data.comments = this.data.comments.filter(c => c.threadId !== id);
      this.save();
      return deleted;
    }
    return null;
  }

  // Comment Operations
  public getComments(threadId?: string) {
    if (threadId) {
      return this.data.comments.filter(c => c.threadId === threadId);
    }
    return this.data.comments;
  }

  public findCommentById(id: string) {
    return this.data.comments.find(c => c.id === id);
  }

  public addComment(comment: Comment) {
    this.data.comments.push(comment);
    this.save();
    return comment;
  }

  public deleteComment(id: string) {
    const idx = this.data.comments.findIndex(c => c.id === id);
    if (idx !== -1) {
      const deleted = this.data.comments.splice(idx, 1)[0];
      this.save();
      return deleted;
    }
    return null;
  }

  // Reports
  public getReports() {
    return this.data.reports;
  }

  public addReport(report: Report) {
    this.data.reports.unshift(report);
    this.save();
    return report;
  }

  public updateReport(id: string, updates: Partial<Report>) {
    const idx = this.data.reports.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.reports[idx] = { ...this.data.reports[idx], ...updates };
      this.save();
      return this.data.reports[idx];
    }
    return null;
  }

  // Audit Logs
  public getAuditLogs() {
    return this.data.auditLogs;
  }

  public addAuditLog(log: AuditLog) {
    this.data.auditLogs.unshift(log);
    this.save();
    return log;
  }
}

export const db = new Database();
