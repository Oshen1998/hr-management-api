import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type PermissionAction = 'preview' | 'manage' | 'send_password_reset';
export type PermissionResource =
  | 'users'
  | 'employees'
  | 'departments'
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'reports';

export interface PermissionAttributes {
  id: string;
  name: string;
  action: PermissionAction;
  resource: PermissionResource;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PermissionCreationAttributes extends Optional<
  PermissionAttributes,
  'id' | 'createdAt' | 'updatedAt'
> {}

class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  declare id: string;
  declare name: string;
  declare action: PermissionAction;
  declare resource: PermissionResource;
  declare description: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    action: {
      type: DataTypes.ENUM('preview', 'manage', 'send_password_reset'),
      allowNull: false,
    },
    resource: {
      type: DataTypes.ENUM(
        'users',
        'employees',
        'departments',
        'attendance',
        'leaves',
        'payroll',
        'reports'
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'permissions',
  }
);

export default Permission;
