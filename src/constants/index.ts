export const JWT_EXPIRY = '7d';
export const REFRESH_TOKEN_EXPIRY_DAYS = 30;
export const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
export const MFA_BACKUP_CODES_COUNT = 10;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: [
    'users:preview',
    'users:manage',
    'users:send_password_reset',
    'employees:preview',
    'employees:manage',
    'departments:preview',
    'departments:manage',
    'attendance:preview',
    'attendance:manage',
    'leaves:preview',
    'leaves:manage',
    'payroll:preview',
    'payroll:manage',
    'reports:preview',
    'reports:manage',
  ],
  'HR Manager': [
    'employees:preview',
    'employees:manage',
    'departments:preview',
    'departments:manage',
    'attendance:preview',
    'attendance:manage',
    'leaves:preview',
    'leaves:manage',
    'reports:preview',
  ],
  Manager: [
    'employees:preview',
    'attendance:preview',
    'leaves:preview',
    'leaves:manage',
    'reports:preview',
  ],
  Employee: ['employees:preview', 'attendance:preview', 'leaves:preview'],
};

export const PERMISSIONS = {
  USERS_PREVIEW: { action: 'preview', resource: 'users', name: 'users:preview' },
  USERS_MANAGE: { action: 'manage', resource: 'users', name: 'users:manage' },
  USERS_SEND_PASSWORD_RESET: {
    action: 'send_password_reset',
    resource: 'users',
    name: 'users:send_password_reset',
  },
  EMPLOYEES_PREVIEW: { action: 'preview', resource: 'employees', name: 'employees:preview' },
  EMPLOYEES_MANAGE: { action: 'manage', resource: 'employees', name: 'employees:manage' },
  DEPARTMENTS_PREVIEW: { action: 'preview', resource: 'departments', name: 'departments:preview' },
  DEPARTMENTS_MANAGE: { action: 'manage', resource: 'departments', name: 'departments:manage' },
  ATTENDANCE_PREVIEW: { action: 'preview', resource: 'attendance', name: 'attendance:preview' },
  ATTENDANCE_MANAGE: { action: 'manage', resource: 'attendance', name: 'attendance:manage' },
  LEAVES_PREVIEW: { action: 'preview', resource: 'leaves', name: 'leaves:preview' },
  LEAVES_MANAGE: { action: 'manage', resource: 'leaves', name: 'leaves:manage' },
  PAYROLL_PREVIEW: { action: 'preview', resource: 'payroll', name: 'payroll:preview' },
  PAYROLL_MANAGE: { action: 'manage', resource: 'payroll', name: 'payroll:manage' },
  REPORTS_PREVIEW: { action: 'preview', resource: 'reports', name: 'reports:preview' },
  REPORTS_MANAGE: { action: 'manage', resource: 'reports', name: 'reports:manage' },
} as const;
