import { Router } from 'express';
import {
  createAppointment, 
  getPatientAppointments, 
  getDoctorAppointments,
  getAppointmentById, 
  updateAppointmentStatus, 
  rescheduleAppointment,
  getNotifications, 
  markNotificationRead,
  cancelMyAppointment // <-- Make sure this was imported!
} from '../controllers/appointmentController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.post('/',                              requireAuth, requireRole('patient'), createAppointment);
router.get('/patient',                        requireAuth, requireRole('patient'), getPatientAppointments);
router.get('/doctor',                         requireAuth, requireRole('doctor'),  getDoctorAppointments);
router.get('/notifications',                  requireAuth, getNotifications);
router.patch('/notifications/:id/read',       requireAuth, markNotificationRead);

// Place specific actions before the generic GET /:id route
router.patch('/:id/cancel',                   requireAuth, requireRole('patient'), cancelMyAppointment);
router.patch('/:id/status',                   requireAuth, requireRole('doctor'),  updateAppointmentStatus);
router.patch('/:id/reschedule',               requireAuth, requireRole('patient'), rescheduleAppointment);
router.get('/:id',                            requireAuth, getAppointmentById);

export default router;