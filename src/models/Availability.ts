import { Schema, model, Document, Types } from 'mongoose';

export interface IAvailability extends Document {
  doctorId: Types.ObjectId;
  recurringSlots: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  blockedDates: Date[];
}

const AvailabilitySchema = new Schema<IAvailability>({
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  recurringSlots: [{
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday, 6 = Saturday
    startTime: { type: String, required: true }, // "09:00"
    endTime:   { type: String, required: true }, // "17:00"
  }],
  blockedDates: [{ type: Date }],
}, { timestamps: true });

export default model<IAvailability>('Availability', AvailabilitySchema);