import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';
import DoctorProfile from '../models/DoctorProfile';
import generateToken from '../utils/generateToken';
import { z } from 'zod';

// ── Validation schemas ──────────────────────────────────────
const registerPatientSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
  name:     z.string().min(1),
  birthday: z.string(),
  weight:   z.number(),
  height:   z.number(),
  phone:    z.string().optional(),
  address:  z.string().optional(),
  medicalHistory: z.object({
    allergies:   z.array(z.string()).optional(),
    conditions:  z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
  }).optional(),
});

const registerDoctorSchema = z.object({
  email:          z.string().email(),
  password:       z.string().min(8),
  name:           z.string().min(1),
  specialization: z.string().min(1),
  experience:     z.number(),
  licenseNumber:  z.string().min(1),
  bio:            z.string().optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ── Register Patient ────────────────────────────────────────
export const registerPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerPatientSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ errors: parsed.error.format() });
      return;
    }

    const { email, password, name, birthday, weight, height, phone, address, medicalHistory } = parsed.data;

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role: 'patient' });

    await PatientProfile.create({
      userId: user._id,
      name, birthday, weight, height,
      phone:   phone || '',
      address: address || '',
      medicalHistory: medicalHistory || { allergies: [], conditions: [], medications: [] },
    });

    const token = generateToken({ id: user._id.toString(), role: 'patient', email });
    res.status(201).json({ token, role: 'patient', name });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// ── Register Doctor ─────────────────────────────────────────
export const registerDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerDoctorSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ errors: parsed.error.format() });
      return;
    }

    const { email, password, name, specialization, experience, licenseNumber, bio } = parsed.data;

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role: 'doctor' });

    await DoctorProfile.create({
      userId: user._id,
      name, specialization, experience, licenseNumber,
      bio: bio || '',
    });

    const token = generateToken({ id: user._id.toString(), role: 'doctor', email });
    res.status(201).json({ token, role: 'doctor', name });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// ── Login ───────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ errors: parsed.error.format() });
      return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Get name from the correct profile
    let name = '';
    if (user.role === 'patient') {
      const profile = await PatientProfile.findOne({ userId: user._id });
      name = profile?.name || '';
    } else {
      const profile = await DoctorProfile.findOne({ userId: user._id });
      name = profile?.name || '';
    }

    const token = generateToken({ id: user._id.toString(), role: user.role, email });
    res.json({ token, role: user.role, name });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};