import { Router } from 'express';
import {
  createAppointment, getPatientAppointments, getDoctorAppointments,
  getAppointmentById, updateAppointmentStatus, rescheduleAppointment,
  getNotifications, markNotificationRead
} from '../controllers/appointmentController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.post('/',                              requireAuth, requireRole('patient'), createAppointment);
router.get('/patient',                        requireAuth, requireRole('patient'), getPatientAppointments);
router.get('/doctor',                         requireAuth, requireRole('doctor'),  getDoctorAppointments);
router.get('/notifications',                  requireAuth, getNotifications);
router.patch('/notifications/:id/read',       requireAuth, markNotificationRead);
router.get('/:id',                            requireAuth, getAppointmentById);
router.patch('/:id/status',                   requireAuth, requireRole('doctor'),  updateAppointmentStatus);
router.patch('/:id/reschedule',               requireAuth, requireRole('patient'), rescheduleAppointment);

export default router;