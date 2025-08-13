// lib/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  provider: {
    type: String,
    required: true,
    default: 'google',
  },
}, {
  timestamps: true,
});



export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);