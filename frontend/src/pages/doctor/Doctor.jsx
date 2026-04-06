import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  CheckCircle,
  XCircle,
  X,
  Search,
  RefreshCw,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  CalendarDays,
  Bell,
  Eye,
  Award,
  BadgeCheck,
  GraduationCap,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  ChevronRight,
  DollarSign,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import axios from 'axios';

export default function Doctor() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Reschedule form state
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: '',
    newTime: ''
  });
  
  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
    notes: ''
  });

  // Consultation notes form state
  const [notesForm, setNotesForm] = useState({
    chiefComplaint: '',
    pastIllnesses: '',
    ongoingConditions: '',
    allergies: '',
    currentMedications: '',
    physicalFindings: '',
    vitals: { bp: '', hr: '', temp: '', weight: '', spo2: '' },
    diagnosis: '',
    symptoms: '',
    treatment: '',
    prescriptions: [{ name: '', dosage: '', duration: '', instructions: '' }],
    advice: '',
    followUpDate: '',
    testsRequired: '',
    notes: '',
  });

  // Profile state
  const [profileData, setProfileData] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '', phone: '', address: '', city: '', specialization: '',
    nmcNo: '', experience: '', bio: '', consultationFee: '', languages: '',
    qualifications: [], specializations: [], certificates: [],
  });
  const [newQual, setNewQual] = useState({ degree: '', institution: '', year: '' });
  const [newCert, setNewCert] = useState({ name: '', issuedBy: '', year: '' });
  const [newSpec, setNewSpec] = useState('');
  const [earnings, setEarnings] = useState(null);

  const API_BASE = 'http://localhost:5000/api';
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setDoctor(parsedUser);
        fetchAppointments(parsedUser.id);
        loadNotifications(parsedUser.id);
        fetchDoctorProfile(); // always load profile for dashboard card
        if (activeTab === 'schedule') {
          fetchSchedule(parsedUser.id);
        }
        if (activeTab === 'profile') {
          fetchDoctorProfile();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [statusFilter, activeTab]);

  // Load notifications from localStorage
  const loadNotifications = (doctorId) => {
    const savedNotifications = localStorage.getItem(`doctor_notifications_${doctorId}`);
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      // Initialize with empty array
      setNotifications([]);
    }
  };

  // Load schedule from localStorage or API
  useEffect(() => {
    if (doctor && activeTab === 'schedule') {
      const savedSchedule = localStorage.getItem(`doctor_schedule_${doctor.id}`);
      if (savedSchedule) {
        setSchedule(JSON.parse(savedSchedule));
      } else {
        fetchSchedule(doctor.id);
      }
    }
    if (doctor && activeTab === 'profile') {
      fetchDoctorProfile();
    }
    if (doctor && activeTab === 'earnings') {
      fetchEarnings();
    }
  }, [activeTab, doctor]);

  const fetchAppointments = async (doctorId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axios.get(`${API_BASE}/doctor/appointments?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAppointments(response.data.appointments || response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/doctor/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = res.data.doctor;
      setProfileData(d);
      setProfileForm({
        fullName: d.fullName || '',
        phone: d.phone || '',
        address: d.address || '',
        city: d.city || '',
        specialization: d.specialization || '',
        nmcNo: d.profile?.nmcNo || '',
        experience: d.profile?.experience || '',
        bio: d.profile?.bio || '',
        consultationFee: d.profile?.consultationFee || '',
        languages: d.profile?.languages || '',
        qualifications: d.profile?.qualifications || [],
        specializations: d.profile?.specializations || [],
        certificates: d.profile?.certificates || [],
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/doctor/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEarnings(res.data);
    } catch (err) {
      console.error('Error fetching earnings:', err);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/doctor/profile`, {
        ...profileForm,
        experience: profileForm.experience ? parseInt(profileForm.experience) : null,
        consultationFee: profileForm.consultationFee ? parseFloat(profileForm.consultationFee) : null,
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Profile saved successfully!');
      fetchDoctorProfile();
    } catch (err) {
      alert('Failed to save profile: ' + (err.response?.data?.error || 'Server error'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSubmitVerification = async () => {
    const { percent } = computeProfileCompletion(profileForm);
    if (percent < 100) {
      alert('Please complete your profile (100%) before requesting verification.');
      return;
    }
    if (!profileForm.nmcNo) {
      alert('Please add your NMC No. before submitting for verification.');
      return;
    }
    if (!confirm('Submit your profile for admin verification?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/doctor/profile/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Verification request submitted! Admin will review your profile.');
      fetchDoctorProfile();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit verification');
    }
  };

  const fetchSchedule = async (doctorId) => {    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/doctor/schedule`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSchedule(response.data.schedule || response.data);
      localStorage.setItem(`doctor_schedule_${doctorId}`, JSON.stringify(response.data.schedule || response.data));
    } catch (error) {
      console.error('Error fetching schedule:', error);
      // Fallback to localStorage
      const savedSchedule = localStorage.getItem(`doctor_schedule_${doctorId}`);
      if (savedSchedule) {
        setSchedule(JSON.parse(savedSchedule));
      } else {
        setSchedule([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.dayOfWeek || !scheduleForm.startTime || !scheduleForm.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Add new schedule to existing ones (without ID - let backend generate it)
      const newScheduleItem = {
        dayOfWeek: scheduleForm.dayOfWeek,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        isAvailable: scheduleForm.isAvailable !== undefined ? scheduleForm.isAvailable : true,
        notes: scheduleForm.notes || ''
      };
      
      const currentSchedules = [...schedule, newScheduleItem];
      
      const response = await axios.post(`${API_BASE}/doctor/schedule`, {
        schedules: currentSchedules
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state with response from server
      if (response.data.schedule) {
        setSchedule(response.data.schedule);
        localStorage.setItem(`doctor_schedule_${doctor.id}`, JSON.stringify(response.data.schedule));
      }
      
      alert('Schedule saved successfully');
      setShowScheduleModal(false);
      setScheduleForm({ dayOfWeek: '', startTime: '', endTime: '', isAvailable: true, notes: '' });
    } catch (error) {
      console.error('API error:', error);
      alert('Failed to save schedule: ' + (error.response?.data?.error || 'Server error'));
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await axios.delete(`${API_BASE}/doctor/schedule/${scheduleId}`);
    } catch (error) {
      console.error('API error, deleting locally:', error);
    }

    const updatedSchedule = schedule.filter(slot => slot.id !== scheduleId);
    setSchedule(updatedSchedule);
    localStorage.setItem(`doctor_schedule_${doctor.id}`, JSON.stringify(updatedSchedule));
    alert('Schedule deleted successfully');
  };

  const emptyNotesForm = {
    chiefComplaint: '', pastIllnesses: '', ongoingConditions: '', allergies: '',
    currentMedications: '', physicalFindings: '',
    vitals: { bp: '', hr: '', temp: '', weight: '', spo2: '' },
    diagnosis: '', symptoms: '', treatment: '',
    prescriptions: [{ name: '', dosage: '', duration: '', instructions: '' }],
    advice: '', followUpDate: '', testsRequired: '', notes: '',
  };

  const parseNoteToForm = (note) => ({
    chiefComplaint: note.chiefComplaint || '',
    pastIllnesses: note.pastIllnesses || '',
    ongoingConditions: note.ongoingConditions || '',
    allergies: note.allergies || '',
    currentMedications: note.currentMedications || '',
    physicalFindings: note.physicalFindings || '',
    vitals: note.vitals ? (typeof note.vitals === 'string' ? JSON.parse(note.vitals) : note.vitals) : { bp: '', hr: '', temp: '', weight: '', spo2: '' },
    diagnosis: note.diagnosis || '',
    symptoms: note.symptoms || '',
    treatment: note.treatment || '',
    prescriptions: note.prescriptions
      ? (typeof note.prescriptions === 'string' ? JSON.parse(note.prescriptions) : note.prescriptions)
      : [{ name: '', dosage: '', duration: '', instructions: '' }],
    advice: note.advice || '',
    followUpDate: note.followUpDate ? note.followUpDate.split('T')[0] : '',
    testsRequired: note.testsRequired || '',
    notes: note.notes || '',
  });

  const handleOpenNotesModal = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowNotesModal(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/doctor/appointments/${appointment.id}/note`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.note) {
        setNotesForm(parseNoteToForm(response.data.note));
      } else {
        setNotesForm(emptyNotesForm);
      }
    } catch {
      setNotesForm(emptyNotesForm);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    if (!notesForm.diagnosis && !notesForm.chiefComplaint && !notesForm.symptoms) {
      alert('Please fill in at least Chief Complaint or Diagnosis before saving');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Save appointment note with all fields
      await axios.post(`${API_BASE}/doctor/appointments/${selectedAppointment.id}/note`,
        {
          ...notesForm,
          prescriptions: notesForm.prescriptions.filter(p => p.name.trim()),
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      // Create medical record
      await axios.post(`${API_BASE}/doctor/medical-records`, {
        patientId: selectedAppointment.patientId,
        appointmentId: selectedAppointment.id,
        recordType: 'Consultation',
        title: `Consultation - ${formatDate(selectedAppointment.appointmentDate)}`,
        ...notesForm,
        prescriptions: notesForm.prescriptions.filter(p => p.name.trim()),
        status: 'Completed',
        recordDate: selectedAppointment.appointmentDate,
      }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });

      // Mark appointment completed
      await axios.put(
        `${API_BASE}/doctor/appointments/${selectedAppointment.id}/status`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      alert('Consultation notes saved! Appointment marked as completed.');
      setShowNotesModal(false);
      if (doctor) fetchAppointments(doctor.id);
    } catch (error) {
      alert('Failed to save notes: ' + (error.response?.data?.error || 'Server error'));
    }
  };

  const handleAppointmentStatusChange = async (appointmentId, status) => {
    // If trying to mark as completed, check if notes exist
    if (status === 'completed') {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/doctor/appointments/${appointmentId}/note`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.data || !response.data.note) {
          alert('Please add consultation notes before marking the appointment as completed.');
          return;
        }
      } catch (error) {
        alert('Please add consultation notes before marking the appointment as completed.');
        return;
      }
    }

    if (!confirm(`Are you sure you want to change appointment status to ${status}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE}/doctor/appointments/${appointmentId}/status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      alert('Appointment status updated successfully');
      
      // Add notification
      addNotification({
        type: 'status_update',
        appointmentId,
        message: `Appointment status changed to ${status}`,
        timestamp: new Date().toISOString()
      });
      
      if (doctor) {
        fetchAppointments(doctor.id);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status: ' + (error.response?.data?.error || 'Server error'));
    }
  };

  const handleRescheduleAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleForm({
      newDate: appointment.appointmentDate || '',
      newTime: appointment.appointmentTime || ''
    });
    setShowRescheduleModal(true);
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleForm.newDate || !rescheduleForm.newTime) {
      alert('Please select both date and time');
      return;
    }

    try {
      // Try API first
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE}/doctor/appointments/${selectedAppointment.id}/status`,
        { 
          status: 'rescheduled',
          appointmentDate: rescheduleForm.newDate,
          appointmentTime: rescheduleForm.newTime
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('API error, saving locally:', error);
    }

    // Update locally
    const updatedAppointments = appointments.map(apt => {
      if (apt.id === selectedAppointment.id) {
        return {
          ...apt,
          appointmentDate: rescheduleForm.newDate,
          appointmentTime: rescheduleForm.newTime,
          status: 'rescheduled'
        };
      }
      return apt;
    });
    setAppointments(updatedAppointments);
    
    // Save to localStorage
    if (doctor) {
      localStorage.setItem(`doctor_appointments_${doctor.id}`, JSON.stringify(updatedAppointments));
      
      // Add notification
      addNotification({
        type: 'rescheduled',
        appointmentId: selectedAppointment.id,
        message: `Appointment rescheduled to ${rescheduleForm.newDate} at ${rescheduleForm.newTime}`,
        timestamp: new Date().toISOString()
      });
    }

    alert('Appointment rescheduled successfully');
    setShowRescheduleModal(false);
    if (doctor) {
      fetchAppointments(doctor.id);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await handleAppointmentStatusChange(appointmentId, 'cancelled');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleViewStatus = (appointment) => {
    setSelectedAppointment(appointment);
    setShowStatusModal(true);
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      read: false
    };
    const updatedNotifications = [newNotification, ...notifications].slice(0, 50); // Keep last 50
    setNotifications(updatedNotifications);
    if (doctor) {
      localStorage.setItem(`doctor_notifications_${doctor.id}`, JSON.stringify(updatedNotifications));
    }
  };

  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    if (doctor) {
      localStorage.setItem(`doctor_notifications_${doctor.id}`, JSON.stringify(updatedNotifications));
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Profile completion calculator
  const computeProfileCompletion = (form) => {
    const checks = [
      { label: 'Full Name',        done: !!form.fullName?.trim() },
      { label: 'Phone',            done: !!form.phone?.trim() },
      { label: 'City',             done: !!form.city?.trim() },
      { label: 'Specialization',   done: !!form.specialization?.trim() },
      { label: 'NMC No.',          done: !!form.nmcNo?.trim() },
      { label: 'Experience',       done: !!form.experience },
      { label: 'Consultation Fee', done: !!form.consultationFee },
      { label: 'Bio',              done: !!form.bio?.trim() },
      { label: 'Qualifications',   done: form.qualifications?.length > 0 },
      { label: 'Languages',        done: !!form.languages?.trim() },
    ];
    const done = checks.filter(c => c.done).length;
    return { checks, done, total: checks.length, percent: Math.round((done / checks.length) * 100) };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return 'N/A';
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      rescheduled: 'bg-purple-100 text-purple-700',
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredAppointments = appointments.filter(apt => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        apt.patient?.fullName?.toLowerCase().includes(searchLower) ||
        apt.patient?.email?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const upcomingAppointments = filteredAppointments.filter(apt => 
    ['pending', 'confirmed'].includes(apt.status)
  );

  const completedAppointments = filteredAppointments.filter(apt => 
    apt.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Doctor Header */}
        {doctor && (
          <Card className="mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Welcome, Dr. {doctor.fullName}</h1>
                    <p className="text-cyan-100">{doctor.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-cyan-100">Today's Appointments</p>
                  <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Completion & Verification Status Card */}
        {profileData && (() => {
          const { checks, done, total, percent } = computeProfileCompletion(profileForm);
          const status = profileData.profile?.verificationStatus || 'unsubmitted';
          const canRequest = percent === 100 && ['unsubmitted', 'rejected'].includes(status);
          const barColor = percent === 100 ? 'bg-green-500' : percent >= 60 ? 'bg-yellow-400' : 'bg-red-400';

          return (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Completion */}
              <Card className="border-2 border-cyan-100">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-[#344256]">Profile Completion</p>
                      <p className="text-xs text-gray-500">{done} of {total} fields filled</p>
                    </div>
                    <span className={`text-2xl font-bold ${percent === 100 ? 'text-green-600' : percent >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {percent}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                    <div className={`h-2.5 rounded-full transition-all ${barColor}`} style={{ width: `${percent}%` }} />
                  </div>
                  {/* Missing fields */}
                  {percent < 100 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {checks.filter(c => !c.done).map(c => (
                        <span key={c.label} className="text-xs bg-red-50 text-red-600 border border-red-200 rounded px-2 py-0.5">
                          {c.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {percent === 100 && (
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3 h-3" /> Profile is complete
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 text-cyan-600 border-cyan-300 hover:bg-cyan-50 w-full"
                    onClick={() => setActiveTab('profile')}
                  >
                    {percent < 100 ? 'Complete Profile' : 'Edit Profile'} <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card className={`border-2 ${
                status === 'approved' ? 'border-green-200 bg-green-50' :
                status === 'pending'  ? 'border-yellow-200 bg-yellow-50' :
                status === 'rejected' ? 'border-red-200 bg-red-50' :
                'border-gray-200'
              }`}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#344256]">Verification Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {status === 'approved' && <><ShieldCheck className="w-5 h-5 text-green-600" /><span className="text-green-700 font-semibold">Approved</span></>}
                        {status === 'pending'  && <><ShieldAlert className="w-5 h-5 text-yellow-600" /><span className="text-yellow-700 font-semibold">Pending Review</span></>}
                        {status === 'rejected' && <><ShieldOff className="w-5 h-5 text-red-600" /><span className="text-red-700 font-semibold">Rejected</span></>}
                        {status === 'unsubmitted' && <><AlertCircle className="w-5 h-5 text-gray-500" /><span className="text-gray-600 font-semibold">Not Submitted</span></>}
                      </div>
                    </div>
                  </div>

                  {status === 'approved' && (
                    <p className="text-xs text-green-700 mt-1">Your profile has been verified by admin. Patients can book appointments with you.</p>
                  )}
                  {status === 'pending' && (
                    <p className="text-xs text-yellow-700 mt-1">Your verification request is under review. Admin will respond shortly.</p>
                  )}
                  {status === 'rejected' && profileData.profile?.rejectionReason && (
                    <p className="text-xs text-red-700 mt-1">Reason: {profileData.profile.rejectionReason}</p>
                  )}
                  {status === 'unsubmitted' && (
                    <p className="text-xs text-gray-600 mt-1">Complete your profile and request verification to start accepting patients.</p>
                  )}

                  {['unsubmitted', 'rejected'].includes(status) && (
                    <div className="mt-3">
                      {percent < 100 && (
                        <p className="text-xs text-red-500 mb-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Complete your profile to {percent}% → 100% first
                        </p>
                      )}
                      <Button
                        onClick={handleSubmitVerification}
                        disabled={!canRequest}
                        size="sm"
                        className={`w-full ${canRequest ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-300 cursor-not-allowed'}`}
                      >
                        <BadgeCheck className="w-4 h-4 mr-2" />
                        {status === 'rejected' ? 'Re-submit Verification' : 'Request Verification'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })()}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'appointments'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-gray-600 hover:text-cyan-600'
            }`}
          >
            <Calendar className="inline-block w-5 h-5 mr-2" />
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'schedule'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-gray-600 hover:text-cyan-600'
            }`}
          >
            <Settings className="inline-block w-5 h-5 mr-2" />
            Manage Schedule
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'notes'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-gray-600 hover:text-cyan-600'
            }`}
          >
            <FileText className="inline-block w-5 h-5 mr-2" />
            Consultation Notes
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-gray-600 hover:text-cyan-600'
            }`}
          >
            <BadgeCheck className="inline-block w-5 h-5 mr-2" />
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'earnings'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-gray-600 hover:text-cyan-600'
            }`}
          >
            <DollarSign className="inline-block w-5 h-5 mr-2" />
            Earnings
          </button>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl text-[#344256]">My Appointments</CardTitle>
                  <CardDescription>Manage your patient appointments</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => setShowNotificationsModal(true)} 
                    variant="outline" 
                    size="sm"
                    className="relative"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </Button>
                  <Button onClick={() => doctor && fetchAppointments(doctor.id)} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search by patient name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading appointments...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No appointments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <User className="w-5 h-5 text-cyan-600" />
                                <div>
                                  <p className="text-sm text-gray-500">Patient</p>
                                  <p className="font-semibold text-[#344256]">
                                    {appointment.patient?.fullName || 'N/A'}
                                  </p>
                                  <p className="text-sm text-gray-600">{appointment.patient?.email}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <Calendar className="w-5 h-5 text-cyan-600" />
                                <div>
                                  <p className="text-sm text-gray-500">Date & Time</p>
                                  <p className="font-semibold text-[#344256]">
                                    {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-2">Status</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                                {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                              </span>
                            </div>
                          </div>
                          {appointment.reason && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-500 mb-1">Reason for Visit</p>
                              <p className="text-sm text-gray-700">{appointment.reason}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            onClick={() => handleViewStatus(appointment)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Status
                          </Button>
                          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                            <Button
                              onClick={() => handleRescheduleAppointment(appointment)}
                              variant="outline"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <CalendarDays className="w-4 h-4 mr-1" />
                              Reschedule
                            </Button>
                          )}
                          {appointment.status !== 'cancelled' && (
                            <Button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                          <Button
                            onClick={() => handleOpenNotesModal(appointment)}
                            variant="outline"
                            size="sm"
                            className="text-cyan-600 hover:text-cyan-700"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Notes
                          </Button>
                          {appointment.status === 'pending' && (
                            <Button
                              onClick={() => handleAppointmentStatusChange(appointment.id, 'confirmed')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              onClick={() => handleAppointmentStatusChange(appointment.id, 'completed')}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Completed
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schedule Management Tab */}
        {activeTab === 'schedule' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl text-[#344256]">Manage Schedule</CardTitle>
                  <CardDescription>Set your weekly availability</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => setShowScheduleModal(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Schedule
                  </Button>
                  <Button onClick={() => doctor && fetchSchedule(doctor.id)} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading schedule...</div>
              ) : schedule.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No schedule set. Click "Add Schedule" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedule.map((slot) => (
                    <div
                      key={slot.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-semibold text-[#344256]">{slot.dayOfWeek}</p>
                              <p className="text-sm text-gray-600">
                                {slot.startTime} - {slot.endTime}
                              </p>
                              {slot.notes && (
                                <p className="text-sm text-gray-500 mt-1">{slot.notes}</p>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              slot.isAvailable !== false 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {slot.isAvailable !== false ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteSchedule(slot.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Consultation Notes Tab */}
        {activeTab === 'notes' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl text-[#344256]">Consultation Notes</CardTitle>
                  <CardDescription>View and manage patient consultation notes</CardDescription>
                </div>
                <Button onClick={() => doctor && fetchAppointments(doctor.id)} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No appointments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => {
                    const savedNotes = localStorage.getItem(`appointment_notes_${appointment.id}`);
                    const hasNotes = savedNotes !== null;
                    
                    return (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-[#344256]">
                              {appointment.patient?.fullName || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                            </p>
                            {hasNotes && (
                              <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Notes Added
                              </span>
                            )}
                          </div>
                          <Button
                            onClick={() => handleOpenNotesModal(appointment)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {hasNotes ? 'Edit Notes' : 'Add Notes'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Verification Status Banner */}
            {profileData?.profile && (
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                profileData.profile.verificationStatus === 'approved' ? 'bg-green-50 border-green-200' :
                profileData.profile.verificationStatus === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                profileData.profile.verificationStatus === 'rejected' ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  {profileData.profile.verificationStatus === 'approved' && <BadgeCheck className="w-6 h-6 text-green-600" />}
                  {profileData.profile.verificationStatus === 'pending' && <Clock className="w-6 h-6 text-yellow-600" />}
                  {profileData.profile.verificationStatus === 'rejected' && <AlertCircle className="w-6 h-6 text-red-600" />}
                  {profileData.profile.verificationStatus === 'unsubmitted' && <AlertCircle className="w-6 h-6 text-gray-500" />}
                  <div>
                    <p className={`font-semibold ${
                      profileData.profile.verificationStatus === 'approved' ? 'text-green-800' :
                      profileData.profile.verificationStatus === 'pending' ? 'text-yellow-800' :
                      profileData.profile.verificationStatus === 'rejected' ? 'text-red-800' : 'text-gray-700'
                    }`}>
                      {profileData.profile.verificationStatus === 'approved' && 'Profile Verified'}
                      {profileData.profile.verificationStatus === 'pending' && 'Verification Pending Review'}
                      {profileData.profile.verificationStatus === 'rejected' && 'Verification Rejected'}
                      {profileData.profile.verificationStatus === 'unsubmitted' && 'Profile Not Yet Submitted for Verification'}
                    </p>
                    {profileData.profile.rejectionReason && (
                      <p className="text-sm text-red-700 mt-1">Reason: {profileData.profile.rejectionReason}</p>
                    )}
                  </div>
                </div>
                {['unsubmitted', 'rejected'].includes(profileData.profile.verificationStatus) && (
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs text-gray-500">Use the dashboard card to request verification</p>
                  </div>
                )}
              </div>
            )}

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-cyan-600" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input className="mt-1" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input className="mt-1" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input className="mt-1" value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input className="mt-1" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} />
                </div>
                <div>
                  <Label>Primary Specialization</Label>
                  <Input className="mt-1" value={profileForm.specialization} onChange={e => setProfileForm({...profileForm, specialization: e.target.value})} />
                </div>
                <div>
                  <Label>NMC No. (License Number) <span className="text-red-500">*</span></Label>
                  <Input
                    className={`mt-1 ${!profileForm.nmcNo ? 'border-red-300 focus:ring-red-400' : ''}`}
                    placeholder="e.g. NMC-12345 (required for verification)"
                    value={profileForm.nmcNo}
                    onChange={e => setProfileForm({...profileForm, nmcNo: e.target.value})}
                  />
                  {!profileForm.nmcNo && (
                    <p className="text-xs text-red-500 mt-1">Required to submit for verification</p>
                  )}
                </div>
                <div>
                  <Label>Years of Experience</Label>
                  <Input className="mt-1" type="number" min="0" value={profileForm.experience} onChange={e => setProfileForm({...profileForm, experience: e.target.value})} />
                </div>
                <div>
                  <Label>Consultation Fee (NPR)</Label>
                  <Input className="mt-1" type="number" min="0" value={profileForm.consultationFee} onChange={e => setProfileForm({...profileForm, consultationFee: e.target.value})} />
                </div>
                <div>
                  <Label>Languages Spoken</Label>
                  <Input className="mt-1" placeholder="e.g. Nepali, English" value={profileForm.languages} onChange={e => setProfileForm({...profileForm, languages: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <Label>Bio / About</Label>
                  <textarea className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[80px]"
                    placeholder="Brief description about yourself..."
                    value={profileForm.bio}
                    onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-cyan-600" />
                  <span>Qualifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileForm.qualifications.map((q, i) => (
                  <div key={i} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <div>
                      <p className="font-semibold text-[#344256]">{q.degree}</p>
                      <p className="text-sm text-gray-600">{q.institution} {q.year && `• ${q.year}`}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500"
                      onClick={() => setProfileForm({...profileForm, qualifications: profileForm.qualifications.filter((_, idx) => idx !== i)})}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
                  <Input placeholder="Degree (e.g. MBBS)" value={newQual.degree} onChange={e => setNewQual({...newQual, degree: e.target.value})} />
                  <Input placeholder="Institution" value={newQual.institution} onChange={e => setNewQual({...newQual, institution: e.target.value})} />
                  <Input placeholder="Year" value={newQual.year} onChange={e => setNewQual({...newQual, year: e.target.value})} />
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  if (!newQual.degree) return;
                  setProfileForm({...profileForm, qualifications: [...profileForm.qualifications, newQual]});
                  setNewQual({ degree: '', institution: '', year: '' });
                }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Qualification
                </Button>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-cyan-600" />
                  <span>Certificates & Credentials</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileForm.certificates.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                    <div>
                      <p className="font-semibold text-[#344256]">{c.name}</p>
                      <p className="text-sm text-gray-600">{c.issuedBy} {c.year && `• ${c.year}`}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500"
                      onClick={() => setProfileForm({...profileForm, certificates: profileForm.certificates.filter((_, idx) => idx !== i)})}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
                  <Input placeholder="Certificate name" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} />
                  <Input placeholder="Issued by" value={newCert.issuedBy} onChange={e => setNewCert({...newCert, issuedBy: e.target.value})} />
                  <Input placeholder="Year" value={newCert.year} onChange={e => setNewCert({...newCert, year: e.target.value})} />
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  if (!newCert.name) return;
                  setProfileForm({...profileForm, certificates: [...profileForm.certificates, newCert]});
                  setNewCert({ name: '', issuedBy: '', year: '' });
                }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Certificate
                </Button>
              </CardContent>
            </Card>

            {/* Additional Specializations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-cyan-600" />
                  <span>Additional Specializations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profileForm.specializations.map((s, i) => (
                    <span key={i} className="flex items-center space-x-1 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                      <span>{s}</span>
                      <button onClick={() => setProfileForm({...profileForm, specializations: profileForm.specializations.filter((_, idx) => idx !== i)})}
                        className="ml-1 text-cyan-600 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Input placeholder="e.g. Pediatric Cardiology" value={newSpec} onChange={e => setNewSpec(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newSpec.trim()) {
                        setProfileForm({...profileForm, specializations: [...profileForm.specializations, newSpec.trim()]});
                        setNewSpec('');
                      }
                    }}
                  />
                  <Button variant="outline" onClick={() => {
                    if (!newSpec.trim()) return;
                    setProfileForm({...profileForm, specializations: [...profileForm.specializations, newSpec.trim()]});
                    setNewSpec('');
                  }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button onClick={handleSaveProfile} disabled={profileSaving} className="bg-cyan-600 hover:bg-cyan-700 px-8">
                {profileSaving ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Profile</>}
              </Button>
              {profileData?.profile && ['unsubmitted', 'rejected'].includes(profileData.profile.verificationStatus) && (
                <Button onClick={handleSubmitVerification} variant="outline" className="border-cyan-600 text-cyan-700 px-8" disabled={!profileForm.nmcNo}>
                  <BadgeCheck className="w-4 h-4 mr-2" />
                  Submit for Verification
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                    <p className="text-3xl font-bold text-cyan-600">{appointments.length}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-cyan-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {appointments.filter(apt => apt.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{completedAppointments.length}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-green-100">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Earnings</p>
                      <p className="text-3xl font-bold text-green-600">
                        NPR {earnings ? earnings.totalEarnings.toLocaleString() : '—'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-cyan-100">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Paid Appointments</p>
                      <p className="text-3xl font-bold text-cyan-600">
                        {earnings ? earnings.totalPaidAppointments : '—'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-100">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Avg. Per Appointment</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {earnings && earnings.totalPaidAppointments > 0
                          ? `NPR ${Math.round(earnings.totalEarnings / earnings.totalPaidAppointments).toLocaleString()}`
                          : '—'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Breakdown */}
            {earnings?.byMonth && Object.keys(earnings.byMonth).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                    Monthly Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(earnings.byMonth).map(([month, amount]) => {
                      const max = Math.max(...Object.values(earnings.byMonth));
                      const pct = Math.round((amount / max) * 100);
                      return (
                        <div key={month} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-24 shrink-0">{month}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-3">
                            <div className="bg-cyan-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-28 text-right">
                            NPR {amount.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment History Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-cyan-600" />
                    Payment History
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchEarnings}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!earnings ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : earnings.payments.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No payments received yet.</p>
                    <p className="text-sm mt-1">Payments will appear here once patients pay for confirmed appointments.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left">
                          <th className="py-3 px-3 font-semibold text-gray-600">Patient</th>
                          <th className="py-3 px-3 font-semibold text-gray-600">Appointment</th>
                          <th className="py-3 px-3 font-semibold text-gray-600">eSewa Ref</th>
                          <th className="py-3 px-3 font-semibold text-gray-600">Paid On</th>
                          <th className="py-3 px-3 font-semibold text-gray-600 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {earnings.payments.map(p => (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-3">
                              <p className="font-medium text-[#344256]">{p.patientName}</p>
                              <p className="text-xs text-gray-400">{p.patientEmail}</p>
                            </td>
                            <td className="py-3 px-3 text-gray-600">
                              {p.appointmentDate} {p.appointmentTime && `at ${p.appointmentTime}`}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                                {p.esewaRefId || '—'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-500 text-xs">
                              {new Date(p.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="font-bold text-green-600">NPR {p.amount.toLocaleString()}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-200">
                          <td colSpan={4} className="py-3 px-3 font-semibold text-gray-700">Total</td>
                          <td className="py-3 px-3 text-right font-bold text-green-700 text-base">
                            NPR {earnings.totalEarnings.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Schedule</CardTitle>
              <CardDescription>Set your availability for a specific day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Day of Week</Label>
                <select
                  value={scheduleForm.dayOfWeek}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select day</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="mt-1"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveSchedule} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={() => setShowScheduleModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reschedule Appointment</CardTitle>
              <CardDescription>
                Patient: {selectedAppointment.patient?.fullName || 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Date & Time</Label>
                <p className="mt-1 text-gray-700">
                  {formatDateTime(selectedAppointment.appointmentDate, selectedAppointment.appointmentTime)}
                </p>
              </div>
              <div>
                <Label>New Date</Label>
                <Input
                  type="date"
                  value={rescheduleForm.newDate}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })}
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label>New Time</Label>
                <Input
                  type="time"
                  value={rescheduleForm.newTime}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newTime: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveReschedule} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
                <Button onClick={() => setShowRescheduleModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Status Modal */}
      {showStatusModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Appointment Status</CardTitle>
              <CardDescription>
                Patient: {selectedAppointment.patient?.fullName || 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Status</Label>
                <div className="mt-2">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedAppointment.status)}`}>
                    {selectedAppointment.status?.charAt(0).toUpperCase() + selectedAppointment.status?.slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <Label>Appointment Date & Time</Label>
                <p className="mt-1 text-gray-700">
                  {formatDateTime(selectedAppointment.appointmentDate, selectedAppointment.appointmentTime)}
                </p>
              </div>
              <div>
                <Label>Patient Information</Label>
                <div className="mt-1 space-y-1">
                  <p className="text-gray-700">Name: {selectedAppointment.patient?.fullName || 'N/A'}</p>
                  <p className="text-gray-700">Email: {selectedAppointment.patient?.email || 'N/A'}</p>
                </div>
              </div>
              {selectedAppointment.reason && (
                <div>
                  <Label>Reason for Visit</Label>
                  <p className="mt-1 text-gray-700">{selectedAppointment.reason}</p>
                </div>
              )}
              <div>
                <Label>Status History</Label>
                <div className="mt-1 text-sm text-gray-600">
                  <p>Created: {formatDate(selectedAppointment.createdAt)}</p>
                  {selectedAppointment.updatedAt && selectedAppointment.updatedAt !== selectedAppointment.createdAt && (
                    <p>Last Updated: {formatDate(selectedAppointment.updatedAt)}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowStatusModal(false)} variant="outline">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Track all appointment-related notifications</CardDescription>
                </div>
                <Button onClick={() => setShowNotificationsModal(false)} variant="outline" size="sm">
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`font-medium ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                            {notification.message}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDateTime(notification.timestamp?.split('T')[0], notification.timestamp?.split('T')[1]?.substring(0, 5))}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Consultation Notes Modal */}
      {showNotesModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <CardHeader className="border-b bg-gradient-to-r from-cyan-50 to-blue-50 sticky top-0 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-[#344256]">
                    {selectedAppointment.status === 'completed' ? '📋 Consultation Notes (Read-Only)' : '📋 Consultation Notes'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Patient: <span className="font-semibold">{selectedAppointment.patient?.fullName}</span>
                    &nbsp;•&nbsp;{formatDate(selectedAppointment.appointmentDate)} at {selectedAppointment.appointmentTime}
                    {selectedAppointment.status === 'completed' && (
                      <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Completed</span>
                    )}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowNotesModal(false)} variant="ghost" size="sm"><X className="w-5 h-5" /></Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-5">
              {(() => {
                const ro = selectedAppointment.status === 'completed';
                const ta = (field, placeholder, rows = 2) => (
                  <textarea
                    value={notesForm[field]}
                    onChange={e => setNotesForm({ ...notesForm, [field]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none bg-white disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder={ro ? '—' : placeholder}
                    rows={rows}
                    disabled={ro}
                  />
                );

                return (
                  <>
                    {/* 1. Chief Complaint */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Chief Complaint
                      </h3>
                      {ta('chiefComplaint', 'Main reason for visit / symptoms described by patient', 2)}
                    </div>

                    {/* 2. Medical History */}
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
                      <h3 className="font-semibold text-orange-800 mb-1 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Medical History
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><Label className="text-xs text-gray-600">Past Illnesses</Label>{ta('pastIllnesses', 'e.g. Diabetes, Hypertension')}</div>
                        <div><Label className="text-xs text-gray-600">Ongoing Conditions</Label>{ta('ongoingConditions', 'Current chronic conditions')}</div>
                        <div><Label className="text-xs text-gray-600">Allergies</Label>{ta('allergies', 'Drug / food allergies')}</div>
                        <div><Label className="text-xs text-gray-600">Current Medications</Label>{ta('currentMedications', 'Medicines patient is taking')}</div>
                      </div>
                    </div>

                    {/* 3. Doctor's Observations */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                      <h3 className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" /> Doctor's Observations
                      </h3>
                      <div><Label className="text-xs text-gray-600">Physical Findings</Label>{ta('physicalFindings', 'Examination findings', 2)}</div>
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">Vitals</Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {[['bp','Blood Pressure','120/80'],['hr','Heart Rate','72 bpm'],['temp','Temperature','98.6°F'],['weight','Weight','kg'],['spo2','SpO2','%']].map(([k, label, ph]) => (
                            <div key={k}>
                              <p className="text-xs text-gray-500 mb-1">{label}</p>
                              <Input
                                value={notesForm.vitals[k]}
                                onChange={e => setNotesForm({ ...notesForm, vitals: { ...notesForm.vitals, [k]: e.target.value } })}
                                placeholder={ph}
                                className="text-sm"
                                disabled={ro}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 4. Diagnosis */}
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-3">
                      <h3 className="font-semibold text-purple-800 mb-1 flex items-center gap-2">
                        <Search className="w-4 h-4" /> Diagnosis
                      </h3>
                      <div><Label className="text-xs text-gray-600">Identified Condition(s)</Label>{ta('diagnosis', 'Preliminary or confirmed diagnosis', 2)}</div>
                      <div><Label className="text-xs text-gray-600">Symptoms</Label>{ta('symptoms', 'Observed symptoms', 2)}</div>
                    </div>

                    {/* 5. Treatment */}
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Treatment Plan
                      </h3>
                      {ta('treatment', 'Treatment details, procedures performed', 2)}
                    </div>

                    {/* 6. Prescriptions */}
                    <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
                      <h3 className="font-semibold text-cyan-800 mb-3 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Prescriptions
                      </h3>
                      <div className="space-y-2">
                        {notesForm.prescriptions.map((p, i) => (
                          <div key={i} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border">
                            <div className="col-span-3"><Input value={p.name} onChange={e => { const arr = [...notesForm.prescriptions]; arr[i].name = e.target.value; setNotesForm({...notesForm, prescriptions: arr}); }} placeholder="Medicine name" className="text-sm" disabled={ro} /></div>
                            <div className="col-span-2"><Input value={p.dosage} onChange={e => { const arr = [...notesForm.prescriptions]; arr[i].dosage = e.target.value; setNotesForm({...notesForm, prescriptions: arr}); }} placeholder="Dosage" className="text-sm" disabled={ro} /></div>
                            <div className="col-span-2"><Input value={p.duration} onChange={e => { const arr = [...notesForm.prescriptions]; arr[i].duration = e.target.value; setNotesForm({...notesForm, prescriptions: arr}); }} placeholder="Duration" className="text-sm" disabled={ro} /></div>
                            <div className="col-span-4"><Input value={p.instructions} onChange={e => { const arr = [...notesForm.prescriptions]; arr[i].instructions = e.target.value; setNotesForm({...notesForm, prescriptions: arr}); }} placeholder="Instructions" className="text-sm" disabled={ro} /></div>
                            {!ro && (
                              <div className="col-span-1 flex justify-center">
                                <button onClick={() => setNotesForm({...notesForm, prescriptions: notesForm.prescriptions.filter((_,idx) => idx !== i)})} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            )}
                          </div>
                        ))}
                        {!ro && (
                          <Button variant="outline" size="sm" onClick={() => setNotesForm({...notesForm, prescriptions: [...notesForm.prescriptions, { name: '', dosage: '', duration: '', instructions: '' }]})}>
                            <Plus className="w-4 h-4 mr-1" /> Add Medicine
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 7. Advice & Follow-up */}
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 space-y-3">
                      <h3 className="font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" /> Advice & Follow-up
                      </h3>
                      <div><Label className="text-xs text-gray-600">Advice & Recommendations</Label>{ta('advice', 'Lifestyle, diet, precautions', 2)}</div>
                      <div><Label className="text-xs text-gray-600">Tests / Reports Required</Label>{ta('testsRequired', 'e.g. CBC, X-Ray, MRI')}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Follow-up Date</Label>
                          <Input type="date" value={notesForm.followUpDate} onChange={e => setNotesForm({...notesForm, followUpDate: e.target.value})} className="mt-1" disabled={ro} />
                        </div>
                      </div>
                    </div>

                    {/* 8. Additional Notes */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Additional Notes
                      </h3>
                      {ta('notes', 'Any other observations or notes', 3)}
                    </div>

                    {ro && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-800">This appointment is completed. Notes are locked and visible to the patient in their medical records.</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      {!ro ? (
                        <>
                          <Button onClick={handleSaveNotes} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                            <Save className="w-4 h-4 mr-2" /> Save & Complete Appointment
                          </Button>
                          <Button onClick={() => setShowNotesModal(false)} variant="outline" className="flex-1">Cancel</Button>
                        </>
                      ) : (
                        <Button onClick={() => setShowNotesModal(false)} variant="outline" className="w-full">Close</Button>
                      )}
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
