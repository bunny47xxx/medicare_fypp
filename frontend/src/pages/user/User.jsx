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
  User as UserIcon, 
  FileText, 
  Search, 
  Heart, 
  Video, 
  X, 
  CheckCircle, 
  Stethoscope, 
  Check,
  Loader2,
  AlertCircle,
  Activity,
  Pill,
  ClipboardList,
  Bell,
} from 'lucide-react';
import axios from 'axios';
import { generateConsultationPdf } from '@/utils/generateConsultationPdf';
import { toast } from 'react-toastify';

export default function User() {
  const [user, setUser] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  
  // Booking states
  const [bookingStep, setBookingStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [consultationType, setConsultationType] = useState('online');
  const [doctorSchedule, setDoctorSchedule] = useState([]);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        loadAppointments();
        loadTotalRecords();
        loadNotifications();
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Listen for booking event from FindDoctor page
    const handleOpenBooking = (event) => {
      if (event.detail?.doctor) {
        handleSelectDoctor(event.detail.doctor);
        setShowBookingModal(true);
      }
    };
    window.addEventListener('openBooking', handleOpenBooking);

    // Poll notifications every 15s to catch incoming call notifications
    const pollInterval = setInterval(loadNotifications, 15000);

    return () => {
      window.removeEventListener('openBooking', handleOpenBooking);
      clearInterval(pollInterval);
    };
  }, []);

  const loadTotalRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/patient/medical-records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTotalRecords(response.data.records?.length || 0);
    } catch (error) {
      console.error('Error loading total records:', error);
      setTotalRecords(0);
    }
  };

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/patient/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/patient/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  };

  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/patient/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedSpecialtyFilter) params.append('specialization', selectedSpecialtyFilter);

      const response = await axios.get(`${API_BASE}/patient/doctors?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };


  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleStartBooking = () => {
    setShowBookingModal(true);
    setBookingStep(1);
    setSearchQuery('');
    setSelectedSpecialtyFilter('');
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setBookingReason('');
    setConsultationType('online');
    loadDoctors();
  };

  const handleSelectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    await loadDoctorSchedule(doctor.id);
    setBookingStep(2);
  };

  const loadDoctorSchedule = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/patient/doctors/${doctorId}/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctorSchedule(response.data.doctor?.schedule || []);
    } catch (error) {
      console.error('Error loading schedule:', error);
      setDoctorSchedule([]);
    }
  };

  const handleSelectSlot = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setBookingStep(3);
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingReason.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!user.emailVerified) {
      alert('Please verify your email before booking appointments. Check your email for the verification code.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // 1. Create appointment
      const bookRes = await axios.post(`${API_BASE}/patient/appointments`, {
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: bookingReason,
        consultationType,
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success('Appointment booked! You will be able to pay once the doctor confirms your appointment.');
      setShowBookingModal(false);
      loadAppointments();

      // Reset booking state
      setBookingStep(1);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setBookingReason('');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchQuery || 
      doctor.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialtyFilter ||
      doctor.specialization?.toLowerCase() === selectedSpecialtyFilter.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });

  // Generate available time slots based on doctor schedule
  const getAvailableSlots = () => {
    if (!selectedDate || doctorSchedule.length === 0) return [];

    const date = new Date(selectedDate);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const daySchedule = doctorSchedule.filter(s => s.dayOfWeek === dayOfWeek && s.isAvailable);
    
    const slots = [];
    daySchedule.forEach(schedule => {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour + 1 < endHour || (hour + 1 === endHour && endMin > 0)) {
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
    });
    
    return slots;
  };

  const availableSlots = getAvailableSlots();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rescheduled': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const specialties = [...new Set(doctors.map(d => d.specialization).filter(Boolean))].sort();

  // Get upcoming appointments (not cancelled, completed, or rescheduled-with-notes)
  const upcomingAppointments = appointments.filter(apt => 
    apt.status !== 'cancelled' && apt.status !== 'completed' &&
    !(apt.status === 'rescheduled' && apt.note)
  ).slice(0, 3);


  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        {user && (
          <Card className="mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user.fullName}!</h1>
                  <p className="text-cyan-100">Manage your health and appointments</p>
                  {!user.emailVerified && (
                    <div className="mt-3 bg-yellow-500/20 border border-yellow-300 rounded-lg p-3 flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-100 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-100">Email Not Verified</p>
                        <p className="text-sm text-yellow-100">Please verify your email to book appointments</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-3">
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowNotifPanel(v => !v); if (!showNotifPanel) loadNotifications(); }}
                      className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors relative"
                    >
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="bg-white/20 rounded-full p-4">
                    <Heart className="w-12 h-12" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button
                    onClick={handleStartBooking}
                    className="flex flex-col items-center justify-center h-24 bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    <Calendar className="w-6 h-6 mb-2" />
                    <span className="text-sm">Book Appointment</span>
                  </Button>
                  <Button
                    onClick={() => handleNavigation('/find-doctor')}
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50"
                  >
                    <Search className="w-6 h-6 mb-2" />
                    <span className="text-sm">Find Doctor</span>
                  </Button>
                  <Button
                    onClick={() => handleNavigation('/records')}
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50"
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    <span className="text-sm">View Records</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled consultations</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadAppointments}
                  >
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <div className="text-center py-8">
                    <Loader2 className="inline-block animate-spin h-6 w-6 text-cyan-600" />
                    <p className="mt-2 text-gray-600">Loading appointments...</p>
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">No upcoming appointments</p>
                    <Button onClick={handleStartBooking} className="bg-cyan-600 hover:bg-cyan-700">
                      Book Your First Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-cyan-100 rounded-full p-3">
                              <Calendar className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#344256]">
                                {appointment.doctor?.fullName || 'Doctor'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {appointment.doctor?.specialization || 'Specialist'}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        {/* Pay Now button — after doctor confirms or reschedules */}
                        {['confirmed', 'rescheduled'].includes(appointment.status) && appointment.paymentStatus !== 'paid' && (
                          <div className="mt-2 ml-16">
                            <button
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const res = await axios.post(`${API_BASE}/payment/initiate`, { appointmentId: appointment.id }, {
                                    headers: { Authorization: `Bearer ${token}` },
                                  });
                                  setPaymentData(res.data);
                                  setShowPaymentModal(true);
                                } catch (e) {
                                  alert(e.response?.data?.error || 'Failed to initiate payment');
                                }
                              }}
                            >
                              💳 Pay Now
                            </button>
                          </div>
                        )}
                        {/* Video call — only show when paid and no notes yet (consultation not done) */}
                        {['confirmed', 'rescheduled'].includes(appointment.status) && appointment.paymentStatus === 'paid' && !appointment.note && (() => {
                          const callNotif = notifications.find(
                            n => n.type === 'video_call' && n.appointmentId === appointment.id && !n.isRead
                          );
                          return (
                            <div className="mt-2 ml-16 flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2">
                              <span className="text-lg">🎥</span>
                              <div>
                                <p className="text-xs font-semibold text-cyan-800">Online Video Consultation</p>
                                <p className="text-xs text-cyan-600">
                                  {callNotif ? 'Doctor is calling you!' : 'Coming soon — your doctor will contact you'}
                                </p>
                              </div>
                              {callNotif && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem('token');
                                      await axios.put(`${API_BASE}/patient/notifications/${callNotif.id}/read`, {}, {
                                        headers: { Authorization: `Bearer ${token}` },
                                      });
                                      setNotifications(prev => prev.map(x => x.id === callNotif.id ? { ...x, isRead: true } : x));
                                      setUnreadCount(prev => Math.max(0, prev - 1));
                                    } catch (e) { /* non-blocking */ }
                                    window.location.href = `/video-call?channel=apt_${appointment.id}&role=Patient`;
                                  }}
                                  className="ml-auto text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors animate-pulse"
                                >
                                  Join Call
                                </button>
                              )}
                            </div>
                          );
                        })()}
                        {appointment.status === 'completed' && appointment.note && (
                          <div className="mt-2 ml-16">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-cyan-600 border-cyan-300 hover:bg-cyan-50 text-xs"
                              onClick={() => {
                                const note = appointment.note;
                                setSelectedNote({
                                  ...note,
                                  vitals: note.vitals ? (typeof note.vitals === 'string' ? JSON.parse(note.vitals) : note.vitals) : null,
                                  prescriptions: note.prescriptions ? (typeof note.prescriptions === 'string' ? JSON.parse(note.prescriptions) : note.prescriptions) : [],
                                  doctorName: appointment.doctor?.fullName,
                                  appointmentDate: appointment.appointmentDate,
                                });
                                setShowNotesModal(true);
                              }}
                            >
                              <ClipboardList className="w-3 h-3 mr-1" />
                              View Consultation Notes
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Health Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total Appointments</p>
                    <p className="text-2xl font-bold text-cyan-600">{appointments.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-cyan-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {appointments.filter(a => a.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Medical Records</p>
                    <p className="text-2xl font-bold text-purple-600">{totalRecords}</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>


      {/* Book Appointment Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Book Appointment</CardTitle>
                  <CardDescription>
                    {bookingStep === 1 && 'Step 1: Search and select a doctor'}
                    {bookingStep === 2 && 'Step 2: Select date and time'}
                    {bookingStep === 3 && 'Step 3: Confirm your booking'}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowBookingModal(false)} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center space-x-4 mt-4">
                <div className={`flex items-center ${bookingStep >= 1 ? 'text-cyan-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 1 ? 'bg-cyan-600 text-white' : 'bg-gray-200'}`}>
                    {bookingStep > 1 ? <Check className="w-5 h-5" /> : '1'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Select Doctor</span>
                </div>
                <div className={`w-12 h-0.5 ${bookingStep >= 2 ? 'bg-cyan-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${bookingStep >= 2 ? 'text-cyan-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 2 ? 'bg-cyan-600 text-white' : 'bg-gray-200'}`}>
                    {bookingStep > 2 ? <Check className="w-5 h-5" /> : '2'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Select Time</span>
                </div>
                <div className={`w-12 h-0.5 ${bookingStep >= 3 ? 'bg-cyan-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${bookingStep >= 3 ? 'text-cyan-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep >= 3 ? 'bg-cyan-600 text-white' : 'bg-gray-200'}`}>
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">Confirm</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="mt-6">
              {/* Step 1: Search Doctor */}
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by doctor name, specialty, or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <select
                      value={selectedSpecialtyFilter}
                      onChange={(e) => setSelectedSpecialtyFilter(e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">All Specialties</option>
                      {specialties.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="inline-block animate-spin h-6 w-6 text-cyan-600" />
                      <p className="mt-2 text-gray-600">Loading doctors...</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredDoctors.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No doctors found</p>
                        </div>
                      ) : (
                        filteredDoctors.map((doctor) => (
                          <div
                            key={doctor.id}
                            onClick={() => handleSelectDoctor(doctor)}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                                  <Stethoscope className="w-6 h-6 text-cyan-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-[#344256]">{doctor.fullName}</p>
                                  <p className="text-sm text-gray-600">{doctor.specialization}</p>
                                  <p className="text-sm text-gray-500">{doctor.city}</p>
                                  {doctor.profile?.consultationFee && (
                                    <p className="text-sm font-semibold text-cyan-700 mt-0.5">
                                      NPR {parseFloat(doctor.profile.consultationFee).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                Select
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Select Date & Time */}
              {bookingStep === 2 && selectedDoctor && (
                <div className="space-y-4">
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <p className="font-semibold text-[#344256]">Selected Doctor</p>
                    <p className="text-gray-700">{selectedDoctor.fullName} - {selectedDoctor.specialization}</p>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Select Date</Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime('');
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="mb-4"
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <Label className="mb-2 block">Available Time Slots</Label>
                      {availableSlots.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>No available slots for this date</p>
                          <p className="text-sm mt-2">Doctor may not be available on this day</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {availableSlots.map((time, index) => {
                            const [h, m] = time.split(':').map(Number);
                            const endMin = m + 10;
                            const endH = endMin >= 60 ? h + 1 : h;
                            const endTime = `${String(endH).padStart(2,'0')}:${String(endMin % 60).padStart(2,'0')}`;
                            return (
                              <button
                                key={index}
                                onClick={() => handleSelectSlot(selectedDate, time)}
                                className="p-3 border rounded-lg hover:bg-cyan-50 hover:border-cyan-600 transition-colors text-center"
                              >
                                <Clock className="w-4 h-4 mx-auto mb-1 text-cyan-600" />
                                <span className="text-xs font-semibold block">{formatTime(time)}</span>
                                <span className="text-xs text-gray-400">– {formatTime(endTime)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {!selectedDate && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Select a date to view available time slots</p>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4">
                    <Button onClick={() => setBookingStep(1)} variant="outline">
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm Booking */}
              {bookingStep === 3 && selectedDoctor && (
                <div className="space-y-4">
                  <div className="bg-cyan-50 p-4 rounded-lg space-y-2">
                    <p className="font-semibold text-[#344256]">Doctor</p>
                    <p className="text-gray-700">{selectedDoctor.fullName} - {selectedDoctor.specialization}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <p className="font-semibold text-[#344256]">Appointment Details</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-cyan-600" />
                      <span className="text-gray-700">{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-cyan-600" />
                      <span className="text-gray-700">
                        {formatTime(selectedTime)} – {(() => {
                          const [h, m] = selectedTime.split(':').map(Number);
                          const endMin = m + 10;
                          return formatTime(`${String(endMin >= 60 ? h + 1 : h).padStart(2,'0')}:${String(endMin % 60).padStart(2,'0')}`);
                        })()}
                      </span>
                    </div>
                    {selectedDoctor.profile?.consultationFee && (
                      <div className="flex items-center justify-between pt-2 border-t border-blue-200 mt-2">
                        <span className="text-sm font-medium text-gray-700">Consultation Fee</span>
                        <span className="font-bold text-cyan-700 text-base">
                          NPR {parseFloat(selectedDoctor.profile.consultationFee).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {consultationType && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-medium text-gray-700">Type</span>
                        <span className="text-sm font-semibold text-cyan-700 capitalize">
                          {consultationType === 'online' ? '🎥 Online' : '🏥 Physical'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Consultation Type <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setConsultationType('online')}
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-colors ${
                          consultationType === 'online'
                            ? 'border-cyan-600 bg-cyan-50'
                            : 'border-gray-200 hover:border-cyan-300'
                        }`}
                      >
                        <span className="text-2xl">🎥</span>
                        <div className="text-left">
                          <p className="font-semibold text-sm text-[#344256]">Online</p>
                          <p className="text-xs text-gray-500">Video consultation</p>
                        </div>
                        {consultationType === 'online' && (
                          <CheckCircle className="w-4 h-4 text-cyan-600 ml-auto" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConsultationType('physical')}
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-colors ${
                          consultationType === 'physical'
                            ? 'border-cyan-600 bg-cyan-50'
                            : 'border-gray-200 hover:border-cyan-300'
                        }`}
                      >
                        <span className="text-2xl">🏥</span>
                        <div className="text-left">
                          <p className="font-semibold text-sm text-[#344256]">Physical</p>
                          <p className="text-xs text-gray-500">In-person visit</p>
                        </div>
                        {consultationType === 'physical' && (
                          <CheckCircle className="w-4 h-4 text-cyan-600 ml-auto" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label>Reason for Visit <span className="text-red-500">*</span></Label>
                    <textarea
                      value={bookingReason}
                      onChange={(e) => setBookingReason(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg mt-1 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Describe your symptoms or reason for visit..."
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button onClick={() => setBookingStep(2)} variant="outline">
                      Back
                    </Button>
                    <Button 
                      onClick={handleConfirmBooking} 
                      disabled={loading || !bookingReason.trim()}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />

      {/* Notification Panel */}
      {showNotifPanel && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)}>
          <div
            className="absolute top-20 right-6 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <span className="font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount} new</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-cyan-100 hover:text-white underline">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setShowNotifPanel(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-cyan-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        n.type === 'appointment_confirmed' ? 'bg-green-100' :
                        n.type === 'appointment_rescheduled' ? 'bg-purple-100' :
                        n.type === 'follow_up' ? 'bg-orange-100' :
                        n.type === 'video_call' ? 'bg-cyan-100' : 'bg-blue-100'
                      }`}>
                        {n.type === 'appointment_confirmed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {n.type === 'appointment_rescheduled' && <Calendar className="w-4 h-4 text-purple-600" />}
                        {n.type === 'follow_up' && <Calendar className="w-4 h-4 text-orange-600" />}
                        {n.type === 'video_call' && <span className="text-sm">🎥</span>}
                        {n.type === 'consultation_notes' && <FileText className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${!n.isRead ? 'text-[#344256]' : 'text-gray-600'}`}>{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                        {n.type === 'video_call' && n.appointmentId && (
                          <button
                            onClick={async () => {
                              // Mark as read so notification stops appearing
                              try {
                                const token = localStorage.getItem('token');
                                await axios.put(`${API_BASE}/patient/notifications/${n.id}/read`, {}, {
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
                                setUnreadCount(prev => Math.max(0, prev - 1));
                              } catch (e) { /* non-blocking */ }
                              window.location.href = `/video-call?channel=apt_${n.appointmentId}&role=Patient`;
                            }}
                            className="mt-2 text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            🎥 Join Call Now
                          </button>
                        )}
                        {n.type === 'follow_up' && (
                          <button
                            onClick={() => {
                              setShowNotifPanel(false);
                              handleStartBooking();
                            }}
                            className="mt-2 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            📅 Book Follow-up
                          </button>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.isRead && <span className="w-2 h-2 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* eSewa Payment Modal */}
      {showPaymentModal && paymentData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#344256] mb-1">Appointment Booked!</h2>
            <p className="text-gray-500 text-sm mb-4">
              Complete your payment via eSewa to confirm your appointment.
            </p>
            <div className="bg-cyan-50 rounded-xl p-4 mb-6 text-left space-y-1">
              <p className="text-sm text-gray-600">Amount: <span className="font-bold text-cyan-700">NPR {paymentData.amount}</span></p>
              <p className="text-sm text-gray-600">Transaction ID: <span className="font-mono text-xs">{paymentData.transactionId}</span></p>
            </div>

            {/* Hidden eSewa form — auto-submits on button click */}
            <form
              id="esewa-form"
              action={paymentData.esewaUrl}
              method="POST"
            >
              <input type="hidden" name="amount" value={paymentData.amount} />
              <input type="hidden" name="tax_amount" value="0" />
              <input type="hidden" name="total_amount" value={paymentData.amount} />
              <input type="hidden" name="transaction_uuid" value={paymentData.transactionId} />
              <input type="hidden" name="product_code" value={paymentData.merchantId} />
              <input type="hidden" name="product_service_charge" value="0" />
              <input type="hidden" name="product_delivery_charge" value="0" />
              <input type="hidden" name="success_url" value={paymentData.successUrl} />
              <input type="hidden" name="failure_url" value={paymentData.failureUrl} />
              <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code" />
              <input type="hidden" name="signature" value={paymentData.signature} />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Pay with eSewa
              </button>
            </form>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Pay Later (appointment saved as pending)
            </button>
          </div>
        </div>
      )}

      {/* Consultation Notes Modal */}
      {showNotesModal && selectedNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white">
            <CardHeader className="border-b bg-gradient-to-r from-cyan-50 to-blue-50 sticky top-0 z-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#344256]">Consultation Notes</CardTitle>
                    <CardDescription className="mt-0.5">
                      {selectedNote.doctorName} &nbsp;•&nbsp; {formatDate(selectedNote.appointmentDate)}
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={() => setShowNotesModal(false)} variant="ghost" size="sm">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              {/* Chief Complaint */}
              {selectedNote.chiefComplaint && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
                  <p className="text-xs font-semibold text-red-700 mb-1 uppercase tracking-wide">Chief Complaint</p>
                  <p className="text-gray-800">{selectedNote.chiefComplaint}</p>
                </div>
              )}

              {/* Medical History */}
              {(selectedNote.pastIllnesses || selectedNote.ongoingConditions || selectedNote.allergies || selectedNote.currentMedications) && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-orange-700 mb-3 uppercase tracking-wide">Medical History</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedNote.pastIllnesses && <div><p className="text-xs text-gray-500">Past Illnesses</p><p className="text-sm text-gray-800 mt-0.5">{selectedNote.pastIllnesses}</p></div>}
                    {selectedNote.ongoingConditions && <div><p className="text-xs text-gray-500">Ongoing Conditions</p><p className="text-sm text-gray-800 mt-0.5">{selectedNote.ongoingConditions}</p></div>}
                    {selectedNote.allergies && <div><p className="text-xs text-gray-500">Allergies</p><p className="text-sm text-gray-800 mt-0.5">{selectedNote.allergies}</p></div>}
                    {selectedNote.currentMedications && <div><p className="text-xs text-gray-500">Current Medications</p><p className="text-sm text-gray-800 mt-0.5">{selectedNote.currentMedications}</p></div>}
                  </div>
                </div>
              )}

              {/* Doctor's Observations */}
              {(selectedNote.physicalFindings || (selectedNote.vitals && Object.values(selectedNote.vitals).some(v => v))) && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">Doctor's Observations</p>
                  {selectedNote.physicalFindings && (
                    <div className="mb-3"><p className="text-xs text-gray-500">Physical Findings</p><p className="text-sm text-gray-800 mt-0.5">{selectedNote.physicalFindings}</p></div>
                  )}
                  {selectedNote.vitals && Object.values(selectedNote.vitals).some(v => v) && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Vitals</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[['bp','Blood Pressure'],['hr','Heart Rate'],['temp','Temperature'],['weight','Weight'],['spo2','SpO2']].map(([k, label]) =>
                          selectedNote.vitals[k] ? (
                            <div key={k} className="bg-white border border-blue-100 rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-500">{label}</p>
                              <p className="font-bold text-blue-700 text-sm mt-0.5">{selectedNote.vitals[k]}</p>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Diagnosis */}
              {(selectedNote.diagnosis || selectedNote.symptoms) && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Diagnosis</p>
                  {selectedNote.diagnosis && <div><p className="text-xs text-gray-500">Condition(s)</p><p className="text-gray-800 mt-0.5">{selectedNote.diagnosis}</p></div>}
                  {selectedNote.symptoms && <div><p className="text-xs text-gray-500">Symptoms</p><p className="text-gray-800 mt-0.5">{selectedNote.symptoms}</p></div>}
                </div>
              )}

              {/* Treatment Plan */}
              {selectedNote.treatment && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl">
                  <p className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">Treatment Plan</p>
                  <p className="text-gray-800">{selectedNote.treatment}</p>
                </div>
              )}

              {/* Prescriptions */}
              {selectedNote.prescriptions?.length > 0 && (
                <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-cyan-700 mb-3 uppercase tracking-wide">Prescriptions</p>
                  <div className="space-y-2">
                    {selectedNote.prescriptions.map((p, i) => (
                      <div key={i} className="bg-white border border-cyan-100 rounded-lg p-3 flex items-start gap-3">
                        <span className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center text-xs font-bold text-cyan-700 flex-shrink-0">{i+1}</span>
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-1 text-sm">
                          <div><p className="text-xs text-gray-400">Medicine</p><p className="font-semibold">{typeof p === 'string' ? p : p.name}</p></div>
                          {p.dosage && <div><p className="text-xs text-gray-400">Dosage</p><p>{p.dosage}</p></div>}
                          {p.duration && <div><p className="text-xs text-gray-400">Duration</p><p>{p.duration}</p></div>}
                          {p.instructions && <div><p className="text-xs text-gray-400">Instructions</p><p>{p.instructions}</p></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advice & Follow-up */}
              {(selectedNote.advice || selectedNote.testsRequired || selectedNote.followUpDate) && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Advice & Follow-up</p>
                  {selectedNote.advice && <div><p className="text-xs text-gray-500">Advice & Recommendations</p><p className="text-gray-800 mt-0.5">{selectedNote.advice}</p></div>}
                  {selectedNote.testsRequired && <div><p className="text-xs text-gray-500">Tests / Reports Required</p><p className="text-gray-800 mt-0.5">{selectedNote.testsRequired}</p></div>}
                  {selectedNote.followUpDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-yellow-600" />
                      <div><p className="text-xs text-gray-500">Follow-up Date</p><p className="font-semibold text-gray-800">{formatDate(selectedNote.followUpDate)}</p></div>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Notes */}
              {selectedNote.additionalNotes && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Additional Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedNote.additionalNotes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t">
                <Button
                  variant="outline"
                  className="flex-1 border-cyan-600 text-cyan-700 hover:bg-cyan-50"
                  onClick={() => generateConsultationPdf(selectedNote, {
                    doctorName: selectedNote.doctorName,
                    appointmentDate: selectedNote.appointmentDate,
                    patientName: user?.fullName,
                  })}
                >
                  <FileText className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Button onClick={() => setShowNotesModal(false)} className="flex-1 bg-cyan-600 hover:bg-cyan-700">Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* eSewa Payment Modal */}
      {showPaymentModal && paymentData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#344256] mb-1">Complete Payment</h2>
            <p className="text-gray-500 text-sm mb-4">
              Pay via eSewa to confirm your online consultation.
            </p>
            <div className="bg-cyan-50 rounded-xl p-4 mb-6 text-left space-y-1">
              <p className="text-sm text-gray-600">Amount: <span className="font-bold text-cyan-700">NPR {paymentData.form_data?.amount}</span></p>
              <p className="text-sm text-gray-600">Transaction ID: <span className="font-mono text-xs">{paymentData.form_data?.transaction_uuid}</span></p>
            </div>

            <form action={paymentData.payment_url} method="POST">
              {paymentData.form_data && Object.entries(paymentData.form_data).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Pay with eSewa
              </button>
            </form>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
