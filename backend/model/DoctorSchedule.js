const { DataTypes } = require('sequelize');
const { sequelize } = require('./../viable/db.js');

const DoctorSchedule = sequelize.define('DoctorSchedule', {
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dayOfWeek: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false,
  },
  startTime: {
    // 'HH:MM'
    type: DataTypes.STRING,
    allowNull: false,
  },
  endTime: {
    // 'HH:MM'
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'doctor_schedules',
});

module.exports = DoctorSchedule;


