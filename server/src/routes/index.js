import { Router } from 'express';
import authRouter from './authRoutes.js';
import adminInventoryRouter from './adminInventoryRoutes.js';
import healthRouter from './healthRoutes.js';
import roomRouter from './roomRoutes.js';
import bookingRouter from './bookingRoutes.js';
import adminBookingRouter from './adminBookingRoutes.js';
import roomImageRouter from './roomImageRoutes.js';
import adminUserRouter from './adminUserRoutes.js';
import paymentRouter from './paymentRoutes.js';
import notificationRouter from './notificationRoutes.js';
import reviewRouter from './reviewRoutes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/rooms', roomRouter);
apiRouter.use('/admin/inventory', adminInventoryRouter);
apiRouter.use('/bookings', bookingRouter);
apiRouter.use('/admin/bookings', adminBookingRouter);
apiRouter.use('/admin/users', adminUserRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/room-images', roomImageRouter);

export default apiRouter;
