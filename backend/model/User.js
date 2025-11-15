// models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('./../viable/db.js');

const User = sequelize.define('User', {
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
    type: DataTypes.ENUM('user', 'doctor','admin'),
    defaultValue: 'user',
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'users',
});

module.exports = User;
