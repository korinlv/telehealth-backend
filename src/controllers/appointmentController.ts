import { Response } from 'express';
import Appointment from '../models/Appointment';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

// Helper — creates a notification for a user
const notify = async (userId: string, message: string, type: any, appointmentId: any) => {
  await Notification.create({ userId, message, type, relatedAppointmentId: appointmentId });
};

// POST /api/appointments — patient books appointment
export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId, scheduledAt, reasonForVisit } = req.body;

    // Check if slot is already taken
    const conflict = await Appointment.findOne({
      doctorId,
      scheduledAt: new Date(scheduledAt),
      status: { $in: ['pending', 'confirmed'] },
    });

    if (conflict) {
      res.status(409).json({ message: 'This time slot is already booked' });
      return;
    }

    const appointment = await Appointment.create({
      patientId: req.user?.id,
      doctorId,
      scheduledAt: new Date(scheduledAt),
      reasonForVisit: reasonForVisit || '',
      status: 'pending',
    });

    // Notify both patient and doctor
    await notify(req.user?.id as string, `Your appointment on ${scheduledAt} has been booked.`, 'booking', appointment._id);
    await notify(doctorId, `New appointment request from a patient on ${scheduledAt}.`, 'booking', appointment._id);

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// GET /api/appointments/patient — patient views their appointments
export const getPatientAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointments = await Appointment.find({ patientId: req.user?.id })
      .populate('doctorId', 'name specialization photo')
      .sort({ scheduledAt: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// GET /api/appointments/doctor — doctor views their appointments
export const getDoctorAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user?.id })
      .populate('patientId', 'name photo')
      .sort({ scheduledAt: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// GET /api/appointments/:id — single appointment detail
export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name photo phone')
      .populate('doctorId',  'name specialization photo');

    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PATCH /api/appointments/:id/status — confirm or cancel (doctor)
export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const allowed = ['confirmed', 'cancelled', 'completed'];

    if (!allowed.includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    // Notify patient of status change
    await notify(
      appointment.patientId.toString(),
      `Your appointment status has been updated to: ${status}.`,
      status === 'cancelled' ? 'cancellation' : 'update',
      appointment._id
    );

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PATCH /api/appointments/:id/reschedule — patient reschedules
export const rescheduleAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { scheduledAt } = req.body;

    const conflict = await Appointment.findOne({
      _id: { $ne: req.params.id }, // exclude current appointment
      doctorId: req.body.doctorId,
      scheduledAt: new Date(scheduledAt),
      status: { $in: ['pending', 'confirmed'] },
    });

    if (conflict) {
      res.status(409).json({ message: 'This time slot is already booked' });
      return;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { scheduledAt: new Date(scheduledAt), status: 'pending' },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    await notify(
      appointment.doctorId.toString(),
      `An appointment has been rescheduled to ${scheduledAt}.`,
      'update',
      appointment._id
    );

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// GET /api/appointments/notifications — get user's notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PATCH /api/appointments/notifications/:id/read — mark notification as read
export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};