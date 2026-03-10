import { Optional } from 'sequelize';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

/**
 * Employee attributes interface
 * Represents all fields in the employees table
 */
export interface EmployeeAttributes {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  hireDate: Date;
  departmentId: number | null;
  position: string | null;
  salary: number;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Employee creation attributes
 * 'id' is optional because it's auto-generated
 */
export interface EmployeeCreationAttributes extends Optional<
  EmployeeAttributes,
  'id' | 'createdAt' | 'updatedAt'
> {}

/**
 * Input type for creating employees
 * Password is required for creation
 */
export interface EmployeeCreateInput {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  hireDate: Date;
  departmentId?: number;
  position?: string;
  salary: number;
  employmentType: EmploymentType;
  status?: EmployeeStatus;
}

/**
 * Input type for updating employees
 * All fields optional, password excluded from updates
 */
export interface EmployeeUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  departmentId?: number;
  position?: string;
  salary?: number;
  employmentType?: EmploymentType;
  status?: EmployeeStatus;
}

/**
 * Output type for API responses
 * Password field excluded for security
 */
export interface EmployeeOutput extends Omit<EmployeeAttributes, 'password'> {
  fullName?: string;
  department?: {
    id: number;
    name: string;
  };
}
