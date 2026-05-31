import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';

// Import routes (we'll create these files next)
import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import doctorRoutes from './routes/doctorRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import recordsRoutes from './routes/recordsRoutes';
import aiRoutes from './routes/aiRoutes';

import './models/User';
import './models/PatientProfile';
import './models/DoctorProfile';
import './models/Availability';
import './models/Appointment';
import './models/Notification';

// 1. Load environment variables FIRST — before anything else
dotenv.config();

// 2. Connect to MongoDB
connectDB();

// 3. Create the Express app
const app = express();

// 4. Register global middleware
app.use(cors({
  origin: ['https://telehealth-front-end.vercel.app'], // Must match exactly
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Include OPTIONS
  credentials: true
}));
app.use(express.json());

// 5. Health check route — useful to verify server is running
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Telehealth API is running' });
});

// 6. Register all route groups
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/ai', aiRoutes);

// 7. Global error handler — catches any error thrown in controllers
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// 8. Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});