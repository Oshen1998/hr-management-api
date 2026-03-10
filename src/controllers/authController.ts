import { Request, Response } from 'express';
import User from '../models/user';
import { UserRole } from '../models/user';
import RefreshToken from '../models/refreshToken';
import AuditLog, { AuditAction, AuditResource } from '../models/auditLog';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokenPair,
} from '../utils/jwt';
import { generatePasswordResetToken, hashToken } from '../utils/crypto';
import {
  generateMfaSecret,
  generateQrCode,
  verifyTotp,
  verifyBackupCode,
  useBackupCode,
} from '../utils/mfa';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        status: 'error',
        message: 'Email already registered',
      });
      return;
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.EMPLOYEE,
    });

    await AuditLog.log({
      userId: user.id,
      action: AuditAction.REGISTER,
      resource: AuditResource.AUTH,
      description: `User ${email} registered`,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('User-Agent') || undefined,
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
      return;
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      await AuditLog.log({
        userId: user.id,
        action: AuditAction.LOGIN,
        resource: AuditResource.AUTH,
        description: `Failed login attempt for ${email}`,
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
        userAgent: req.get('User-Agent') || undefined,
        metadata: { reason: 'invalid_password' },
      });

      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        status: 'error',
        message: 'Account is deactivated',
      });
      return;
    }

    if (user.isMfaEnabled) {
      await user.update({ lastLoginAt: new Date() });

      await AuditLog.log({
        userId: user.id,
        action: AuditAction.LOGIN,
        resource: AuditResource.AUTH,
        description: `MFA required for ${email}`,
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
        userAgent: req.get('User-Agent') || undefined,
      });

      res.status(200).json({
        status: 'success',
        message: 'MFA verification required',
        data: {
          requiresMfa: true,
          userId: user.id,
        },
      });
      return;
    }

    const tokens = generateTokenPair(user);

    await RefreshToken.generate(user.id!, 30);
    await user.update({ lastLoginAt: new Date() });

    await AuditLog.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      resource: AuditResource.AUTH,
      description: `User ${email} logged in`,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('User-Agent') || undefined,
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        ...tokens,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
    });
  }
};

export const verifyMfa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, token, isBackupCode } = req.body;

    const user = await User.findByPk(userId);
    if (!user || !user.isMfaEnabled) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid request',
      });
      return;
    }

    let isValid = false;

    if (isBackupCode) {
      isValid = verifyBackupCode(token, user.mfaBackupCodes);
      if (isValid) {
        const updatedCodes = useBackupCode(token, user.mfaBackupCodes);
        await user.update({ mfaBackupCodes: updatedCodes || [] });
      }
    } else {
      isValid = verifyTotp(token, user.mfaSecret!);
    }

    if (!isValid) {
      await AuditLog.log({
        userId: user.id,
        action: AuditAction.LOGIN,
        resource: AuditResource.AUTH,
        description: `Failed MFA attempt for user ${user.email}`,
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
        userAgent: req.get('User-Agent') || undefined,
        metadata: { reason: 'invalid_mfa' },
      });

      res.status(401).json({
        status: 'error',
        message: 'Invalid MFA code',
      });
      return;
    }

    const tokens = generateTokenPair(user);
    await RefreshToken.generate(user.id!, 30);
    await user.update({ lastLoginAt: new Date() });

    await AuditLog.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      resource: AuditResource.AUTH,
      description: `User ${user.email} logged in with MFA`,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('User-Agent') || undefined,
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        ...tokens,
      },
    });
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'MFA verification failed',
    });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await RefreshToken.revoke(token);

        await AuditLog.log({
          userId: decoded.userId,
          action: AuditAction.LOGOUT,
          resource: AuditResource.AUTH,
          description: `User logged out`,
          ipAddress: req.ip || req.socket.remoteAddress || undefined,
          userAgent: req.get('User-Agent') || undefined,
        });
      } catch {
        // Token invalid or already revoked
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed',
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        status: 'error',
        message: 'Refresh token required',
      });
      return;
    }

    const decoded = verifyRefreshToken(token);

    const storedToken = await RefreshToken.findOne({
      where: {
        token,
        userId: decoded.userId,
        revokedAt: null,
      },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        status: 'error',
        message: 'User not found or inactive',
      });
      return;
    }

    await RefreshToken.revoke(token);
    const tokens = generateTokenPair(user);
    await RefreshToken.generate(user.id!, 30);

    res.status(200).json({
      status: 'success',
      data: tokens,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token',
    });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(200).json({
        status: 'success',
        message: 'If the email exists, a reset link will be sent',
      });
      return;
    }

    const resetToken = generatePasswordResetToken();
    const hashedToken = hashToken(resetToken);

    await user.update({
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await AuditLog.log({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET,
      resource: AuditResource.AUTH,
      description: `Password reset requested for ${email}`,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('User-Agent') || undefined,
      metadata: { resetToken: resetToken }, // In production, send via email instead
    });

    res.status(200).json({
      status: 'success',
      message: 'If the email exists, a reset link will be sent',
      data: { resetToken }, // Remove in production - send via email
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Password reset request failed',
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
      },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token',
      });
      return;
    }

    await user.update({
      password: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    await RefreshToken.destroy({ where: { userId: user.id } });

    await AuditLog.log({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET,
      resource: AuditResource.AUTH,
      description: `Password reset completed for ${user.email}`,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('User-Agent') || undefined,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Password reset failed',
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const user = await User.findByPk(userId);
    if (!user || !user.password) {
      res.status(400).json({
        status: 'error',
        message: 'User not found or using SSO',
      });
      return;
    }

    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect',
      });
      return;
    }

    await user.update({ password: newPassword });
    await RefreshToken.destroy({ where: { userId: user.id } });

    await AuditLog.log({
      userId: user.id,
      action: AuditAction.PASSWORD_CHANGE,
      resource: AuditResource.AUTH,
      description: `Password changed for ${user.email}`,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('User-Agent') || undefined,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Password change failed',
    });
  }
};

export const setupMfa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    const mfaData = generateMfaSecret(user.email);
    const qrCode = await generateQrCode(mfaData.otpauthUrl);
    mfaData.qrCode = qrCode;

    await user.update({
      mfaSecret: mfaData.secret,
      mfaBackupCodes: mfaData.backupCodes,
    });

    await AuditLog.log({
      userId: user.id,
      action: AuditAction.MFA_SETUP,
      resource: AuditResource.AUTH,
      description: `MFA setup initiated for ${user.email}`,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('User-Agent') || undefined,
    });

    res.status(200).json({
      status: 'success',
      data: {
        secret: mfaData.secret,
        qrCode: mfaData.qrCode,
        backupCodes: mfaData.backupCodes,
      },
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'MFA setup failed',
    });
  }
};

export const enableMfa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { token } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    const isValid = verifyTotp(token, user.mfaSecret!);
    if (!isValid) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid MFA token',
      });
      return;
    }

    await user.update({ isMfaEnabled: true });

    await AuditLog.log({
      userId: user.id,
      action: AuditAction.MFA_ENABLE,
      resource: AuditResource.AUTH,
      description: `MFA enabled for ${user.email}`,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('User-Agent') || undefined,
    });

    res.status(200).json({
      status: 'success',
      message: 'MFA enabled successfully',
    });
  } catch (error) {
    console.error('MFA enable error:', error);
    res.status(500).json({
      status: 'error',
      message: 'MFA enable failed',
    });
  }
};

export const disableMfa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { token } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    if (!user.isMfaEnabled) {
      res.status(400).json({
        status: 'error',
        message: 'MFA is not enabled',
      });
      return;
    }

    const isValid = verifyTotp(token, user.mfaSecret!);
    if (!isValid) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid MFA token',
      });
      return;
    }

    await user.update({
      isMfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: [],
    });

    await AuditLog.log({
      userId: user.id,
      action: AuditAction.MFA_DISABLE,
      resource: AuditResource.AUTH,
      description: `MFA disabled for ${user.email}`,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('User-Agent') || undefined,
    });

    res.status(200).json({
      status: 'success',
      message: 'MFA disabled successfully',
    });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({
      status: 'error',
      message: 'MFA disable failed',
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    await AuditLog.log({
      userId: user.id,
      action: AuditAction.USER_ACCESS,
      resource: AuditResource.AUTH,
      description: `User ${user.email} accessed their profile`,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('User-Agent') || undefined,
    });

    res.status(200).json({
      status: 'success',
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get profile',
    });
  }
};
