import { Response } from 'express';
import Appointment from '../models/Appointment';
import PatientProfile from '../models/PatientProfile';
import { AuthRequest } from '../middleware/auth';
import DoctorProfile from '../models/DoctorProfile';

// GET /api/records/my — patient views own medical records
export const getMyRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user?.id,
      status: 'completed',
    })
      .sort({ scheduledAt: -1 })
      .lean();

    const doctorIds = [...new Set(appointments.map((a: any) => a.doctorId?.toString()).filter(Boolean))];
    const profiles = await DoctorProfile.find({ userId: { $in: doctorIds } }).lean();
    const profileMap: Record<string, any> = {};
    profiles.forEach(p => { profileMap[p.userId.toString()] = p; });

    const enriched = appointments.map((apt: any) => ({
      ...apt,
      doctorId: apt.doctorId ? {
        _id: apt.doctorId,
        name: profileMap[apt.doctorId.toString()]?.name || 'Doctor',
        specialization: profileMap[apt.doctorId.toString()]?.specialization || '',
      } : null,
    }));

    res.json(enriched);
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

    // This returns the history format your frontend PatientHistoryModal is expecting
    res.json(records); 
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

// GET /api/records/search?q=xyz — doctor searches their own patients
export const searchMyPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.json([]);
      return;
    }

    // Find all appointments for this doctor and populate patient info IF the name matches
    const appointments = await Appointment.find({ doctorId: req.user?.id })
      .populate({
        path: 'patientId',
        select: 'name email _id',
        match: { name: { $regex: q, $options: 'i' } } // Case-insensitive search
      });

    // Filter out empty matches and ensure uniqueness
    const uniquePatients = new Map();
    appointments.forEach((apt: any) => {
      if (apt.patientId) {
        uniquePatients.set(apt.patientId._id.toString(), apt.patientId);
      }
    });

    res.json(Array.from(uniquePatients.values()));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};