import { Response } from 'express';
import PatientProfile from '../models/PatientProfile';
import { AuthRequest } from '../middleware/auth';

// GET /api/patients/profile/me
export const getMyPatientProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user?.id });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PATCH /api/patients/profile/me
export const updateMyPatientProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowed = ['name', 'birthday', 'weight', 'height', 'photo', 'phone', 'address', 'medicalHistory'];
    const updates: any = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const profile = await PatientProfile.findOneAndUpdate(
      { userId: req.user?.id },
      updates,
      { new: true }
    );

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// GET /api/patients/:id — doctor views a patient's profile
export const getPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.params.id });
    if (!profile) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};