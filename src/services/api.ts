import { User, Thread, Comment, RoomCategory, Report, AuditLog, AdminStats } from '../types';
import { clientStore } from './clientStore';

const TOKEN_KEY = 'punx_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Helper to determine if we should fallback to clientStore
let isBackendUnavailable = false;

// If we are on vercel.app or static deployment without an Express backend:
if (typeof window !== 'undefined') {
  const host = window.location.hostname.toLowerCase();
  if (host.includes('vercel.app') || host.includes('vercel') || host.includes('github.io')) {
    isBackendUnavailable = true;
  }
}

async function tryServerRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  if (isBackendUnavailable) {
    return null;
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    // Check if the response is a 404 (e.g. Vercel static deployment with no backend server)
    const contentType = res.headers.get('content-type') || '';
    if (res.status === 404 || contentType.includes('text/html')) {
      console.warn(`[API] Endpoint ${endpoint} returned 404/HTML. Switching to resilient ClientStore mode.`);
      isBackendUnavailable = true;
      return null;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // If it's a 404, fallback to client
      if (res.status === 404) {
        isBackendUnavailable = true;
        return null;
      }
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }

    return data as T;
  } catch (err: any) {
    // If network failed (e.g. offline, static site, no express backend)
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      console.warn(`[API] Network error reaching backend. Falling back to ClientStore.`);
      isBackendUnavailable = true;
      return null;
    }
    // Real validation error from server (e.g. "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว")
    throw err;
  }
}

export const api = {
  // Auth
  async register(payload: {
    username: string;
    displayName: string;
    password: string;
    email: string;
    phoneNumber?: string;
    citizenId?: string;
    bio?: string;
  }): Promise<{ message: string; token: string; user: User }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (serverRes) {
        setAuthToken(serverRes.token);
        return serverRes;
      }
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    // ClientStore Fallback (Runs bcrypt 10 rounds, masking, local persistence)
    const clientRes = await clientStore.register(payload);
    setAuthToken(clientRes.token);
    return clientRes;
  },

  async login(payload: { loginId: string; password: string }): Promise<{ message: string; token: string; user: User }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (serverRes) {
        setAuthToken(serverRes.token);
        return serverRes;
      }
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    const clientRes = await clientStore.login(payload.loginId, payload.password);
    setAuthToken(clientRes.token);
    return clientRes;
  },

  async quickSwitch(target: string): Promise<{ message: string; token: string; user: User }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; token: string; user: User }>('/api/auth/quick-switch', {
        method: 'POST',
        body: JSON.stringify({ target }),
      });
      if (serverRes) {
        setAuthToken(serverRes.token);
        return serverRes;
      }
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    const clientRes = await clientStore.quickSwitch(target);
    setAuthToken(clientRes.token);
    return clientRes;
  },

  async loginWithFirebase(payload: {
    email: string;
    displayName?: string | null;
    photoUrl?: string | null;
    uid: string;
  }): Promise<{ message: string; token: string; user: User }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; token: string; user: User }>('/api/auth/firebase-login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (serverRes) {
        setAuthToken(serverRes.token);
        return serverRes;
      }
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    const clientRes = await clientStore.loginWithFirebase(payload);
    setAuthToken(clientRes.token);
    return clientRes;
  },

  async getMe(): Promise<{ user: User }> {
    try {
      const serverRes = await tryServerRequest<{ user: User }>('/api/auth/me');
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    const user = clientStore.getCurrentUser();
    if (!user) throw new Error('Unauthenticated');
    return { user };
  },

  async logout(): Promise<void> {
    try {
      await tryServerRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      clientStore.logout();
      removeAuthToken();
    }
  },

  async updateProfile(payload: {
    displayName?: string;
    bio?: string;
    phoneNumber?: string;
    avatar?: string;
  }): Promise<{ message: string; user: User }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; user: User }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.updateProfile(payload);
  },

  async getDemoAccounts(): Promise<Array<{
    username: string;
    role: 'user' | 'admin';
    displayName: string;
    description: string;
    passwordPlain?: string;
  }>> {
    try {
      const serverRes = await tryServerRequest<any>('/api/auth/demo-accounts');
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.getDemoAccounts();
  },

  // Rooms & Threads
  async getRooms(): Promise<RoomCategory[]> {
    try {
      const serverRes = await tryServerRequest<RoomCategory[]>('/api/threads/rooms');
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.getRooms();
  },

  async getThreads(params: {
    room?: string;
    tag?: string;
    sort?: string;
    search?: string;
    authorId?: string;
  } = {}): Promise<Thread[]> {
    try {
      const query = new URLSearchParams();
      if (params.room) query.append('room', params.room);
      if (params.tag) query.append('tag', params.tag);
      if (params.sort) query.append('sort', params.sort);
      if (params.search) query.append('search', params.search);
      if (params.authorId) query.append('authorId', params.authorId);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const serverRes = await tryServerRequest<Thread[]>(`/api/threads${qs}`);
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.getThreads(params);
  },

  async getThread(id: string): Promise<{ thread: Thread; comments: Comment[] }> {
    try {
      const serverRes = await tryServerRequest<{ thread: Thread; comments: Comment[] }>(`/api/threads/${id}`);
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.getThread(id);
  },

  async createThread(payload: {
    title: string;
    content: string;
    room: string;
    threadType?: string;
    tags?: string[];
    imageUrl?: string;
  }): Promise<{ message: string; thread: Thread }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; thread: Thread }>('/api/threads', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.createThread(payload);
  },

  async updateThread(id: string, payload: {
    title?: string;
    content?: string;
    room?: string;
    threadType?: string;
    tags?: string[];
    imageUrl?: string;
  }): Promise<{ message: string; thread: Thread }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; thread: Thread }>(`/api/threads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.updateThread(id, payload as any);
  },

  async deleteThread(id: string): Promise<{ message: string }> {
    try {
      const serverRes = await tryServerRequest<{ message: string }>(`/api/threads/${id}`, {
        method: 'DELETE',
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.deleteThread(id);
  },

  async addComment(threadId: string, payload: {
    content: string;
    imageUrl?: string;
    pantipEmotion?: string;
  }): Promise<{ message: string; comment: Comment }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; comment: Comment }>(`/api/threads/${threadId}/comments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.addComment(threadId, payload);
  },

  async deleteComment(commentId: string): Promise<{ message: string }> {
    try {
      const serverRes = await tryServerRequest<{ message: string }>(`/api/threads/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.deleteComment(commentId);
  },

  async reactThread(id: string, payload: {
    emotion?: string;
    type?: 'emotion' | 'repost' | 'bookmark';
  }): Promise<{ message: string; thread: Thread }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; thread: Thread }>(`/api/threads/${id}/react`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.reactThread(id, payload.emotion, payload.type);
  },

  async reportThread(id: string, reason: string): Promise<{ message: string }> {
    try {
      const serverRes = await tryServerRequest<{ message: string }>(`/api/threads/${id}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.reportThread(id, reason);
  },

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    try {
      const serverRes = await tryServerRequest<AdminStats>('/api/admin/stats');
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.getAdminStats();
  },

  async getAdminUsers(unmask = false): Promise<User[]> {
    try {
      const serverRes = await tryServerRequest<User[]>(`/api/admin/users?unmask=${unmask}`);
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.getAdminUsers(unmask);
  },

  async setAdminUserRole(userId: string, role: 'user' | 'admin'): Promise<{ message: string; user: User }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; user: User }>(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.setAdminUserRole(userId, role);
  },

  async setAdminUserStatus(userId: string, isSuspended: boolean): Promise<{ message: string; user: User }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; user: User }>(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isSuspended }),
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.setAdminUserStatus(userId, isSuspended);
  },

  async adminPinThread(threadId: string): Promise<{ message: string; isPinned: boolean }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; isPinned: boolean }>(`/api/admin/threads/${threadId}/pin`, {
        method: 'POST',
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.adminPinThread(threadId);
  },

  async adminLockThread(threadId: string): Promise<{ message: string; isLocked: boolean }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; isLocked: boolean }>(`/api/admin/threads/${threadId}/lock`, {
        method: 'POST',
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.adminLockThread(threadId);
  },

  async getAdminReports(): Promise<Report[]> {
    try {
      const serverRes = await tryServerRequest<Report[]>('/api/admin/reports');
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.getAdminReports();
  },

  async resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<{ message: string; report: Report }> {
    try {
      const serverRes = await tryServerRequest<{ message: string; report: Report }>(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.resolveReport(reportId, status);
  },

  async getAdminLogs(): Promise<AuditLog[]> {
    try {
      const serverRes = await tryServerRequest<AuditLog[]>('/api/admin/audit-logs');
      if (serverRes) return serverRes;
    } catch (err: any) {
      if (!isBackendUnavailable) throw err;
    }

    return clientStore.getAdminLogs();
  },
};
