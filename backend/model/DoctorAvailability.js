const { DataTypes } = require('sequelize');
const { sequelize } = require('./../viable/db.js');

const DoctorAvailability = sequelize.define('DoctorAvailability', {
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  availableDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  startTime: {
    // 'HH:MM' 24-hour format
    type: DataTypes.STRING,
    allowNull: false,
  },
  endTime: {
    // 'HH:MM' 24-hour format
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  slotDuration: {
    // Duration in minutes (e.g., 30 for 30-minute slots)
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
  },
  maxPatients: {
    // Maximum patients for this date
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'doctor_availability',
  indexes: [
    {
      fields: ['doctorId', 'availableDate'],
    },
    {
      fields: ['availableDate'],
    },
  ],
});

module.exports = DoctorAvailability;
