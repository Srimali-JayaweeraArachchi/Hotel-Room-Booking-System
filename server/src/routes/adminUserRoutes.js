import { Router } from 'express';
import {
  listUsers,
  updateRole,
} from '../controllers/userManagementController.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  managedUserRoleSchema,
  managedUserSearchSchema,
} from '../validators/userManagementSchemas.js';

const adminUserRouter = Router();
adminUserRouter.use(authenticate, authorize('admin'));
adminUserRouter.get('/', validate(managedUserSearchSchema), listUsers);
adminUserRouter.patch('/:id/role', validate(managedUserRoleSchema), updateRole);
export default adminUserRouter;
