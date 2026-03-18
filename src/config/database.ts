import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'hr_management_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    pool: {
      max: 5, // Maximum number of connections
      min: 0, // Minimum number of connections
      acquire: 30000, // Maximum time to get connection (ms)
      idle: 10000, // Maximum idle time before release (ms)
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '+00:00',
    define: {
      timestamps: true, // Add createdAt and updatedAt
      underscored: true, // Use snake_case for columns
      freezeTableName: true, // Don't pluralize table names
    },
  }
);

export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
};

export default sequelize;
