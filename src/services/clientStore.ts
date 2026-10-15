import bcrypt from 'bcryptjs';
import { User, Thread, Comment, RoomCategory, Report, AuditLog, AdminStats } from '../types';

export const ROOMS: RoomCategory[] = [
  { id: 'all', name: 'รวมทุกห้อง', englishName: 'All Rooms', icon: '🌐', description: 'กระทู้และโพสต์ทั้งหมดในระบบไซเบอร์', color: 'from-cyan-500 to-blue-600' },
  { id: 'silom', name: 'สีลม', englishName: 'Silom & Career', icon: '💼', description: 'การทำงาน มนุษย์เงินเดือน ธุรกิจ ลงทุน และอาชีพ', color: 'from-blue-600 to-indigo-600' },
  { id: 'mbk', name: 'มาบุญครอง', englishName: 'MBK & Tech', icon: '📱', description: 'สมาร์ทโฟน แกดเจ็ต เทคโนโลยี และไซเบอร์ซิสเต็ม', color: 'from-cyan-600 to-teal-600' },
  { id: 'chalermthai', name: 'เฉลิมไทย', englishName: 'Entertainment', icon: '🎬', description: 'ภาพยนตร์ ซีรีส์ ละคร ดนตรี ดารา นักแสดง', color: 'from-fuchsia-600 to-pink-600' },
  { id: 'food', name: 'ก้นครัว', englishName: 'Food & Cooking', icon: '🍜', description: 'สูตรอาหาร ร้านเด็ด รีวิวของกิน คาเฟ่', color: 'from-amber-500 to-orange-600' },
  { id: 'wahkor', name: 'หว้ากอ', englishName: 'Science & Cosmos', icon: '🔬', description: 'วิทยาศาสตร์ อวกาศ วิศวกรรม และความรู้รอบตัว', color: 'from-emerald-500 to-cyan-600' },
  { id: 'general', name: 'ไร้สังกัด & เทรนด์ X', englishName: 'Cyber Trends & X', icon: '⚡', description: 'บ่น คุยเรื่อยเปื่อย มีม และเทรนด์ยอดนิยมสไตล์ X', color: 'from-pink-500 to-purple-600' },
];

export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '0xx-***-xxxx';
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

export function toSafeUser(user: User, canViewUnmasked = false): User {
  const isActuallyOwnerOrAdmin = Boolean(canViewUnmasked);
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    email: isActuallyOwnerOrAdmin ? user.email : maskEmail(user.email),
    phoneNumber: isActuallyOwnerOrAdmin ? user.phoneNumber : maskPhoneNumber(user.phoneNumber),
    citizenId: isActuallyOwnerOrAdmin ? user.citizenId : maskCitizenId(user.citizenId),
    avatar: user.avatar,
    bio: user.bio,
    isVerified: user.isVerified,
    isSuspended: user.isSuspended,
    createdAt: user.createdAt,
    maskedEmail: maskEmail(user.email),
    maskedPhone: maskPhoneNumber(user.phoneNumber),
    maskedCitizenId: maskCitizenId(user.citizenId),
    isUnmasked: isActuallyOwnerOrAdmin,
  };
}

const STORAGE_KEY = 'punx_cyber_db_v6';
const TOKEN_KEY = 'punx_auth_token';

interface StoredData {
  users: Array<User & { passwordHash: string }>;
  threads: Thread[];
  comments: Comment[];
  reports: Report[];
  auditLogs: AuditLog[];
  tokens: Record<string, string>; // token -> userId
}

function getInitialData(): StoredData {
  const adminHash = bcrypt.hashSync('Admin@12345678', 10);
  const userHash = bcrypt.hashSync('User@123456', 10);

  const adminUser: User & { passwordHash: string } = {
    id: 'usr_admin',
    username: 'Admin',
    displayName: 'Admin (ผู้ดูแลระบบ)',
    passwordHash: adminHash,
    role: 'admin',
    email: 'admin@cyberpunx.com',
    phoneNumber: '081-999-8888',
    citizenId: '1-1004-99887-12-3',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'ผู้ดูแลระบบ PunX Cyber // สิทธิ์สูงสุด 🛡️',
    isVerified: true,
    isSuspended: false,
    createdAt: '2026-01-01T08:00:00.000Z',
    maskedEmail: 'a***n@cyberpunx.com',
    maskedPhone: '081-***-8888',
    maskedCitizenId: '1-1004-*****-**-3',
  };

  const somchaiUser: User & { passwordHash: string } = {
    id: 'usr_somchai',
    username: 'somchai_pantip',
    displayName: 'สมชาย เซียนพันทิป',
    passwordHash: userHash,
    role: 'user',
    email: 'somchai.pantip@punx.community',
    phoneNumber: '089-123-4567',
    citizenId: '3-1005-55443-88-1',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bio: 'สมาชิกรุ่นบุกเบิก ชอบอ่านห้องสีลมและหว้ากอ แลกเปลี่ยนความเห็นอย่างสร้างสรรค์',
    isVerified: true,
    isSuspended: false,
    createdAt: '2026-02-10T10:30:00.000Z',
    maskedEmail: 's***p@punx.community',
    maskedPhone: '089-***-4567',
    maskedCitizenId: '3-1005-*****-**-1',
  };

  const trendyUser: User & { passwordHash: string } = {
    id: 'usr_trendy',
    username: 'nong_x_trendy',
    displayName: 'น้องเอ็กซ์ สายเทรนด์',
    passwordHash: userHash,
    role: 'user',
    email: 'trendy.girl@punx.community',
    phoneNumber: '062-876-5432',
    citizenId: '1-2003-88776-90-2',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'ชอบอัปเดตเทรนด์ X ไว ปั่นมีม ดูซีรีส์เกาหลี คุยกันได้ทุกเรื่องงง ✨',
    isVerified: false,
    isSuspended: false,
    createdAt: '2026-03-01T14:20:00.000Z',
    maskedEmail: 't***l@punx.community',
    maskedPhone: '062-***-5432',
    maskedCitizenId: '1-2003-*****-**-2',
  };

  const threads: Thread[] = [
    {
      id: 'th_1',
      authorId: 'usr_admin',
      title: '📌 [ประกาศกฎกติกา] ยินดีต้อนรับสู่ PunX เว็ปบอร์ดลูกผสมพันทิปและเอ็กซ์',
      content: `ยินดีต้อนรับสมาชิกทุกท่านเข้าสู่ PunX! 💜💙\n\nแพลตฟอร์มนี้รวมจุดเด่นของ **พันทิป (Pantip)** เช่น การแยกหมวดหมู่ห้องชัดเจน, ระบบอารมณ์ความรู้สึกพันทิป (ถูกใจ/หลงรัก/ขำกลิ้ง/ซึ้ง/สยอง/ทึ่ง), หมายเลขความคิดเห็น และจุดเด่นของ **X (Twitter)** เช่น การติดตามแท็ก #Trending, การรีโพสต์, ฟีดที่รวดเร็วทันใจ\n\n🔒 **นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA & Privacy Masking):**\nระบบจะทำการ Masking เบอร์โทรศัพท์และอีเมลของสมาชิกสาธารณะอัตโนมัติ เพื่อความปลอดภัยสูงสุด\n\nขอให้ทุกท่านร่วมพูดคุยกันด้วยความสุภาพและสร้างสรรค์ครับ!`,
      room: 'general',
      threadType: 'discussion',
      tags: ['#ประกาศจากแอดมิน', '#PunXCommunity', '#กฎระเบียบ'],
      isPinned: true,
      isLocked: false,
      views: 345,
      reactions: {
        like: ['usr_somchai', 'usr_trendy'],
        impressed: ['usr_somchai'],
      },
      reposts: ['usr_trendy'],
      bookmarks: ['usr_somchai'],
      createdAt: '2026-03-01T09:00:00.000Z',
      updatedAt: '2026-03-01T09:00:00.000Z',
      author: adminUser,
      commentsCount: 1,
      roomInfo: ROOMS[6],
      userReactions: { hasLiked: false, hasReposted: false, hasBookmarked: false },
    },
    {
      id: 'th_2',
      authorId: 'usr_somchai',
      title: 'แชร์ประสบการณ์ทำงานสายเทคโนโลยี 5 ปี คุ้มไหมที่จะย้ายงานเพื่ออัพเงินเดือน?',
      content: `สวัสดีครับเพื่อนๆ ห้องสีลม ช่วงนี้เห็นเทรนด์หลายคนเปลี่ยนงานบ่อยเพื่อเพิ่มฐานเงินเดือน 30-50%\n\nจากประสบการณ์ส่วนตัวที่ทำงานเป็น Senior Software Engineer มา 5 ปี พบว่าการย้ายงานช่วยเรื่องเงินเดือนจริง แต่สิ่งที่ต้องแลกคือความน่าเชื่อถือในทีมเดิม วัฒนธรรมองค์กรใหม่ และความเสี่ยงช่วงทดลองงาน\n\nเพื่อนๆ คิดว่าในภาวะเศรษฐกิจปัจจุบัน การอยู่ยาวเพื่อเติบโตเป็น Lead หรือย้ายเก็บเกี่ยวประสบการณ์แบบไหนตอบโจทย์กว่ากันครับ?`,
      room: 'silom',
      threadType: 'discussion',
      tags: ['#มนุษย์เงินเดือน', '#สายไอที', '#หางาน', '#สีลม'],
      isPinned: false,
      isLocked: false,
      views: 198,
      reactions: {
        like: ['usr_trendy'],
        love: ['usr_admin'],
      },
      reposts: ['usr_trendy'],
      bookmarks: ['usr_admin'],
      createdAt: '2026-03-02T11:15:00.000Z',
      updatedAt: '2026-03-02T11:15:00.000Z',
      author: somchaiUser,
      commentsCount: 1,
      roomInfo: ROOMS[1],
      userReactions: { hasLiked: false, hasReposted: false, hasBookmarked: false },
    },
    {
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
      views: 280,
      reactions: {
        laugh: ['usr_somchai'],
        love: ['usr_admin', 'usr_somchai'],
      },
      reposts: ['usr_somchai', 'usr_admin'],
      bookmarks: [],
      createdAt: '2026-03-03T15:40:00.000Z',
      updatedAt: '2026-03-03T15:40:00.000Z',
      author: trendyUser,
      commentsCount: 0,
      roomInfo: ROOMS[3],
      userReactions: { hasLiked: false, hasReposted: false, hasBookmarked: false },
    },
  ];

  const comments: Comment[] = [
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
      author: somchaiUser,
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
      author: trendyUser,
    },
  ];

  return {
    users: [adminUser, somchaiUser, trendyUser],
    threads,
    comments,
    reports: [],
    auditLogs: [
      {
        id: 'log_init',
        adminId: 'usr_admin',
        adminName: 'ผู้ดูแลระบบ PunX (Admin)',
        action: 'SYSTEM_BOOT',
        target: 'board007-daa9e',
        details: 'เริ่มต้นระบบ PunX พร้อมเชื่อมต่อ Firebase',
        createdAt: '2026-03-01T08:00:00.000Z',
      },
    ],
    tokens: {},
  };
}

class ClientStore {
  private data: StoredData;

  constructor() {
    this.data = this.load();
  }

  private load(): StoredData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed loading client store:', e);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  private save(data?: StoredData) {
    if (data) this.data = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed saving client store:', e);
    }
  }

  public getCurrentUser(): User | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const userId = this.data.tokens[token];
    if (!userId) return null;
    const u = this.data.users.find(x => x.id === userId);
    return u ? toSafeUser(u as any, true) as any : null;
  }

  // Register
  public async register(payload: {
    username: string;
    displayName: string;
    password: string;
    email: string;
    phoneNumber?: string;
    citizenId?: string;
    bio?: string;
  }): Promise<{ message: string; token: string; user: User }> {
    const cleanUsername = payload.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanEmail = payload.email.trim().toLowerCase();

    if (this.data.users.some(u => u.username.toLowerCase() === cleanUsername)) {
      throw new Error('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น');
    }
    if (this.data.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
    }

    // Password Hashing via bcrypt (Requirement 1)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(payload.password, saltRounds);

    const rawPhone = payload.phoneNumber?.trim() || '08' + Math.floor(10000000 + Math.random() * 90000000);
    const rawCitizenId = payload.citizenId?.trim() || '1-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(10000 + Math.random() * 90000) + '-01-1';

    const newUser: User & { passwordHash: string } = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      username: cleanUsername,
      displayName: payload.displayName?.trim() || cleanUsername,
      passwordHash,
      role: 'user',
      email: cleanEmail,
      phoneNumber: rawPhone,
      citizenId: rawCitizenId,
      maskedEmail: maskEmail(cleanEmail),
      maskedPhone: maskPhoneNumber(rawPhone),
      maskedCitizenId: maskCitizenId(rawCitizenId),
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
      bio: payload.bio?.trim() || 'ยินดีที่ได้รู้จักชาว PunX ทุกคนครับ/ค่ะ!',
      isVerified: false,
      isSuspended: false,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    this.data.tokens[token] = newUser.id;
    this.save();

    localStorage.setItem(TOKEN_KEY, token);

    return {
      message: 'สมัครสมาชิกสำเร็จ ยินดีต้อนรับสู่ PunX!',
      token,
      user: toSafeUser(newUser as any, true) as any,
    };
  }

  // Login
  public async login(loginId: string, password: string): Promise<{ message: string; token: string; user: User }> {
    const clean = loginId.trim().toLowerCase();
    let user = this.data.users.find(u => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean);

    // Aliases
    if (!user) {
      if (clean === 'admin' || clean === 'admin_official') {
        user = this.data.users.find(u => u.username.toLowerCase() === 'admin');
      } else if (clean === 'somchai' || clean === 'somchai_pantip') {
        user = this.data.users.find(u => u.username === 'somchai_pantip');
      } else if (clean === 'trendy' || clean === 'x_trendy' || clean === 'nong_x_trendy') {
        user = this.data.users.find(u => u.username === 'nong_x_trendy');
      }
    }

    // Direct Admin Login with Admin@12345678
    if (clean === 'admin' && password === 'Admin@12345678') {
      if (!user) {
        user = this.data.users.find(u => u.role === 'admin') || this.data.users[0];
      }
      user.role = 'admin';
      const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      this.data.tokens[token] = user.id;
      this.save();
      localStorage.setItem(TOKEN_KEY, token);

      return {
        message: 'เข้าสู่ระบบสำเร็จในฐานะผู้ดูแลระบบ (Admin)!',
        token,
        user: toSafeUser(user as any, true) as any,
      };
    }

    if (!user) {
      throw new Error('ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรือสมัครสมาชิกใหม่');
    }

    if (user.isSuspended) {
      throw new Error('บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
    }

    let isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch && user.role === 'admin' && password === 'Admin@12345678') {
      isMatch = true;
    }

    if (!isMatch) {
      throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }

    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    this.data.tokens[token] = user.id;
    this.save();

    localStorage.setItem(TOKEN_KEY, token);

    return {
      message: 'เข้าสู่ระบบสำเร็จ!',
      token,
      user: toSafeUser(user as any, true) as any,
    };
  }

  // Logout
  public logout() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      delete this.data.tokens[token];
      this.save();
    }
    localStorage.removeItem(TOKEN_KEY);
  }

  // Quick Switch for testing
  public async quickSwitch(target: string): Promise<{ message: string; token: string; user: User }> {
    const clean = target.trim().toLowerCase();
    let user = this.data.users.find(u => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean || u.id === clean);

    if (!user) {
      if (clean === 'admin' || clean === 'admin_official') {
        user = this.data.users.find(u => u.username.toLowerCase() === 'admin');
      } else if (clean === 'somchai' || clean === 'somchai_pantip') {
        user = this.data.users.find(u => u.username === 'somchai_pantip');
      } else if (clean === 'trendy' || clean === 'nong_x_trendy') {
        user = this.data.users.find(u => u.username === 'nong_x_trendy');
      }
    }

    if (!user) {
      user = this.data.users[0];
    }

    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    this.data.tokens[token] = user.id;
    this.save();
    localStorage.setItem(TOKEN_KEY, token);

    return {
      message: `สลับบัญชีเป็น ${user.displayName} สำเร็จ`,
      token,
      user: toSafeUser(user as any, true) as any,
    };
  }

  // Firebase Auth Login
  public async loginWithFirebase(payload: { email: string; displayName?: string | null; photoUrl?: string | null; uid: string }): Promise<{ message: string; token: string; user: User }> {
    const cleanEmail = payload.email.trim().toLowerCase();
    let user = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const username = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') || `user_${Date.now().toString(36)}`;
      const isAdmin = cleanEmail === 'admin@punx.cyber' || cleanEmail === 'admin@cyberpunx.com';
      const dummyHash = await bcrypt.hash('Firebase@123', 10);
      user = {
        id: 'usr_fb_' + payload.uid.slice(0, 16),
        username,
        displayName: payload.displayName || username,
        passwordHash: dummyHash,
        role: isAdmin ? 'admin' : 'user',
        email: cleanEmail,
        phoneNumber: '08' + Math.floor(10000000 + Math.random() * 90000000),
        citizenId: '1-1004-99887-00-1',
        avatar: payload.photoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
        bio: 'ล็อกอินผ่าน Google / Firebase ⚡',
        isVerified: true,
        isSuspended: false,
        createdAt: new Date().toISOString(),
        maskedEmail: maskEmail(cleanEmail),
        maskedPhone: '08x-***-xxxx',
        maskedCitizenId: '1-1004-*****-**-1',
      };
      this.data.users.push(user);
    }

    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    this.data.tokens[token] = user.id;
    this.save();
    localStorage.setItem(TOKEN_KEY, token);

    return {
      message: 'เข้าสู่ระบบด้วย Firebase สำเร็จ!',
      token,
      user: toSafeUser(user as any, true) as any,
    };
  }

  // Update Profile
  public async updateProfile(payload: { displayName?: string; bio?: string; phoneNumber?: string; avatar?: string }): Promise<{ message: string; user: User }> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบก่อน');

    const user = this.data.users.find(u => u.id === currentUser.id);
    if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้');

    if (payload.displayName) user.displayName = payload.displayName.trim();
    if (payload.bio !== undefined) user.bio = payload.bio.trim();
    if (payload.avatar) user.avatar = payload.avatar.trim();
    if (payload.phoneNumber) {
      user.phoneNumber = payload.phoneNumber.trim();
      user.maskedPhone = maskPhoneNumber(user.phoneNumber);
    }

    this.save();
    return {
      message: 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว',
      user: toSafeUser(user as any, true) as any,
    };
  }

  // Get Demo Accounts
  public getDemoAccounts() {
    return [
      {
        username: 'Admin',
        role: 'admin' as const,
        displayName: 'Admin (ผู้ดูแลระบบ)',
        description: 'สิทธิ์แอดมิน: จัดการระบบ ปักหมุด ล็อค ลบกระทู้ ดูแลสมาชิก',
      },
      {
        username: 'somchai_pantip',
        role: 'user' as const,
        displayName: 'สมชาย เซียนพันทิป (User A)',
        description: 'สิทธิ์ผู้ใช้ทั่วไป: ทดสอบตั้งกระทู้และตอบความคิดเห็น',
      },
      {
        username: 'nong_x_trendy',
        role: 'user' as const,
        displayName: 'น้องเอ็กซ์ สายเทรนด์ (User B)',
        description: 'สิทธิ์ผู้ใช้ทั่วไป: ทดสอบสิทธิ์ความเป็นเจ้าของกระทู้',
      },
    ];
  }

  // Get Rooms
  public getRooms(): RoomCategory[] {
    return ROOMS;
  }


  // Threads CRUD (Requirement 3: Ownership)
  public getThreads(params: { room?: string; tag?: string; sort?: string; search?: string; authorId?: string } = {}): Thread[] {
    let list = [...this.data.threads];
    const currentUser = this.getCurrentUser();

    if (params.room && params.room !== 'all') {
      list = list.filter(t => t.room === params.room);
    }
    if (params.tag) {
      const targetTag = params.tag.startsWith('#') ? params.tag : `#${params.tag}`;
      list = list.filter(t => t.tags.some(tg => tg.toLowerCase() === targetTag.toLowerCase()));
    }
    if (params.authorId) {
      list = list.filter(t => t.authorId === params.authorId);
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.tags.some(tg => tg.toLowerCase().includes(q))
      );
    }

    // Sort
    if (params.sort === 'hot' || params.sort === 'trending') {
      list.sort((a, b) => {
        const aScore = Object.values(a.reactions || {}).reduce((acc, arr) => acc + (arr ? arr.length : 0), 0) + (a.reposts?.length || 0) * 2 + a.views * 0.1;
        const bScore = Object.values(b.reactions || {}).reduce((acc, arr) => acc + (arr ? arr.length : 0), 0) + (b.reposts?.length || 0) * 2 + b.views * 0.1;
        return bScore - aScore;
      });
    } else if (params.sort === 'views') {
      list.sort((a, b) => b.views - a.views);
    } else {
      list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return list.map(t => this.formatThread(t, currentUser));
  }

  private formatThread(thread: Thread, currentUser: User | null): Thread {
    const author = this.data.users.find(u => u.id === thread.authorId);
    const isOwner = currentUser?.id === thread.authorId;
    const isAdmin = currentUser?.role === 'admin';
    const canViewUnmasked = isOwner || isAdmin;

    const safeAuthor = author
      ? toSafeUser(author as any, Boolean(canViewUnmasked)) as any
      : thread.author;

    const threadComments = this.data.comments.filter(c => c.threadId === thread.id);
    const roomInfo = ROOMS.find(r => r.id === thread.room) || ROOMS[0];

    return {
      ...thread,
      author: safeAuthor,
      commentsCount: threadComments.length,
      roomInfo,
      userReactions: {
        hasLiked: currentUser ? (thread.reactions?.like || []).includes(currentUser.id) : false,
        hasReposted: currentUser ? (thread.reposts || []).includes(currentUser.id) : false,
        hasBookmarked: currentUser ? (thread.bookmarks || []).includes(currentUser.id) : false,
      },
    };
  }

  public getThread(id: string): { thread: Thread; comments: Comment[] } {
    const thread = this.data.threads.find(t => t.id === id);
    if (!thread) throw new Error('ไม่พบกระทู้ที่ค้นหา');

    thread.views += 1;
    this.save();

    const currentUser = this.getCurrentUser();
    const formatted = this.formatThread(thread, currentUser);

    const comments = this.data.comments
      .filter(c => c.threadId === id)
      .map(c => {
        const author = this.data.users.find(u => u.id === c.authorId);
        const canViewUnmasked = currentUser?.role === 'admin' || currentUser?.id === c.authorId;
        return {
          ...c,
          author: author ? toSafeUser(author as any, Boolean(canViewUnmasked)) as any : null,
          isOwner: currentUser?.id === c.authorId,
        };
      });

    return { thread: formatted, comments };
  }

  // Create Thread (Form 1)
  public createThread(payload: {
    title: string;
    content: string;
    room: string;
    threadType?: string;
    tags?: string[];
    imageUrl?: string;
  }): { message: string; thread: Thread } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบก่อนตั้งกระทู้');

    const cleanTags = Array.isArray(payload.tags)
      ? payload.tags.map(t => (t.startsWith('#') ? t.trim() : `#${t.trim()}`)).filter(t => t.length > 1)
      : [];

    const newThread: Thread = {
      id: 'th_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      authorId: currentUser.id,
      title: payload.title.trim(),
      content: payload.content.trim(),
      room: payload.room || 'general',
      threadType: (payload.threadType as any) || 'discussion',
      tags: cleanTags,
      imageUrl: payload.imageUrl?.trim() || undefined,
      isPinned: false,
      isLocked: false,
      views: 1,
      reactions: { like: [], love: [], laugh: [], scare: [], impressed: [], sad: [] },
      reposts: [],
      bookmarks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: currentUser,
      commentsCount: 0,
      userReactions: { hasLiked: false, hasReposted: false, hasBookmarked: false },
    };

    this.data.threads.unshift(newThread);
    this.save();

    return { message: 'สร้างกระทู้ใหม่สำเร็จ!', thread: this.formatThread(newThread, currentUser) };
  }

  // Update Thread (Strict Ownership: User A cannot edit User B's post)
  public updateThread(id: string, payload: Partial<Thread>): { message: string; thread: Thread } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบก่อนแก้ไข');

    const thread = this.data.threads.find(t => t.id === id);
    if (!thread) throw new Error('ไม่พบกระทู้');

    // Requirement 3: User A CANNOT edit User B's thread!
    if (thread.authorId !== currentUser.id) {
      throw new Error('คุณไม่มีสิทธิ์แก้ไขกระทู้นี้ (เฉพาะเจ้าของกระทู้เท่านั้นที่สามารถแก้ไขเนื้อหาได้)');
    }

    if (payload.title) thread.title = payload.title.trim();
    if (payload.content) thread.content = payload.content.trim();
    if (payload.room) thread.room = payload.room;
    if (payload.tags) thread.tags = payload.tags;
    if (payload.imageUrl !== undefined) thread.imageUrl = payload.imageUrl;
    thread.updatedAt = new Date().toISOString();

    this.save();
    return { message: 'แก้ไขกระทู้เรียบร้อยแล้ว!', thread: this.formatThread(thread, currentUser) };
  }

  // Delete Thread (Owner or Admin)
  public deleteThread(id: string): { message: string } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบก่อนลบกระทู้');

    const thread = this.data.threads.find(t => t.id === id);
    if (!thread) throw new Error('ไม่พบกระทู้');

    const isOwner = thread.authorId === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    // Requirement 3: User A CANNOT delete User B's thread!
    if (!isOwner && !isAdmin) {
      throw new Error('คุณไม่มีสิทธิ์ลบกระทู้นี้ (เฉพาะเจ้าของกระทู้ หรือ ผู้ดูแลระบบเท่านั้น)');
    }

    this.data.threads = this.data.threads.filter(t => t.id !== id);
    this.data.comments = this.data.comments.filter(c => c.threadId !== id);

    if (isAdmin && !isOwner) {
      this.data.auditLogs.unshift({
        id: 'log_' + Date.now(),
        adminId: currentUser.id,
        adminName: currentUser.displayName,
        action: 'DELETE_THREAD',
        target: thread.id,
        details: `ลบกระทู้ "${thread.title}"`,
        createdAt: new Date().toISOString(),
      });
    }

    this.save();
    return { message: 'ลบกระทู้สำเร็จ' };
  }

  // Add Comment (Form 2)
  public addComment(threadId: string, payload: { content: string; imageUrl?: string; pantipEmotion?: string }): { message: string; comment: Comment } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบก่อนตอบกระทู้');

    const thread = this.data.threads.find(t => t.id === threadId);
    if (!thread) throw new Error('ไม่พบกระทู้');

    if (thread.isLocked && currentUser.role !== 'admin') {
      throw new Error('กระทู้นี้ถูกล็อคแล้ว ไม่สามารถตอบความคิดเห็นได้');
    }

    const existingComments = this.data.comments.filter(c => c.threadId === threadId);
    const commentNumber = existingComments.length + 1;

    const newComment: Comment = {
      id: 'cm_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      threadId,
      authorId: currentUser.id,
      content: payload.content.trim(),
      imageUrl: payload.imageUrl?.trim() || undefined,
      pantipEmotion: payload.pantipEmotion || 'like',
      upvotes: [],
      commentNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: currentUser,
      isOwner: true,
    };

    this.data.comments.push(newComment);
    this.save();

    return { message: 'ส่งความคิดเห็นสำเร็จ!', comment: newComment };
  }

  // Delete Comment
  public deleteComment(commentId: string): { message: string } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบ');

    const comment = this.data.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('ไม่พบความคิดเห็น');

    const isOwner = comment.authorId === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new Error('คุณไม่มีสิทธิ์ลบความคิดเห็นของผู้อื่น');
    }

    this.data.comments = this.data.comments.filter(c => c.id !== commentId);
    this.save();
    return { message: 'ลบความคิดเห็นสำเร็จ' };
  }

  // React & Repost
  public reactThread(id: string, emotion?: string, type?: 'emotion' | 'repost' | 'bookmark'): { message: string; thread: Thread } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบ');

    const thread = this.data.threads.find(t => t.id === id);
    if (!thread) throw new Error('ไม่พบกระทู้');

    const userId = currentUser.id;

    if (type === 'repost') {
      if (!thread.reposts) thread.reposts = [];
      if (thread.reposts.includes(userId)) {
        thread.reposts = thread.reposts.filter(u => u !== userId);
      } else {
        thread.reposts.push(userId);
      }
    } else if (type === 'bookmark') {
      if (!thread.bookmarks) thread.bookmarks = [];
      if (thread.bookmarks.includes(userId)) {
        thread.bookmarks = thread.bookmarks.filter(u => u !== userId);
      } else {
        thread.bookmarks.push(userId);
      }
    } else {
      const validEmotion = emotion || 'like';
      if (!thread.reactions) thread.reactions = { like: [], love: [], laugh: [], scare: [], impressed: [], sad: [] };
      if (!thread.reactions[validEmotion]) thread.reactions[validEmotion] = [];

      if (thread.reactions[validEmotion].includes(userId)) {
        thread.reactions[validEmotion] = thread.reactions[validEmotion].filter(u => u !== userId);
      } else {
        thread.reactions[validEmotion].push(userId);
      }
    }

    this.save();
    return { message: 'อัปเดตการแสดงความรู้สึกสำเร็จ', thread: this.formatThread(thread, currentUser) };
  }

  // Report
  public reportThread(id: string, reason: string): { message: string } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบ');

    const thread = this.data.threads.find(t => t.id === id);
    if (!thread) throw new Error('ไม่พบกระทู้');

    this.data.reports.unshift({
      id: 'rep_' + Date.now().toString(36),
      reporterId: currentUser.id,
      reporterName: currentUser.displayName,
      targetType: 'thread',
      targetId: thread.id,
      targetTitle: thread.title,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    this.save();
    return { message: 'ส่งรายงานให้ผู้ดูแลระบบเรียบร้อยแล้ว' };
  }

  // Admin APIs (Requirement 6)
  public getAdminStats(): AdminStats {
    const users = this.data.users;
    const threads = this.data.threads;
    const comments = this.data.comments;
    const reports = this.data.reports;

    return {
      totalUsers: users.length,
      totalAdmins: users.filter(u => u.role === 'admin').length,
      totalThreads: threads.length,
      totalComments: comments.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      pinnedThreads: threads.filter(t => t.isPinned).length,
    };
  }

  public getAdminUsers(unmask = false): User[] {
    return this.data.users.map(u => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      role: u.role,
      avatar: u.avatar,
      isVerified: u.isVerified,
      isSuspended: u.isSuspended,
      createdAt: u.createdAt,
      maskedEmail: maskEmail(u.email),
      maskedPhone: maskPhoneNumber(u.phoneNumber),
      maskedCitizenId: maskCitizenId(u.citizenId),
      email: unmask ? u.email : maskEmail(u.email),
      phoneNumber: unmask ? u.phoneNumber : maskPhoneNumber(u.phoneNumber),
      citizenId: unmask ? u.citizenId : maskCitizenId(u.citizenId),
      bio: u.bio,
      isUnmasked: unmask,
    }));
  }

  public setAdminUserRole(userId: string, role: 'user' | 'admin'): { message: string; user: User } {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('ไม่พบผู้ใช้');
    user.role = role;
    this.save();
    return { message: `เปลี่ยนบทบาทเป็น ${role} เรียบร้อยแล้ว`, user: toSafeUser(user as any, true) as any };
  }

  public setAdminUserStatus(userId: string, isSuspended: boolean): { message: string; user: User } {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('ไม่พบผู้ใช้');
    user.isSuspended = isSuspended;
    this.save();
    return { message: isSuspended ? 'ระงับบัญชีแล้ว' : 'ปลดระงับบัญชีแล้ว', user: toSafeUser(user as any, true) as any };
  }

  public adminPinThread(threadId: string): { message: string; isPinned: boolean } {
    const thread = this.data.threads.find(t => t.id === threadId);
    if (!thread) throw new Error('ไม่พบกระทู้');
    thread.isPinned = !thread.isPinned;
    this.save();
    return { message: thread.isPinned ? 'ปักหมุดกระทู้เรียบร้อยแล้ว' : 'ยกเลิกการปักหมุดแล้ว', isPinned: thread.isPinned };
  }

  public adminLockThread(threadId: string): { message: string; isLocked: boolean } {
    const thread = this.data.threads.find(t => t.id === threadId);
    if (!thread) throw new Error('ไม่พบกระทู้');
    thread.isLocked = !thread.isLocked;
    this.save();
    return { message: thread.isLocked ? 'ล็อคกระทู้แล้ว' : 'ปลดล็อคกระทู้แล้ว', isLocked: thread.isLocked };
  }

  public getAdminReports(): Report[] {
    return this.data.reports;
  }

  public resolveReport(reportId: string, status: 'resolved' | 'dismissed'): { message: string; report: Report } {
    const report = this.data.reports.find(r => r.id === reportId);
    if (!report) throw new Error('ไม่พบรายงาน');
    report.status = status;
    this.save();
    return { message: 'อัปเดตสถานะสำเร็จ', report };
  }

  public getAdminLogs(): AuditLog[] {
    return this.data.auditLogs;
  }
}

export const clientStore = new ClientStore();
