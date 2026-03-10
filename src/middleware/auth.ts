import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import User from '../models/user';

export interface AuthRequest extends Request {
  user?: JwtPayload;
  userModel?: User;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token format',
      });
      return;
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        status: 'error',
        message: 'User not found or inactive',
      });
      return;
    }

    (req as AuthRequest).user = decoded;
    (req as AuthRequest).userModel = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }
};
