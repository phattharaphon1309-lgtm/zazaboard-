export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  email: string;
  phoneNumber: string;
  citizenId: string;
  maskedEmail: string;
  maskedPhone: string;
  maskedCitizenId: string;
  avatar: string;
  bio: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  isUnmasked?: boolean;
}

export type ThreadType = 'discussion' | 'question' | 'review' | 'microblog';

export interface RoomCategory {
  id: string;
  name: string;
  englishName: string;
  icon: string;
  description: string;
  color: string;
}

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
  reactions: Record<string, string[]>;
  reposts: string[];
  bookmarks: string[];
  createdAt: string;
  updatedAt: string;
  author: User;
  commentsCount: number;
  roomInfo?: RoomCategory;
  userReactions: {
    hasLiked: boolean;
    hasReposted: boolean;
    hasBookmarked: boolean;
  };
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
  author: User | null;
  isOwner?: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName?: string;
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

export interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalThreads: number;
  totalComments: number;
  pendingReports: number;
  pinnedThreads: number;
}
