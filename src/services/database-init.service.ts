import bcrypt from 'bcrypt';
import User from '../models/user';
import { UserRole } from '../enums';

const ADMIN_EMAIL = 'admin@vyrian.com';
const ADMIN_PASSWORD = 'Orbit@26';

export const initializeDatabase = async (): Promise<void> => {
  try {
    let existingAdmin = await User.findOne({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await existingAdmin.update({ password: hashedPassword });
      console.log('✅ Admin user password updated');
      return;
    }

    await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
      isMfaEnabled: false,
      emailVerifiedAt: new Date(),
    });

    console.log('✅ Admin user created successfully');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error('❌ Failed to initialize admin user:', error);
    throw error;
  }
};
