export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
  email: string;
  phoneNumber: string;
  citizenId: string;
  avatar: string;
  bio: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
}

export type SafeUser = Omit<User, 'passwordHash'> & {
  maskedEmail: string;
  maskedPhone: string;
  maskedCitizenId: string;
};

export type ThreadType = 'discussion' | 'question' | 'review' | 'microblog';

export interface Thread {
  id: string;
  authorId: string;
  title: string;
  content: string;
  room: string;
  threadType: ThreadType;
  tags: string[];
  imageUrl?: string;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  reactions: Record<string, string[]>; // { like: [userId1], laugh: [userId2], ... }
  reposts: string[]; // userIds
  bookmarks: string[]; // userIds
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  pantipEmotion?: string;
  upvotes: string[];
  commentNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'thread' | 'comment' | 'user';
  targetId: string;
  targetTitle?: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  details: string;
  createdAt: string;
}

export interface RoomCategory {
  id: string;
  name: string;
  englishName: string;
  icon: string;
  description: string;
  color: string;
}
