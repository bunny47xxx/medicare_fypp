const User = require('./User');
const Appointment = require('./Appointment');
const DoctorSchedule = require('./DoctorSchedule');
const AppointmentNote = require('./AppointmentNote');
const PendingRegistration = require('./PendingRegistration');
const DoctorAvailability = require('./DoctorAvailability');
const MedicalRecord = require('./MedicalRecord');
const DoctorProfile = require('./DoctorProfile');
const PatientNotification = require('./PatientNotification');
const LabReport = require('./LabReport');

// Appointments
User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// Doctor Schedule (recurring weekly schedule)
User.hasMany(DoctorSchedule, { foreignKey: 'doctorId', as: 'schedule' });
DoctorSchedule.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// Doctor Availability (date-specific availability)
User.hasMany(DoctorAvailability, { foreignKey: 'doctorId', as: 'availability' });
DoctorAvailability.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// Appointment Notes
Appointment.hasOne(AppointmentNote, { foreignKey: 'appointmentId', as: 'note' });
AppointmentNote.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Medical Records
User.hasMany(MedicalRecord, { foreignKey: 'patientId', as: 'patientRecords' });
User.hasMany(MedicalRecord, { foreignKey: 'doctorId', as: 'doctorRecords' });
MedicalRecord.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
MedicalRecord.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Appointment.hasMany(MedicalRecord, { foreignKey: 'appointmentId', as: 'records' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Doctor Profile (extended credentials)
User.hasOne(DoctorProfile, { foreignKey: 'doctorId', as: 'profile' });
DoctorProfile.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// Patient Notifications
User.hasMany(PatientNotification, { foreignKey: 'patientId', as: 'notifications' });
PatientNotification.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Appointment.hasMany(PatientNotification, { foreignKey: 'appointmentId', as: 'notifications' });

// Lab Reports
User.hasMany(LabReport, { foreignKey: 'patientId', as: 'labReports' });
LabReport.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

module.exports = {
  User,
  Appointment,
  DoctorSchedule,
  AppointmentNote,
  PendingRegistration,
  DoctorAvailability,
  MedicalRecord,
  DoctorProfile,
  PatientNotification,
  LabReport,
};


