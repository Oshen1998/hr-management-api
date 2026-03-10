import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface RefreshTokenAttributes {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  deviceInfo: string | null;
  ipAddress: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RefreshTokenCreationAttributes extends Optional<
  RefreshTokenAttributes,
  'id' | 'revokedAt' | 'deviceInfo' | 'ipAddress' | 'createdAt' | 'updatedAt'
> {}

class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  declare id: string;
  declare token: string;
  declare userId: string;
  declare expiresAt: Date;
  declare revokedAt: Date | null;
  declare deviceInfo: string | null;
  declare ipAddress: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static async generate(userId: string, expiresInDays: number = 30): Promise<RefreshToken> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return RefreshToken.create({
      token,
      userId,
      expiresAt,
    });
  }

  static async revoke(token: string): Promise<void> {
    await RefreshToken.update({ revokedAt: new Date() }, { where: { token } });
  }
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deviceInfo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
  }
);

export default RefreshToken;
