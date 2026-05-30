import { Router } from 'express';
import { getMyRecords, getPatientRecords, addConsultationNotes, searchMyPatients } from '../controllers/recordsController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/search', requireAuth, requireRole('doctor'), searchMyPatients);
router.get('/my',                        requireAuth, requireRole('patient'), getMyRecords);
router.get('/patient/:patientId',        requireAuth, requireRole('doctor'),  getPatientRecords);
router.patch('/:appointmentId/notes',    requireAuth, requireRole('doctor'),  addConsultationNotes);

export default router;
