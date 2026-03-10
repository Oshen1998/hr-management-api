import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '../config/database';
import { DepartmentAttributes, DepartmentCreationAttributes } from '../types/department.interface';

/**
 * Department Model
 * Represents organizational departments in the company
 * Supports hierarchical structure (parent-child relationships)
 */
class Department
  extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes
{
  public id!: number;
  public name!: string;
  // Optional fields
  public description!: string | null;
  public parentDepartmentId!: number | null;
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  // Associations (will be populated by Sequelize)
  public readonly employees?: any[]; // Employee[] - avoiding circular dependency
  public readonly subDepartments?: Department[];
  public readonly parentDepartment?: Department;

  // Association type definitions for TypeScript
  public static associations: {
    employees: Association<Department, any>;
    subDepartments: Association<Department, Department>;
    parentDepartment: Association<Department, Department>;
  };

  /**
   * Instance method: Check if department has employees
   */
  public async hasEmployees(): Promise<boolean> {
    const Employee = sequelize.models.Employee;
    if (!Employee) return false;

    const count = await Employee.count({
      where: { departmentId: this.id },
    });

    return count > 0;
  }

  /**
   * Class method: Find root departments (no parent)
   */
  public static async findRootDepartments(): Promise<Department[]> {
    return await Department.findAll({
      where: { parentDepartmentId: null },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Class method: Find departments by name (case-insensitive search)
   */
  public static async searchByName(searchTerm: string): Promise<Department[]> {
    return await Department.findAll({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        'LIKE',
        `%${searchTerm.toLowerCase()}%`
      ),
      order: [['name', 'ASC']],
    });
  }
}

// Initialize the model
Department.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Primary key - auto-incrementing ID',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Department name - must be unique',
      validate: {
        notEmpty: {
          msg: 'Department name cannot be empty',
        },
        len: {
          args: [2, 100],
          msg: 'Department name must be between 2 and 100 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional description of the department',
    },
    parentDepartmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_department_id',
      comment: 'Reference to parent department for hierarchical structure',
      validate: {
        async isNotSelfReference(value: number) {
          if (value === this.id) {
            throw new Error('Department cannot be its own parent');
          }
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'departments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_department_name',
        fields: ['name'],
      },
      {
        name: 'idx_parent_department',
        fields: ['parent_department_id'],
      },
    ],
    comment: 'Stores organizational department structure',
  }
);

// Model hooks
Department.beforeDestroy(async (department) => {
  // Prevent deletion if department has employees
  const Employee = sequelize.models.Employee;
  if (Employee) {
    const employeeCount = await Employee.count({
      where: { departmentId: department.id },
    });

    if (employeeCount > 0) {
      throw new Error(
        `Cannot delete department with ${employeeCount} employees. Please reassign employees first.`
      );
    }
  }

  // Prevent deletion if department has sub-departments
  const subDeptCount = await Department.count({
    where: { parentDepartmentId: department.id },
  });

  if (subDeptCount > 0) {
    throw new Error(
      `Cannot delete department with ${subDeptCount} sub-departments. Please remove sub-departments first.`
    );
  }
});

export default Department;
