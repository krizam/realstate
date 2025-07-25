import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import adminRoutes from './routes/admin.route.js';
import reviewRoutes from './routes/review.route.js';
import bookingRoutes from './routes/booking.route.js';
import workerRoutes from "./routes/worker.routes.js";
import shiftingRequestRoutes from "./routes/shiftingRequest.routes.js";
import availabilityRoutes from './routes/availability.route.js';
import paymentRoutes from './routes/payment.route.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'https://realstate-client-nnr9.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow requests with no origin (e.g., Postman)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Routes
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/booking', bookingRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/shiftingRequest", shiftingRequestRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, statusCode, message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
