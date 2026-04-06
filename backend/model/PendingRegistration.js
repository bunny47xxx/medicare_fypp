const { DataTypes } = require('sequelize');
const { sequelize } = require('./../viable/db.js');

const PendingRegistration = sequelize.define('PendingRegistration', {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'doctor'),
    defaultValue: 'user',
    allowNull: false,
  },
  otpHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  otpSentAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true,
  tableName: 'pending_registrations',
  indexes: [
    {
      fields: ['email'],
    },
    {
      fields: ['verificationToken'],
    },
    {
      fields: ['otpExpiresAt'],
    },
  ],
});

module.exports = PendingRegistration;
