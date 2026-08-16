import { Router } from 'express';
import { listAdmin, updateStatus } from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { adminBookingSearchSchema, bookingStatusSchema } from '../validators/bookingSchemas.js';

const adminBookingRouter = Router();
adminBookingRouter.use(authenticate);
adminBookingRouter.get('/', authorize('admin', 'staff'), validate(adminBookingSearchSchema), listAdmin);
adminBookingRouter.patch('/:id/status', authorize('staff'), validate(bookingStatusSchema), updateStatus);
export default adminBookingRouter;
