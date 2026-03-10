import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { AuditAction, AuditResource } from '../enums';

export { AuditAction, AuditResource };

export interface AuditLogAttributes {
  id: string;
  userId: string | null;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string | null;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuditLogCreationAttributes extends Optional<
  AuditLogAttributes,
  | 'id'
  | 'userId'
  | 'resourceId'
  | 'ipAddress'
  | 'userAgent'
  | 'metadata'
  | 'createdAt'
  | 'updatedAt'
> {}

class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  declare id: string;
  declare userId: string | null;
  declare action: AuditAction;
  declare resource: AuditResource;
  declare resourceId: string | null;
  declare description: string;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare metadata: Record<string, unknown>;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static async log(params: {
    userId?: string | undefined;
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string | undefined;
    description: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    metadata?: Record<string, unknown>;
  }): Promise<AuditLog> {
    return AuditLog.create({
      userId: params.userId ?? null,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId ?? null,
      description: params.description,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      metadata: params.metadata ?? {},
    });
  }
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.ENUM(...Object.values(AuditAction)),
      allowNull: false,
    },
    resource: {
      type: DataTypes.ENUM(...Object.values(AuditResource)),
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
  }
);

export default AuditLog;
