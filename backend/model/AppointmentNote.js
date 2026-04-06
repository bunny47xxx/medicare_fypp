const { DataTypes } = require('sequelize');
const { sequelize } = require('./../viable/db.js');

const AppointmentNote = sequelize.define('AppointmentNote', {
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Chief Complaint
  chiefComplaint: DataTypes.TEXT,
  // Medical History
  pastIllnesses: DataTypes.TEXT,
  ongoingConditions: DataTypes.TEXT,
  allergies: DataTypes.TEXT,
  currentMedications: DataTypes.TEXT,
  // Doctor's Observations
  physicalFindings: DataTypes.TEXT,
  vitals: DataTypes.TEXT,          // JSON: { bp, hr, temp, weight, spo2 }
  // Diagnosis & Treatment
  diagnosis: DataTypes.TEXT,
  symptoms: DataTypes.TEXT,
  treatment: DataTypes.TEXT,
  prescriptions: DataTypes.TEXT,   // JSON array: [{name, dosage, duration, instructions}]
  // Advice
  advice: DataTypes.TEXT,
  // Follow-up
  followUpDate: DataTypes.DATEONLY,
  testsRequired: DataTypes.TEXT,
  // Extra notes
  notes: DataTypes.TEXT,
}, {
  timestamps: true,
  tableName: 'appointment_notes',
});

module.exports = AppointmentNote;


