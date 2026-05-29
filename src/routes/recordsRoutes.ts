import { Router } from 'express';
import { getMyRecords, getPatientRecords, addConsultationNotes } from '../controllers/recordsController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/my',                        requireAuth, requireRole('patient'), getMyRecords);
router.get('/patient/:patientId',        requireAuth, requireRole('doctor'),  getPatientRecords);
router.patch('/:appointmentId/notes',    requireAuth, requireRole('doctor'),  addConsultationNotes);

export default router;