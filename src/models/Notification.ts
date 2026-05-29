import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  message: string;
  type: 'booking' | 'cancellation' | 'reminder' | 'update';
  isRead: boolean;
  relatedAppointmentId: Types.ObjectId;
}

const NotificationSchema = new Schema<INotification>({
  userId:               { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message:              { type: String, required: true },
  type:                 { type: String, enum: ['booking', 'cancellation', 'reminder', 'update'], required: true },
  isRead:               { type: Boolean, default: false },
  relatedAppointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
}, { timestamps: true });

export default model<INotification>('Notification', NotificationSchema);