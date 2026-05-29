import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import DoctorProfile from '../models/DoctorProfile';
import Availability from '../models/Availability';

const doctors = [
  { name: 'Dr. Maria Santos',  email: 'maria@mediconnect.com',  specialization: 'Cardiology',        experience: 12, licenseNumber: 'LIC-001', bio: 'Specialist in cardiovascular diseases with 12 years of clinical experience.' },
  { name: 'Dr. James Reyes',   email: 'james@mediconnect.com',  specialization: 'Dermatology',        experience: 8,  licenseNumber: 'LIC-002', bio: 'Expert in skin conditions and cosmetic dermatology.' },
  { name: 'Dr. Ana Cruz',      email: 'ana@mediconnect.com',    specialization: 'Pediatrics',         experience: 10, licenseNumber: 'LIC-003', bio: 'Dedicated pediatrician with a gentle approach to child healthcare.' },
  { name: 'Dr. Carlos Tan',    email: 'carlos@mediconnect.com', specialization: 'General Practice',   experience: 15, licenseNumber: 'LIC-004', bio: 'Your go-to doctor for general health concerns and preventive care.' },
  { name: 'Dr. Sofia Lim',     email: 'sofia@mediconnect.com',  specialization: 'Psychiatry',         experience: 9,  licenseNumber: 'LIC-005', bio: 'Mental health specialist focused on anxiety and depression.' },
];

// Mon–Fri, 9am–5pm availability for all doctors
const defaultSlots = [1,2,3,4,5].map(day => ({
  dayOfWeek: day,
  startTime: '09:00',
  endTime: '17:00',
}));

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected. Seeding doctors...');

  const password = await bcrypt.hash('password123', 10);

  for (const doc of doctors) {
    // Avoid duplicates on re-run
    const existing = await User.findOne({ email: doc.email });
    if (existing) {
      console.log(`Skipping ${doc.name} — already exists`);
      continue;
    }

    const user = await User.create({
      email: doc.email,
      passwordHash: password,
      role: 'doctor',
    });

    await DoctorProfile.create({
      userId: user._id,
      name: doc.name,
      bio: doc.bio,
      specialization: doc.specialization,
      experience: doc.experience,
      licenseNumber: doc.licenseNumber,
      rating: Number((Math.random() * (5 - 4.5) + 4.5).toFixed(1)),
    });

    await Availability.create({
      doctorId: user._id,
      recurringSlots: defaultSlots,
      blockedDates: [],
    });

    console.log(`✅ Created ${doc.name}`);
  }

  console.log('Seeding complete.');
  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});