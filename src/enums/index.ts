export enum UserRole {
  ADMIN = 'Admin',
  HR_MANAGER = 'HR Manager',
  MANAGER = 'Manager',
  EMPLOYEE = 'Employee',
}

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',
  MFA_ENABLE = 'mfa_enable',
  MFA_DISABLE = 'mfa_disable',
  MFA_SETUP = 'mfa_setup',
  SSO_LOGIN = 'sso_login',
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_ACCESS = 'user_access',
  PERMISSION_CHANGE = 'permission_change',
  ROLE_CHANGE = 'role_change',
}

export enum AuditResource {
  AUTH = 'auth',
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  EMPLOYEE = 'employee',
  DEPARTMENT = 'department',
  ATTENDANCE = 'attendance',
  LEAVE = 'leave',
  PAYROLL = 'payroll',
}

export enum PermissionAction {
  PREVIEW = 'preview',
  MANAGE = 'manage',
  SEND_PASSWORD_RESET = 'send_password_reset',
}

export enum PermissionResource {
  USERS = 'users',
  EMPLOYEES = 'employees',
  DEPARTMENTS = 'departments',
  ATTENDANCE = 'attendance',
  LEAVES = 'leaves',
  PAYROLL = 'payroll',
  REPORTS = 'reports',
}
