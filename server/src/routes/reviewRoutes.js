import { Router } from 'express';
import {
  create,
  listMine,
  listPublic,
  remove,
  update,
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createReviewSchema,
  reviewIdSchema,
  roomTypeReviewSchema,
  updateReviewSchema,
} from '../validators/reviewSchemas.js';

const reviewRouter = Router();
reviewRouter.get(
  '/room-types/:roomTypeId',
  validate(roomTypeReviewSchema),
  listPublic,
);
reviewRouter.get('/me', authenticate, authorize('guest'), listMine);
reviewRouter.post(
  '/bookings/:bookingId',
  authenticate,
  authorize('guest'),
  validate(createReviewSchema),
  create,
);
reviewRouter.put(
  '/:id',
  authenticate,
  authorize('guest'),
  validate(updateReviewSchema),
  update,
);
reviewRouter.delete(
  '/:id',
  authenticate,
  authorize('guest'),
  validate(reviewIdSchema),
  remove,
);
export default reviewRouter;
