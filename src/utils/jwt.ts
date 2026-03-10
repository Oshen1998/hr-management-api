import jwt from 'jsonwebtoken';
import { UserRole } from '../enums';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateAccessToken = (user: {
  id?: string;
  email?: string;
  role?: UserRole;
}): string => {
  const payload: JwtPayload = {
    userId: user.id!,
    email: user.email!,
    role: user.role!,
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
    issuer: 'hr-management-api',
  });
};

export const generateRefreshToken = (user: {
  id?: string;
  email?: string;
  role?: UserRole;
}): string => {
  const payload: JwtPayload = {
    userId: user.id!,
    email: user.email!,
    role: user.role!,
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || `${process.env.JWT_SECRET}_refresh`, {
    expiresIn: '30d',
    issuer: 'hr-management-api',
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || `${process.env.JWT_SECRET}_refresh`
  ) as JwtPayload;
};

export const generateTokenPair = (user: {
  id?: string;
  email?: string;
  role?: UserRole;
}): TokenPair => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};
