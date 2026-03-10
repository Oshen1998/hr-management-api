import { Strategy as SamlStrategy, VerifiedCallback } from 'passport-saml';
import passport from 'passport';
import { Request, Response } from 'express';
import User, { UserRole } from '../../models/user';
import { AuditAction, AuditResource } from '../../models/auditLog';
import { generateTokenPair } from '../../utils/jwt';
import RefreshToken from '../../models/refreshToken';
import AuditLog from '../../models/auditLog';

const samlConfig = {
  entryPoint: process.env.SAML_ENTRY_POINT || 'https://idp.example.com/sso/saml',
  issuer: process.env.SAML_ISSUER || 'hr-management-api',
  callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:3000/auth/saml/callback',
  cert: process.env.SAML_CERT || '',
  wantAssertionsSigned: true,
  wantAuthnResponseSigned: false,
  signatureAlgorithm: 'sha256' as const,
};

export const samlStrategy = new SamlStrategy(
  samlConfig,

  async (profile: any, done: VerifiedCallback) => {
    try {
      if (!profile || !profile.nameID) {
        return done(new Error('No profile from SAML'));
      }

      const samlId = profile.nameID;

      let user = await User.findOne({ where: { samlId } });

      if (!user) {
        const email = profile.email || `${samlId}@sso.local`;

        user = await User.create({
          email,
          firstName: profile.firstName || profile.givenName || 'SSO',
          lastName: profile.lastName || profile.surname || 'User',
          samlId,
          role: UserRole.EMPLOYEE,
          isActive: true,
        });
      }

      if (!user.isActive) {
        return done(new Error('User account is deactivated'));
      }

      await user.update({ lastLoginAt: new Date() });

      return done(null, user as any);
    } catch (error) {
      return done(error as Error);
    }
  }
);

export const samlAuthenticate = () => {
  return passport.authenticate('saml', { session: false });
};

export const samlCallback = () => {
  return passport.authenticate('saml', {
    session: false,
    failureRedirect: '/login?error=saml_failed',
  });
};

export const handleSamlLogin = async (req: Request, res: Response) => {
  const user = req.user as any;

  const tokens = generateTokenPair(user);
  await RefreshToken.generate(user.id, 30);

  await AuditLog.log({
    userId: user.id,
    action: AuditAction.SSO_LOGIN,
    resource: AuditResource.AUTH,
    description: `User ${user.email} logged in via SAML`,
    ipAddress: req.ip || req.socket?.remoteAddress || undefined,
    userAgent: req.get('User-Agent') || undefined,
  });

  const redirectUrl = process.env.SAML_SUCCESS_REDIRECT || '/dashboard';

  res.redirect(
    `${redirectUrl}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
  );
};
