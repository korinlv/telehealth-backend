import { Router } from 'express';
import { getDoctorAvailability, setAvailability, blockDates, unblockDate } from '../controllers/availabilityController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/:doctorId',     requireAuth, getDoctorAvailability);
router.put('/',              requireAuth, requireRole('doctor'), setAvailability);
router.patch('/block',       requireAuth, requireRole('doctor'), blockDates);
router.patch('/unblock',     requireAuth, requireRole('doctor'), unblockDate);

export default router;

