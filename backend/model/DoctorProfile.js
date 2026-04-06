const { DataTypes } = require('sequelize');
const { sequelize } = require('./../viable/db.js');

const DoctorProfile = sequelize.define('DoctorProfile', {
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  nmcNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qualifications: {
    type: DataTypes.TEXT, // JSON array: [{degree, institution, year}]
    allowNull: true,
  },
  specializations: {
    type: DataTypes.TEXT, // JSON array of strings
    allowNull: true,
  },
  certificates: {
    type: DataTypes.TEXT, // JSON array: [{name, issuedBy, year}]
    allowNull: true,
  },
  experience: {
    type: DataTypes.INTEGER, // years of experience
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  languages: {
    type: DataTypes.STRING, // comma-separated
    allowNull: true,
  },
  verificationStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unsubmitted', // unsubmitted | pending | approved | rejected
  },
  verificationRequestedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verificationReviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verificationReviewedBy: {
    type: DataTypes.INTEGER, // admin user id
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'doctor_profiles',
});

module.exports = DoctorProfile;
