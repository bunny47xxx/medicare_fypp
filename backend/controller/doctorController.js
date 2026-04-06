const { User, Appointment, DoctorSchedule, AppointmentNote, DoctorAvailability, DoctorProfile } = require('../model/associations');
const { Op, sequelize } = require('sequelize');
const { sequelize: dbSequelize } = require('../viable/db');

// Get doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findByPk(req.user.id, {
      attributes: ['id', 'fullName', 'email', 'phone', 'address', 'city', 'specialization'],
      include: [{ model: DoctorProfile, as: 'profile' }],
    });

    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const data = doctor.toJSON();
    // Parse JSON fields in profile
    if (data.profile) {
      data.profile.qualifications = data.profile.qualifications ? JSON.parse(data.profile.qualifications) : [];
      data.profile.specializations = data.profile.specializations ? JSON.parse(data.profile.specializations) : [];
      data.profile.certificates = data.profile.certificates ? JSON.parse(data.profile.certificates) : [];
    }

    res.json({ doctor: data });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ error: 'Failed to fetch doctor profile' });
  }
};

// Update doctor profile (basic info + credentials)
const updateDoctorProfile = async (req, res) => {
  try {
    const { fullName, phone, address, city, specialization,
      nmcNo, qualifications, specializations, certificates,
      experience, bio, consultationFee, languages } = req.body;

    const doctor = await User.findByPk(req.user.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    await doctor.update({
      fullName: fullName || doctor.fullName,
      phone: phone || doctor.phone,
      address: address || doctor.address,
      city: city || doctor.city,
      specialization: specialization || doctor.specialization,
    });

    // Upsert DoctorProfile
    const [profile] = await DoctorProfile.findOrCreate({
      where: { doctorId: req.user.id },
      defaults: { doctorId: req.user.id },
    });

    await profile.update({
      nmcNo: nmcNo !== undefined ? nmcNo : profile.nmcNo,
      qualifications: qualifications !== undefined ? JSON.stringify(qualifications) : profile.qualifications,
      specializations: specializations !== undefined ? JSON.stringify(specializations) : profile.specializations,
      certificates: certificates !== undefined ? JSON.stringify(certificates) : profile.certificates,
      experience: experience !== undefined ? experience : profile.experience,
      bio: bio !== undefined ? bio : profile.bio,
      consultationFee: consultationFee !== undefined ? consultationFee : profile.consultationFee,
      languages: languages !== undefined ? languages : profile.languages,
    });

    const profileData = profile.toJSON();
    res.json({
      message: 'Profile updated successfully',
      doctor: {
        id: doctor.id, fullName: doctor.fullName, email: doctor.email,
        phone: doctor.phone, address: doctor.address, city: doctor.city,
        specialization: doctor.specialization,
      },
      profile: {
        ...profileData,
        qualifications: profileData.qualifications ? JSON.parse(profileData.qualifications) : [],
        specializations: profileData.specializations ? JSON.parse(profileData.specializations) : [],
        certificates: profileData.certificates ? JSON.parse(profileData.certificates) : [],
      },
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Submit verification request
const submitVerificationRequest = async (req, res) => {
  try {
    const [profile] = await DoctorProfile.findOrCreate({
      where: { doctorId: req.user.id },
      defaults: { doctorId: req.user.id },
    });

    if (profile.verificationStatus === 'approved') {
      return res.status(400).json({ error: 'Your profile is already verified.' });
    }
    if (profile.verificationStatus === 'pending') {
      return res.status(400).json({ error: 'Verification request already submitted and pending review.' });
    }
    if (!profile.nmcNo) {
      return res.status(400).json({ error: 'Please add your NMC No. before requesting verification.' });
    }

    await profile.update({
      verificationStatus: 'pending',
      verificationRequestedAt: new Date(),
      rejectionReason: null,
    });

    res.json({ message: 'Verification request submitted successfully. Admin will review your profile.' });
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({ error: 'Failed to submit verification request' });
  }
};

// Get doctor schedule
const getDoctorSchedule = async (req, res) => {
  try {
    const schedule = await DoctorSchedule.findAll({
      where: { doctorId: req.user.id },
      order: [
        ['dayOfWeek', 'ASC'],
        ['startTime', 'ASC'],
      ],
    });

    res.json({ schedule });
  } catch (error) {
    console.error('Get doctor schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

// Update doctor schedule
const updateDoctorSchedule = async (req, res) => {
  try {
    const { schedules } = req.body; // Array of schedule objects

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ error: 'Schedules must be an array' });
    }

    // Validate schedules
    for (const schedule of schedules) {
      if (!schedule.dayOfWeek || !schedule.startTime || !schedule.endTime) {
        return res.status(400).json({ error: 'Each schedule must have dayOfWeek, startTime, and endTime' });
      }
    }

    // Delete existing schedules for this doctor
    await DoctorSchedule.destroy({ where: { doctorId: req.user.id } });

    // Create new schedules (let database auto-generate IDs)
    const newSchedules = schedules.map(schedule => ({
      doctorId: req.user.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isAvailable: schedule.isAvailable !== undefined ? schedule.isAvailable : true,
      notes: schedule.notes || null,
    }));

    await DoctorSchedule.bulkCreate(newSchedules);

    const updatedSchedule = await DoctorSchedule.findAll({
      where: { doctorId: req.user.id },
      order: [
        [
          dbSequelize.literal(`CASE 
            WHEN "dayOfWeek" = 'Monday' THEN 1
            WHEN "dayOfWeek" = 'Tuesday' THEN 2
            WHEN "dayOfWeek" = 'Wednesday' THEN 3
            WHEN "dayOfWeek" = 'Thursday' THEN 4
            WHEN "dayOfWeek" = 'Friday' THEN 5
            WHEN "dayOfWeek" = 'Saturday' THEN 6
            WHEN "dayOfWeek" = 'Sunday' THEN 7
          END`)
        ],
        ['startTime', 'ASC']
      ],
    });

    res.json({
      message: 'Schedule updated successfully',
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error('Update doctor schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule: ' + error.message });
  }
};

// Get doctor appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    
    let whereClause = { doctorId: req.user.id };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (date) {
      whereClause.appointmentDate = date;
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'fullName', 'email', 'phone'],
        },
        {
          model: AppointmentNote,
          as: 'note',
          required: false,
        },
      ],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await Appointment.findOne({
      where: { id, doctorId: req.user.id },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await appointment.update({ status });

    res.json({
      message: 'Appointment status updated successfully',
      appointment,
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
};

// Add appointment note
const addAppointmentNote = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      chiefComplaint, pastIllnesses, ongoingConditions, allergies, currentMedications,
      physicalFindings, vitals,
      diagnosis, symptoms, treatment, prescriptions,
      advice, followUpDate, testsRequired, notes,
    } = req.body;

    const appointment = await Appointment.findOne({
      where: { id, doctorId: req.user.id },
      include: [{ model: User, as: 'patient', attributes: ['id'] }],
    });

    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    const fields = {
      chiefComplaint, pastIllnesses, ongoingConditions, allergies, currentMedications,
      physicalFindings,
      vitals: vitals ? JSON.stringify(vitals) : null,
      diagnosis, symptoms, treatment,
      prescriptions: prescriptions ? JSON.stringify(prescriptions) : null,
      advice, followUpDate: followUpDate || null, testsRequired, notes,
    };

    let appointmentNote = await AppointmentNote.findOne({ where: { appointmentId: id } });

    if (appointmentNote) {
      await appointmentNote.update(fields);
    } else {
      appointmentNote = await AppointmentNote.create({
        appointmentId: id,
        doctorId: req.user.id,
        patientId: appointment.patient.id,
        ...fields,
      });
    }

    res.json({ message: 'Appointment note saved successfully', note: appointmentNote });
  } catch (error) {
    console.error('Add appointment note error:', error);
    res.status(500).json({ error: 'Failed to save appointment note' });
  }
};

// Get doctor availability by date range
const getDoctorAvailability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = { doctorId: req.user.id };
    
    if (startDate && endDate) {
      whereClause.availableDate = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereClause.availableDate = {
        [Op.gte]: startDate
      };
    }

    const availability = await DoctorAvailability.findAll({
      where: whereClause,
      order: [['availableDate', 'ASC'], ['startTime', 'ASC']],
    });

    res.json({ availability });
  } catch (error) {
    console.error('Get doctor availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

// Set doctor availability for specific dates
const setDoctorAvailability = async (req, res) => {
  try {
    const { availabilitySlots } = req.body; // Array of availability objects

    if (!Array.isArray(availabilitySlots) || availabilitySlots.length === 0) {
      return res.status(400).json({ error: 'Availability slots must be a non-empty array' });
    }

    // Validate each slot
    for (const slot of availabilitySlots) {
      if (!slot.availableDate || !slot.startTime || !slot.endTime) {
        return res.status(400).json({ error: 'Each slot must have availableDate, startTime, and endTime' });
      }
    }

    // Create or update availability slots
    const results = [];
    for (const slot of availabilitySlots) {
      const [availability, created] = await DoctorAvailability.findOrCreate({
        where: {
          doctorId: req.user.id,
          availableDate: slot.availableDate,
          startTime: slot.startTime,
        },
        defaults: {
          doctorId: req.user.id,
          availableDate: slot.availableDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable !== undefined ? slot.isAvailable : true,
          slotDuration: slot.slotDuration || 30,
          maxPatients: slot.maxPatients || null,
          notes: slot.notes || null,
        },
      });

      if (!created) {
        // Update existing slot
        await availability.update({
          endTime: slot.endTime,
          isAvailable: slot.isAvailable !== undefined ? slot.isAvailable : availability.isAvailable,
          slotDuration: slot.slotDuration || availability.slotDuration,
          maxPatients: slot.maxPatients !== undefined ? slot.maxPatients : availability.maxPatients,
          notes: slot.notes !== undefined ? slot.notes : availability.notes,
        });
      }

      results.push(availability);
    }

    res.json({
      message: 'Availability updated successfully',
      availability: results,
    });
  } catch (error) {
    console.error('Set doctor availability error:', error);
    res.status(500).json({ error: 'Failed to set availability' });
  }
};

// Delete doctor availability slot
const deleteDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const availability = await DoctorAvailability.findOne({
      where: { id, doctorId: req.user.id },
    });

    if (!availability) {
      return res.status(404).json({ error: 'Availability slot not found' });
    }

    await availability.destroy();

    res.json({ message: 'Availability slot deleted successfully' });
  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({ error: 'Failed to delete availability slot' });
  }
};

// Create medical record for a patient
const createMedicalRecord = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const {
      patientId, appointmentId, recordType, title,
      chiefComplaint, pastIllnesses, ongoingConditions, allergies, currentMedications,
      physicalFindings, vitals,
      diagnosis, symptoms, treatment, prescriptions, labResults,
      advice, followUpDate, testsRequired, notes,
      status, recordDate,
    } = req.body;

    if (!patientId || !title) {
      return res.status(400).json({ error: 'Patient ID and title are required' });
    }

    const { MedicalRecord, User } = require('../model/associations');

    const patient = await User.findByPk(patientId);
    if (!patient || patient.role !== 'user') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const record = await MedicalRecord.create({
      patientId, doctorId,
      appointmentId: appointmentId || null,
      recordType: recordType || 'Consultation',
      title,
      chiefComplaint: chiefComplaint || null,
      pastIllnesses: pastIllnesses || null,
      ongoingConditions: ongoingConditions || null,
      allergies: allergies || null,
      currentMedications: currentMedications || null,
      physicalFindings: physicalFindings || null,
      vitals: vitals ? JSON.stringify(vitals) : null,
      diagnosis: diagnosis || null,
      symptoms: symptoms || null,
      treatment: treatment || null,
      prescriptions: prescriptions ? JSON.stringify(prescriptions) : null,
      labResults: labResults ? JSON.stringify(labResults) : null,
      advice: advice || null,
      followUpDate: followUpDate || null,
      testsRequired: testsRequired || null,
      notes: notes || null,
      status: status || 'Completed',
      recordDate: recordDate || new Date(),
    });

    res.status(201).json({ message: 'Medical record created successfully', record });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ error: 'Failed to create medical record' });
  }
};

// Get medical records created by doctor
const getDoctorMedicalRecords = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId } = req.query;

    const { MedicalRecord, User } = require('../model/associations');

    const whereClause = { doctorId };
    if (patientId) {
      whereClause.patientId = patientId;
    }

    const records = await MedicalRecord.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'fullName', 'email', 'phone'],
        },
      ],
      order: [['recordDate', 'DESC']],
    });

    // Parse JSON fields
    const formattedRecords = records.map(record => {
      const recordData = record.toJSON();
      return {
        ...recordData,
        prescriptions: recordData.prescriptions ? JSON.parse(recordData.prescriptions) : null,
        labResults: recordData.labResults ? JSON.parse(recordData.labResults) : null,
        vitals: recordData.vitals ? JSON.parse(recordData.vitals) : null,
        attachments: recordData.attachments ? JSON.parse(recordData.attachments) : null,
      };
    });

    res.json({ records: formattedRecords });
  } catch (error) {
    console.error('Get doctor medical records error:', error);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
};

// Get doctor earnings summary
const getDoctorEarnings = async (req, res) => {
  try {
    const paid = await Appointment.findAll({
      where: { doctorId: req.user.id, paymentStatus: 'paid' },
      include: [{ model: User, as: 'patient', attributes: ['id', 'fullName', 'email'] }],
      order: [['updatedAt', 'DESC']],
    });

    const totalEarnings = paid.reduce((sum, a) => sum + parseFloat(a.paymentAmount || 0), 0);

    // Group by month for chart data
    const byMonth = {};
    paid.forEach(a => {
      const month = new Date(a.updatedAt).toLocaleString('en-US', { year: 'numeric', month: 'short' });
      byMonth[month] = (byMonth[month] || 0) + parseFloat(a.paymentAmount || 0);
    });

    res.json({
      totalEarnings,
      totalPaidAppointments: paid.length,
      byMonth,
      payments: paid.map(a => ({
        id: a.id,
        patientName: a.patient?.fullName || 'N/A',
        patientEmail: a.patient?.email || '',
        amount: parseFloat(a.paymentAmount || 0),
        esewaRefId: a.esewaRefId,
        appointmentDate: a.appointmentDate,
        appointmentTime: a.appointmentTime,
        paidAt: a.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
};

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  submitVerificationRequest,
  getDoctorSchedule,
  updateDoctorSchedule,
  getDoctorAppointments,
  updateAppointmentStatus,
  addAppointmentNote,
  getDoctorAvailability,
  setDoctorAvailability,
  deleteDoctorAvailability,
  createMedicalRecord,
  getDoctorMedicalRecords,
  getDoctorEarnings,
};