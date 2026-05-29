import { Schema, model, Document, Types } from 'mongoose';

export interface IPatientProfile extends Document {
  userId: Types.ObjectId;
  name: string;
  birthday: Date;
  weight: number;
  height: number;
  photo: string;
  phone: string;
  address: string;
  medicalHistory: {
    allergies: string[];
    conditions: string[];
    medications: string[];
  };
}

const PatientProfileSchema = new Schema<IPatientProfile>({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name:     { type: String, required: true, trim: true },
  birthday: { type: Date, required: true },
  weight:   { type: Number, required: true },
  height:   { type: Number, required: true },
  photo:    { type: String, default: '' },
  phone:    { type: String, default: '' },
  address:  { type: String, default: '' },
  medicalHistory: {
    allergies:   { type: [String], default: [] },
    conditions:  { type: [String], default: [] },
    medications: { type: [String], default: [] },
  },
}, { timestamps: true });

export default model<IPatientProfile>('PatientProfile', PatientProfileSchema);