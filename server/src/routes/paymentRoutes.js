// Payment module — payment API routes

import { Router } from 'express';
import { listMine, pay } from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { paymentCreateSchema, paymentListSchema } from '../validators/paymentSchemas.js';

const paymentRouter = Router();
paymentRouter.use(authenticate, authorize('guest'));
paymentRouter.get('/bookings/:bookingId', validate(paymentListSchema), listMine);
paymentRouter.post('/bookings/:bookingId', validate(paymentCreateSchema), pay);
export default paymentRouter;
