import { Router } from 'express';
import { recommendDoctors } from '../controllers/aiController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/recommend', requireAuth, recommendDoctors);

export default router;