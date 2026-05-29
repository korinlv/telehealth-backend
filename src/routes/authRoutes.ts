import { Router } from 'express';
import { registerPatient, registerDoctor, login } from '../controllers/authController';

const router = Router();

router.post('/register/patient', registerPatient);
router.post('/register/doctor',  registerDoctor);
router.post('/login',            login);

export default router;