const { User, Appointment, DoctorSchedule, DoctorProfile } = require('../model/associations');
const { Op } = require('sequelize');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalDoctors = await User.count({ where: { role: 'doctor' } });
    const totalAppointments = await Appointment.count();
    const pendingAppointments = await Appointment.count({ where: { status: 'pending' } });
    const completedAppointments = await Appointment.count({ where: { status: 'completed' } });

    res.json({
      totalUsers,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = role ? { role } : { role: { [Op.ne]: 'admin' } };

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'fullName', 'email', 'phone', 'role', 'emailVerified', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      users: users.rows,
      totalCount: users.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(users.count / limit),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'doctor' },
      attributes: ['id', 'fullName', 'email', 'phone', 'specialization', 'emailVerified', 'createdAt'],
      include: [
        {
          model: DoctorSchedule,
          as: 'schedule',
          attributes: ['dayOfWeek', 'startTime', 'endTime', 'isAvailable'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = status ? { status } : {};

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'fullName', 'email', 'phone'],
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'fullName', 'specialization'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']],
    });

    res.json({
      appointments: appointments.rows,
      totalCount: appointments.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(appointments.count / limit),
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { emailVerified } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot modify admin users' });
    }

    await user.update({ emailVerified });

    res.json({ 
      message: 'User status updated successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Get all pending doctor verification requests
const getPendingVerifications = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const profiles = await DoctorProfile.findAll({
      where: { verificationStatus: status },
      include: [{
        model: User,
        as: 'doctor',
        attributes: ['id', 'fullName', 'email', 'phone', 'specialization', 'city'],
      }],
      order: [['verificationRequestedAt', 'ASC']],
    });

    const formatted = profiles.map(p => {
      const d = p.toJSON();
      return {
        ...d,
        qualifications: d.qualifications ? JSON.parse(d.qualifications) : [],
        specializations: d.specializations ? JSON.parse(d.specializations) : [],
        certificates: d.certificates ? JSON.parse(d.certificates) : [],
      };
    });

    res.json({ verifications: formatted });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
};

// Approve or reject a doctor verification
const reviewVerification = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve or reject' });
    }

    const profile = await DoctorProfile.findOne({ where: { doctorId } });
    if (!profile) return res.status(404).json({ error: 'Doctor profile not found' });

    if (profile.verificationStatus !== 'pending') {
      return res.status(400).json({ error: 'This request is not pending review' });
    }

    await profile.update({
      verificationStatus: action === 'approve' ? 'approved' : 'rejected',
      verificationReviewedAt: new Date(),
      verificationReviewedBy: req.user.id,
      rejectionReason: action === 'reject' ? (rejectionReason || 'Not specified') : null,
    });

    res.json({ message: `Doctor verification ${action === 'approve' ? 'approved' : 'rejected'} successfully.` });
  } catch (error) {
    console.error('Review verification error:', error);
    res.status(500).json({ error: 'Failed to review verification' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllDoctors,
  getAllAppointments,
  updateUserStatus,
  getPendingVerifications,
  reviewVerification,
};