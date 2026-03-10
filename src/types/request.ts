import { Request } from 'express';

export interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
}

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export interface VerifyMfaRequest extends Request {
  body: {
    userId: string;
    token: string;
    isBackupCode?: boolean;
  };
}

export interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

export interface ForgotPasswordRequest extends Request {
  body: {
    email: string;
  };
}

export interface ResetPasswordRequest extends Request {
  body: {
    token: string;
    newPassword: string;
  };
}

export interface ChangePasswordRequest extends Request {
  body: {
    currentPassword: string;
    newPassword: string;
  };
}

export interface MfaTokenRequest extends Request {
  body: {
    token: string;
  };
}
