import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth, requireRole('admin'));
router.get('/', async (req, res, next) => {
  try { const users = await User.find().sort({ createdAt: -1 }); res.json({ users: users.map(u => u.toSafeJSON()) }); } catch (err) { next(err); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.auth.id) return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User removed.' });
  } catch (err) { if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid user ID.' }); next(err); }
});
export default router;
