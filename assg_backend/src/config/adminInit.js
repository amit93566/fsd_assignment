import User from '../models/User.js';
import logger from './logger.js';

const initializeAdmin = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'ADMIN' });
    
    if (adminExists) {
      logger.info('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@lms.in',
      password: 'Admin@123',
      role: 'ADMIN'
    });

    await adminUser.save();
    logger.info('Admin user created successfully', {
      email: adminUser.email,
      role: adminUser.role
    });

  } catch (error) {
    logger.error('Error initializing admin user:', error);
    throw error;
  }
};

export default initializeAdmin;
