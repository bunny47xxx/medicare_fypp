const { DataTypes } = require('sequelize');
const { sequelize } = require('./../viable/db.js');

const PatientNotification = sequelize.define('PatientNotification', {
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(50), // 'appointment_confirmed' | 'consultation_notes'
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: 'patient_notifications',
});

module.exports = PatientNotification;
