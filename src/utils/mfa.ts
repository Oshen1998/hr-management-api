import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { generateBackupCodes } from './crypto';

export interface MfaSetupResult {
  secret: string;
  otpauthUrl: string;
  qrCode: string;
  backupCodes: string[];
}

export const generateMfaSecret = (email: string): MfaSetupResult => {
  const secret = speakeasy.generateSecret({
    name: `HR Management System (${email})`,
    issuer: 'HR Management API',
  });

  const backupCodes = generateBackupCodes(10);

  return {
    secret: secret.base32 as string,
    otpauthUrl: secret.otpauth_url as string,
    qrCode: '',
    backupCodes,
  };
};

export const generateQrCode = async (otpauthUrl: string): Promise<string> => {
  return QRCode.toDataURL(otpauthUrl);
};

export const verifyTotp = (token: string, secret: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  }) as boolean;
};

export const verifyBackupCode = (inputCode: string, storedCodes: string[]): boolean => {
  const normalizedInput = inputCode.toUpperCase();
  return storedCodes.some((code: string) => code === normalizedInput);
};

export const useBackupCode = (inputCode: string, storedCodes: string[]): string[] | null => {
  const normalizedInput = inputCode.toUpperCase();
  const index = storedCodes.indexOf(normalizedInput);

  if (index === -1) {
    return null;
  }

  const updatedCodes = [...storedCodes];
  updatedCodes.splice(index, 1);
  return updatedCodes;
};
