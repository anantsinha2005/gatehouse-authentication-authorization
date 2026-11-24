import { Router } from 'express';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const safe = (user) => user.toSafeJSON();


router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) return res.status(400).json({ message: 'Name must be between 2 and 60 characters.' });
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, role: 'user' });
    return res.status(201).json({ user: safe(user), token: signToken(user) });
  } catch (err) { if (err.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' }); next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    if (!user || !(await User.comparePassword(password, user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    return res.json({ user: safe(user), token: signToken(user) });
  } catch (err) { next(err); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try { const user = await User.findById(req.auth.id); return res.json({ user: safe(user) }); } catch (err) { next(err); }
});
export default router;
