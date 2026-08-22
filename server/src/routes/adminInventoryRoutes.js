import { Router } from 'express';
import {
  createRoomAdmin,
  createTypeAdmin,
  deleteRoomAdmin,
  deleteTypeAdmin,
  listRoomsAdmin,
  listTypesAdmin,
  updateRoomAdmin,
  updateTypeAdmin,
  uploadImagesAdmin,
  deleteImageAdmin,
} from '../controllers/roomController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { uploadRoomImages } from '../middleware/roomImageUpload.js';
import {
  idParamSchema,
  inventoryRoomSearchSchema,
  roomMutationSchema,
  roomTypeMutationSchema,
  imageParamSchema,
} from '../validators/roomSchemas.js';

const adminInventoryRouter = Router();
adminInventoryRouter.use(authenticate, authorize('admin'));
adminInventoryRouter.get('/room-types', listTypesAdmin);
adminInventoryRouter.post(
  '/room-types',
  validate(roomTypeMutationSchema),
  createTypeAdmin,
);
adminInventoryRouter.put(
  '/room-types/:id',
  validate(roomTypeMutationSchema),
  updateTypeAdmin,
);
adminInventoryRouter.delete(
  '/room-types/:id',
  validate(idParamSchema),
  deleteTypeAdmin,
);
adminInventoryRouter.post(
  '/room-types/:id/images',
  validate(idParamSchema),
  uploadRoomImages,
  uploadImagesAdmin,
);
adminInventoryRouter.delete(
  '/room-types/:id/images/:imageId',
  validate(imageParamSchema),
  deleteImageAdmin,
);
adminInventoryRouter.get(
  '/rooms',
  validate(inventoryRoomSearchSchema),
  listRoomsAdmin,
);
adminInventoryRouter.post(
  '/rooms',
  validate(roomMutationSchema),
  createRoomAdmin,
);
adminInventoryRouter.put(
  '/rooms/:id',
  validate(roomMutationSchema),
  updateRoomAdmin,
);
adminInventoryRouter.delete(
  '/rooms/:id',
  validate(idParamSchema),
  deleteRoomAdmin,
);
export default adminInventoryRouter;
