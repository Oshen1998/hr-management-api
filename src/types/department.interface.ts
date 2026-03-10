import { Optional } from 'sequelize';

/**
 * Represents all fields in the departments table
 */
export interface DepartmentAttributes {
  id: number;
  name: string;
  description: string | null;
  parentDepartmentId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Department creation attributes
 * 'id' is optional because it's auto-generated
 * 'createdAt' and 'updatedAt' are handled by Sequelize
 */
export interface DepartmentCreationAttributes extends Optional<
  DepartmentAttributes,
  'id' | 'createdAt' | 'updatedAt'
> {}

/**
 * Input type for creating/updating departments
 * Used in controllers and services
 */
export interface DepartmentInput {
  name: string;
  description?: string;
  parentDepartmentId?: number;
}

/**
 * Output type for API responses
 * Includes computed fields and relationships
 */
export interface DepartmentOutput extends DepartmentAttributes {
  employeeCount?: number;
  subDepartments?: DepartmentOutput[];
  parentDepartment?: DepartmentOutput;
}
