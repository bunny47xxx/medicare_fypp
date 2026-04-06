const { DataTypes } = require('sequelize');
const { sequelize } = require('./../viable/db.js');

const MedicalRecord = sequelize.define('MedicalRecord', {
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null for lab reports not tied to appointments
  },
  recordType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Consultation',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  prescriptions: {
    type: DataTypes.TEXT, // JSON array: [{name, dosage, duration, instructions}]
    allowNull: true,
  },
  // Chief Complaint
  chiefComplaint: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Medical History
  pastIllnesses: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ongoingConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  currentMedications: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Doctor's Observations
  physicalFindings: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  labResults: {
    type: DataTypes.TEXT, // JSON string of lab results
    allowNull: true,
  },
  vitals: {
    type: DataTypes.TEXT, // JSON: { bp, hr, temp, weight, spo2 }
    allowNull: true,
  },
  // Advice & follow-up
  advice: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  testsRequired: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  followUpDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Completed',
  },
  recordDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  attachments: {
    type: DataTypes.TEXT, // JSON string of file paths/URLs
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'medical_records',
});

module.exports = MedicalRecord;
