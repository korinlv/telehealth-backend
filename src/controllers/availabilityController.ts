import { Response } from 'express';
import Availability from '../models/Availability';
import Appointment from '../models/Appointment';
import { AuthRequest } from '../middleware/auth';

// GET /api/availability/:doctorId — get doctor's availability + booked slots
export const getDoctorAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const availability = await Availability.findOne({ doctorId: req.params.doctorId });
    if (!availability) {
      res.status(404).json({ message: 'Availability not found' });
      return;
    }

    // Get all confirmed/pending appointments for this doctor
    const appointments = await Appointment.find({
      doctorId: req.params.doctorId,
      status: { $in: ['pending', 'confirmed'] },
    }).select('scheduledAt status');

    res.json({ availability, bookedSlots: appointments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PUT /api/availability — doctor sets recurring schedule
export const setAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { recurringSlots } = req.body;

    const availability = await Availability.findOneAndUpdate(
      { doctorId: req.user?.id },
      { recurringSlots },
      { new: true, upsert: true } // upsert = create if doesn't exist, like updateOrCreate() in Laravel
    );

    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PATCH /api/availability/block — doctor blocks specific dates
export const blockDates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { dates } = req.body; // array of date strings

    const availability = await Availability.findOneAndUpdate(
      { doctorId: req.user?.id },
      { $push: { blockedDates: { $each: dates.map((d: string) => new Date(d)) } } },
      { new: true }
    );

    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// PATCH /api/availability/unblock — doctor removes a blocked date
export const unblockDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.body;

    const availability = await Availability.findOneAndUpdate(
      { doctorId: req.user?.id },
      { $pull: { blockedDates: new Date(date) } },
      { new: true }
    );

    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};