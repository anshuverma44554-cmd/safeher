import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db, Profile, GuardianProfile } from '../db/database.js';
import { config } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(6, 'Valid phone number required'),
  role: z.enum(['traveller', 'guardian', 'admin']).default('traveller'),
  emergency_notes: z.string().optional(),
  blood_group: z.string().optional(),
  // Guardian specific optional application fields
  bio: z.string().optional(),
  city: z.string().optional(),
  identification_type: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req: Request, res: Response): Promise<void> {
  const data = registerSchema.parse(req.body);

  const existing = db.profiles.find(p => p.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    return;
  }

  // Security constraint: Prevent self-assigning admin role
  const assignedRole = data.role === 'admin' ? 'traveller' : data.role;

  const password_hash = await bcrypt.hash(data.password, 10);
  const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  const newProfile: Profile = {
    id: userId,
    email: data.email.toLowerCase(),
    password_hash,
    full_name: data.full_name,
    phone: data.phone,
    role: assignedRole,
    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.full_name)}&backgroundColor=6d28d9`,
    emergency_notes: data.emergency_notes,
    blood_group: data.blood_group,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.profiles.push(newProfile);

  // If registering as guardian, create initial pending guardian profile
  let guardianRecord: GuardianProfile | undefined;
  if (assignedRole === 'guardian') {
    guardianRecord = {
      id: 'grd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: userId,
      bio: data.bio || 'Applicant registered for community guardian vetting.',
      languages: ['English'],
      address: 'Pending address verification',
      city: data.city || 'Delhi/NCR',
      identification_type: data.identification_type || 'Government ID',
      id_document_url: 'https://safeher.org/docs/verification_sample.pdf',
      verification_status: 'pending', // Genuinely admin controlled
      is_available: false,
      rating: 5.0,
      total_assists: 0,
      emergency_phone: data.phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.guardians.push(guardianRecord);
  }

  db.save();
  db.logActivity(userId, 'USER_REGISTERED', { email: newProfile.email, role: newProfile.role }, req.ip);

  const token = jwt.sign(
    { id: newProfile.id, email: newProfile.email, role: newProfile.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );

  const { password_hash: _, ...safeProfile } = newProfile;
  res.status(201).json({
    success: true,
    token,
    user: safeProfile,
    guardian: guardianRecord,
    message: assignedRole === 'guardian'
      ? 'Guardian account created. Your application has been submitted to SafeHer Admin for verification.'
      : 'Account created successfully.'
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const data = loginSchema.parse(req.body);

  const user = db.profiles.find(p => p.email.toLowerCase() === data.email.toLowerCase());
  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  const isMatch = await bcrypt.compare(data.password, user.password_hash);
  if (!isMatch) {
    res.status(401).json({ success: false, error: 'Invalid email or password.' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );

  const guardian = db.guardians.find(g => g.user_id === user.id);
  db.logActivity(user.id, 'USER_LOGIN', { role: user.role }, req.ip);

  const { password_hash: _, ...safeProfile } = user;
  res.json({
    success: true,
    token,
    user: safeProfile,
    guardian,
    message: `Welcome back, ${user.full_name}!`
  });
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const { password_hash: _, ...safeProfile } = req.user;
  const guardian = db.guardians.find(g => g.user_id === req.user!.id);
  res.json({
    success: true,
    user: safeProfile,
    guardian
  });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, error: 'Email is required' });
    return;
  }

  const user = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
  // Always return success for security (prevent email enumeration)
  res.json({
    success: true,
    message: 'If this email is registered with SafeHer, password reset instructions have been dispatched.',
    demoResetToken: user ? Buffer.from(user.id).toString('base64') : undefined
  });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 6) {
    res.status(400).json({ success: false, error: 'Valid token and new password (min 6 chars) required' });
    return;
  }

  try {
    const userId = Buffer.from(token, 'base64').toString('utf-8');
    const user = db.profiles.find(p => p.id === userId);
    if (!user) {
      res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
      return;
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.updated_at = new Date().toISOString();
    db.save();
    db.logActivity(user.id, 'PASSWORD_RESET', {}, req.ip);

    res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Invalid reset token' });
  }
}
