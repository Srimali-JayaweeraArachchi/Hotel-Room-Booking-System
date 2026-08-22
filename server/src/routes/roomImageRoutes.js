import { Router } from 'express';
import { serveRoomImage } from '../controllers/roomController.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/roomSchemas.js';

const roomImageRouter = Router();
roomImageRouter.get('/:id', validate(idParamSchema), serveRoomImage);
export default roomImageRouter;
