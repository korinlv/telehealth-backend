import { Schema, model, Document, Types } from 'mongoose';

export interface IDoctorProfile extends Document {
  userId: Types.ObjectId;
  name: string;
  bio: string;
  specialization: string;
  photo: string;
  experience: number;
  licenseNumber: string;
  rating: number;
  totalRatings: number;
}

const SPECIALIZATIONS = [
  'General Practice', 'Cardiology', 'Dermatology',
  'Pediatrics', 'Orthopedics', 'Neurology',
  'Psychiatry', 'OB-GYN', 'ENT', 'Ophthalmology'
];

const DoctorProfileSchema = new Schema<IDoctorProfile>({
  userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name:          { type: String, required: true, trim: true },
  bio:           { type: String, default: '' },
  specialization:{ type: String, enum: SPECIALIZATIONS, required: true },
  photo:         { type: String, default: '' },
  experience:    { type: Number, default: 0 },
  licenseNumber: { type: String, required: true },
  rating:        { type: Number, default: 0, min: 0, max: 5 },
  totalRatings:  { type: Number, default: 0 },
}, { timestamps: true });

export default model<IDoctorProfile>('DoctorProfile', DoctorProfileSchema);