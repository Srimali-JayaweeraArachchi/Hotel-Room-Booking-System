import { Router } from 'express';
import { getPublic, listPublic } from '../controllers/roomController.js';
import { validate } from '../middleware/validate.js';
import {
  idParamSchema,
  publicRoomSearchSchema,
} from '../validators/roomSchemas.js';

const roomRouter = Router();
roomRouter.get('/', validate(publicRoomSearchSchema), listPublic);
roomRouter.get('/:id', validate(idParamSchema), getPublic);
export default roomRouter;
