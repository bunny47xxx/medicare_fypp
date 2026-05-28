const { DataTypes } = require('sequelize');
const { sequelize } = require('./../viable/db.js');

const LabReport = sequelize.define('LabReport', {
  patientId:     { type: DataTypes.INTEGER, allowNull: false },
  appointmentId: { type: DataTypes.INTEGER, allowNull: true },
  title:         { type: DataTypes.STRING,  allowNull: false },
  description:   { type: DataTypes.TEXT,    allowNull: true },
  fileName:      { type: DataTypes.STRING,  allowNull: false },
  filePath:      { type: DataTypes.STRING,  allowNull: false },
  fileType:      { type: DataTypes.STRING,  allowNull: true },
  fileSize:      { type: DataTypes.INTEGER, allowNull: true },
}, {
  timestamps: true,
  tableName: 'lab_reports',
});

module.exports = LabReport;
