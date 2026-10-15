import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import { User } from './types.js';

// Simple, reliable in-memory token registry
const tokens = new Map<string, string>(); // token -> userId

export function createToken(userId: string): string {
  const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  tokens.set(token, userId);
  return token;
}

export function revokeToken(token: string) {
  tokens.delete(token);
}

export interface AuthRequest extends Request {
  user?: User;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' });
  }

  const userId = tokens.get(token);
  if (!userId) {
    return res.status(401).json({ error: 'Session หมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่' });
  }

  const user = db.findUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'ไม่พบบัญชีผู้ใช้งานในระบบ' });
  }

  if (user.isSuspended) {
    return res.status(403).json({ error: 'บัญชีของคุณถูกระงับการใช้งานชั่วคราวโดยผู้ดูแลระบบ' });
  }

  req.user = user;
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    const userId = tokens.get(token);
    if (userId) {
      const user = db.findUserById(userId);
      if (user && !user.isSuspended) {
        req.user = user;
      }
    }
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ระดับผู้ดูแลระบบ (Admin Only)' });
    }
    next();
  });
}
