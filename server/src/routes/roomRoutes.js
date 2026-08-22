import { Router } from 'express';
import { getPublic, listPublic } from '../controllers/roomController.js';
import { validate } from '../middleware/validate.js';
import {
  idParamSchema,
  publicRoomSearchSchema,
} from '../validators/roomSchemas.js';
