import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ROLE_PERMISSIONS } from '../constants';
import { PermissionAction, PermissionResource } from '../enums';

export type Permission =
  | `${PermissionResource}:${PermissionAction}`
  | `${PermissionResource}:send_password_reset`;

export const checkPermission = (...requiredPermissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const userRole = req.user.role;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};
