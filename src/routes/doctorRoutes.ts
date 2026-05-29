import { Router } from 'express';
import { getDoctors, getDoctorById, getMyDoctorProfile, updateMyDoctorProfile } from '../controllers/doctorController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public — no auth needed
router.get('/',    getDoctors);
router.get('/:id', getDoctorById);

// Protected — doctor only
router.get('/profile/me',    requireAuth, requireRole('doctor'), getMyDoctorProfile);
router.patch('/profile/me',  requireAuth, requireRole('doctor'), updateMyDoctorProfile);

export default router;