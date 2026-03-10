import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import AuditLog, { AuditAction, AuditResource } from '../models/auditLog';

export const auditLog = (
  action: AuditAction,
  resource: AuditResource,
  getResourceId?: (req: AuthRequest) => string | undefined,
  getDescription?: (req: AuthRequest) => string
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);

    res.json = function (body: Record<string, unknown>) {
      const resourceIdParam = getResourceId ? getResourceId(req) : req.params.id;
      const resourceId = Array.isArray(resourceIdParam)
        ? resourceIdParam[0]
        : resourceIdParam || undefined;
      const description = getDescription ? getDescription(req) : `${action} ${resource}`;

      AuditLog.log({
        userId: req.user?.userId || undefined,
        action,
        resource,
        resourceId,
        description,
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
        userAgent: typeof req.get('User-Agent') === 'string' ? req.get('User-Agent') : undefined,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          response: body,
        },
      }).catch(console.error);

      return originalJson(body);
    };

    next();
  };
};
