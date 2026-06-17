import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());

// Routes
app.use('/api/v1/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
