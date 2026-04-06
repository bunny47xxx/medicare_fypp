const { DataTypes } = require('sequelize');
const { sequelize } = require('./../viable/db.js');

const Appointment = sequelize.define('Appointment', {
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  appointmentTime: {
    // 'HH:MM' 24-hour
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  paymentStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unpaid', // unpaid | paid | failed
  },
  paymentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  esewaTransactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  esewaRefId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'appointments',
});

module.exports = Appointment;


