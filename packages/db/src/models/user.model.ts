import { Schema, model } from 'mongoose';

export type UserRole = 'admin' | 'buyer' | 'seller';

export interface IUser extends Document {
  email: string;
  name: string;
  role: UserRole;
  password: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'buyer', 'seller'],
    default: 'buyer',
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
},
{
    discriminatorKey: 'role',
    timestamps: true,
});

export const User = model<IUser>('User', userSchema);

