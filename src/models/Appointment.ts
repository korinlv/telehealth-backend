import { Schema, model, Document, Types } from 'mongoose';

export interface IPrescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  scheduledAt: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  videoRoomUrl: string;
  reasonForVisit: string;
  notes: string;
  prescriptions: IPrescription[];
  followUp: string;
}

const AppointmentSchema = new Schema<IAppointment>({
  patientId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt:   { type: Date, required: true },
  status:        { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  videoRoomUrl:  { type: String, default: '' },
  reasonForVisit:{ type: String, default: '' },
  notes:         { type: String, default: '' },
  prescriptions: [{
    medication: { type: String, required: true },
    dosage:     { type: String, required: true },
    frequency:  { type: String, required: true },
    duration:   { type: String, required: true },
  }],
  followUp: { type: String, default: '' },
}, { timestamps: true });

export default model<IAppointment>('Appointment', AppointmentSchema);