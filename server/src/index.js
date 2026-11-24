import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

const app = express();
const port = Number(process.env.PORT || 4000);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '16kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

async function seedDemoAccounts() {
  const accounts = [
    { name: 'Gatehouse Admin', email: 'admin@gatehouse.demo', password: 'AdminPass123!', role: 'admin' },
    { name: 'Demo Member', email: 'user@gatehouse.demo', password: 'UserPass123!', role: 'user' }
  ];
  for (const account of accounts) {
    const exists = await User.findOne({ email: account.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(account.password, 10);
      await User.create({ name: account.name, email: account.email, passwordHash, role: account.role });
    }
  }
  console.log('Demo accounts seeded (only if absent).');
}
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required. Copy .env.example to .env and configure your MongoDB URI.');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) throw new Error('JWT_SECRET must be at least 24 characters long.');
try {
  await mongoose.connect(process.env.MONGODB_URI);
  await seedDemoAccounts();
  app.listen(port, () => console.log(`Gatehouse API running at http://localhost:${port}`));
} catch (err) {
  console.error('Database connection failed. Check MONGODB_URI and confirm MongoDB is running/accessible.');
  console.error(err.message);
  process.exit(1);
}
