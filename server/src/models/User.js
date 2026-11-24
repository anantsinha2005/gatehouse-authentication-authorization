import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'] },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.methods.toSafeJSON = function () {
  return { id: this._id.toString(), name: this.name, email: this.email, role: this.role, createdAt: this.createdAt };
};
userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 10);
userSchema.statics.comparePassword = (password, hash) => bcrypt.compare(password, hash);
export default mongoose.model('User', userSchema);
