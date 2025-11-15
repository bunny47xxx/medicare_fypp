
require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('./../viable/db.js');
const User = require('./../model/User.js');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin123@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123';

    // Check if admin user already exists
    let existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (existingAdmin) {
      console.log('Admin user already exists with email:', adminEmail);
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await User.create({
      fullName: 'Default Admin',
      email: adminEmail,
      phone: '0000000000',
      passwordHash: passwordHash,
      address: 'Admin Address',
      city: 'Admin City',
      specialization: null,
      role: 'admin',
    });

    console.log('Admin user created successfully with email:', adminEmail);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();
