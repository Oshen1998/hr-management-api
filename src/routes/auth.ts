import { Router, Response, NextFunction, RequestHandler } from 'express';
import * as authController from '../controllers/authController';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  RegisterRequest,
  LoginRequest,
  VerifyMfaRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types/request';

const router = Router();

const asyncHandler = (
  fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as AuthRequest, res, next)).catch(next);
  };
};

router.post(
  '/register',
  asyncHandler(async (req: RegisterRequest, res: Response) => {
    await authController.register(req as any, res);
  })
);

router.post(
  '/login',
  asyncHandler(async (req: LoginRequest, res: Response) => {
    console.log(req.body, 'req');
    
    await authController.login(req as any, res);
  })
);

router.post(
  '/verify-mfa',
  asyncHandler(async (req: VerifyMfaRequest, res: Response) => {
    await authController.verifyMfa(req as any, res);
  })
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await authController.logout(req, res);
  })
);

router.post(
  '/refresh-token',
  asyncHandler(async (req: RefreshTokenRequest, res: Response) => {
    await authController.refreshToken(req as any, res);
  })
);

router.post(
  '/forgot-password',
  asyncHandler(async (req: ForgotPasswordRequest, res: Response) => {
    await authController.requestPasswordReset(req as any, res);
  })
);

router.post(
  '/reset-password',
  asyncHandler(async (req: ResetPasswordRequest, res: Response) => {
    await authController.resetPassword(req as any, res);
  })
);

router.post(
  '/change-password',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await authController.changePassword(req, res);
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await authController.getMe(req, res);
  })
);

router.post(
  '/mfa/setup',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await authController.setupMfa(req, res);
  })
);

router.post(
  '/mfa/enable',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await authController.enableMfa(req, res);
  })
);

router.post(
  '/mfa/disable',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await authController.disableMfa(req, res);
  })
);

export default router;
