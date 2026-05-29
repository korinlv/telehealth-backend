import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'patient' | 'doctor';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['patient', 'doctor'], required: true },
}, { timestamps: true });

export default model<IUser>('User', UserSchema);