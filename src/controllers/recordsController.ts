import { Response } from 'express';
import Appointment from '../models/Appointment';
import PatientProfile from '../models/PatientProfile';
import { AuthRequest } from '../middleware/auth';

// GET /api/records/my — patient views own medical records
export const getMyRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await Appointment.find({
      patientId: req.user?.id,
      status: 'completed',
    })
      .populate('doctorId', 'name specialization photo')
      .sort({ scheduledAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// GET /api/records/patient/:patientId — doctor views a patient's records
export const getPatientRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await Appointment.find({
      patientId: req.params.patientId,
      status: 'completed',
    })
      .populate('doctorId', 'name specialization')
      .sort({ scheduledAt: -1 });

    const profile = await PatientProfile.findOne({ userId: req.params.patientId });

    res.json({ profile, records });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PATCH /api/records/:appointmentId/notes — doctor adds notes + prescriptions
export const addConsultationNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notes, prescriptions, followUp } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.appointmentId,
        doctorId: req.user?.id, // ensure only the assigned doctor can write notes
      },
      {
        notes,
        prescriptions,
        followUp,
        status: 'completed',
      },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found or unauthorized' });
      return;
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};