import { Router } from 'express';
import { getMyPatientProfile, updateMyPatientProfile, getPatientById } from '../controllers/patientController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/profile/me',   requireAuth, requireRole('patient'), getMyPatientProfile);
router.patch('/profile/me', requireAuth, requireRole('patient'), updateMyPatientProfile);
router.get('/:id',          requireAuth, requireRole('doctor'),  getPatientById);

export default router;