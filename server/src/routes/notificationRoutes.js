import { Router } from 'express';
import { listMine, markAllRead, markRead } from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { notificationIdSchema } from '../validators/notificationSchemas.js';

const notificationRouter = Router();
notificationRouter.use(authenticate, authorize('guest', 'staff', 'admin'));
notificationRouter.get('/', listMine);
notificationRouter.patch('/read-all', markAllRead);
notificationRouter.patch('/:id/read', validate(notificationIdSchema), markRead);
export default notificationRouter;
