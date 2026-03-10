import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';
import { UserRole } from '../enums';

export { UserRole };

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isMfaEnabled: boolean;
  mfaSecret: string | null;
  mfaBackupCodes: string[];
  samlId: string | null;
  departmentId: string | null;
  lastLoginAt: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  emailVerifiedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<
  UserAttributes,
  | 'id'
  | 'password'
  | 'isActive'
  | 'isMfaEnabled'
  | 'mfaSecret'
  | 'mfaBackupCodes'
  | 'samlId'
  | 'departmentId'
  | 'lastLoginAt'
  | 'passwordResetToken'
  | 'passwordResetExpires'
  | 'emailVerifiedAt'
> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password: string;
  declare firstName: string;
  declare lastName: string;
  declare role: UserRole;
  declare isActive: boolean;
  declare isMfaEnabled: boolean;
  declare mfaSecret: string | null;
  declare mfaBackupCodes: string[];
  declare samlId: string | null;
  declare departmentId: string | null;
  declare lastLoginAt: Date | null;
  declare passwordResetToken: string | null;
  declare passwordResetExpires: Date | null;
  declare emailVerifiedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  toJSON() {
    const values = { ...this.get() } as Record<string, unknown>;
    delete values.password;
    delete values.mfaSecret;
    delete values.mfaBackupCodes;
    delete values.passwordResetToken;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      defaultValue: UserRole.EMPLOYEE,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isMfaEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mfaSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mfaBackupCodes: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    samlId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

export default User;
