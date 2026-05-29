import { Request, Response } from 'express';
import DoctorProfile from '../models/DoctorProfile';
import Availability from '../models/Availability';
import { AuthRequest } from '../middleware/auth';

// GET /api/doctors — list all, filter by specialization
export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialization, search } = req.query;

    const filter: any = {};
    if (specialization) filter.specialization = specialization;
    if (search) filter.name = { $regex: search, $options: 'i' }; // case-insensitive search

    const doctors = await DoctorProfile.find(filter)
      .populate('userId', 'email')
      .sort({ rating: -1 });

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// GET /api/doctors/:id — single doctor + availability
export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id)
      .populate('userId', 'email');

    if (!doctor) {
      res.status(404).json({ message: 'Doctor not found' });
      return;
    }

    const availability = await Availability.findOne({ doctorId: doctor.userId });

    res.json({ doctor, availability });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// GET /api/doctors/profile/me — doctor views own profile
export const getMyDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.user?.id });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PATCH /api/doctors/profile/me — doctor updates own profile
export const updateMyDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowed = ['name', 'bio', 'specialization', 'experience', 'photo'];
    const updates: any = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: req.user?.id },
      updates,
      { new: true } // return updated document — like fresh() in Laravel
    );

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};