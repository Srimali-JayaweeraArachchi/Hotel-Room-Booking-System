import { Router } from 'express';
import { cancel, create, getOne, listMine, modify } from '../controllers/bookingController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { bookingIdSchema, createBookingSchema, updateBookingSchema } from '../validators/bookingSchemas.js';

const bookingRouter = Router();
bookingRouter.use(authenticate);
bookingRouter.get('/me', listMine);
bookingRouter.post('/', validate(createBookingSchema), create);
bookingRouter.get('/:id', validate(bookingIdSchema), getOne);
bookingRouter.put('/:id', validate(updateBookingSchema), modify);
bookingRouter.patch('/:id/cancel', validate(bookingIdSchema), cancel);
export default bookingRouter;
