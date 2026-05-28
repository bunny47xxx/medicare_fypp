import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Stethoscope, 
  MapPin, 
  Calendar,
  Phone,
  Mail,
  Clock,
  Filter,
  X,
  CheckCircle,
  User,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function FindDoctor() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    loadDoctors();
  }, [selectedSpecialty, selectedCity]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedSpecialty) params.append('specialization', selectedSpecialty);
      if (selectedCity) params.append('city', selectedCity);

      const response = await axios.get(`${API_BASE}/patient/doctors?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorModal(true);
  };

  const handleBookAppointment = (doctor) => {
    const userData = localStorage.getItem('user');
    if (userData) {
      localStorage.setItem('selectedDoctorForBooking', JSON.stringify(doctor));
      navigate('/user');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openBooking', { detail: { doctor } }));
      }, 100);
    } else {
      alert('Please log in to book an appointment');
      navigate('/auth/login');
    }
  };


  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchQuery || 
      doctor.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Extract unique specialties and cities from doctors
  const specialties = [...new Set(doctors.map(d => d.specialization).filter(Boolean))].sort();
  const cities = [...new Set(doctors.map(d => d.city).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/user')}
            className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-800 mb-4 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-[#344256] mb-2">Find a Doctor</h1>
          <p className="text-gray-600">Search and book appointments with qualified healthcare professionals</p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by doctor name, specialty, or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label>Specialty</Label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">All Specialties</option>
                      {specialties.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>City</Label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">All Cities</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  {(selectedSpecialty || selectedCity) && (
                    <div className="md:col-span-2">
                      <Button
                        onClick={() => {
                          setSelectedSpecialty('');
                          setSelectedCity('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found <span className="font-semibold text-cyan-600">{filteredDoctors.length}</span> doctor{filteredDoctors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin h-8 w-8 text-cyan-600" />
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl font-semibold text-gray-700 mb-2">No doctors found</p>
                <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSpecialty('');
                    setSelectedCity('');
                  }}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Doctor Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-8 h-8 text-cyan-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-[#344256]">{doctor.fullName}</h3>
                          <p className="text-sm text-cyan-600">{doctor.specialization}</p>
                        </div>
                      </div>
                      {doctor.emailVerified && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{doctor.city}</span>
                    </div>

                    {/* Consultation Fee */}
                    {doctor.profile?.consultationFee && (
                      <div className="flex items-center justify-between bg-cyan-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-600">Consultation Fee</span>
                        <span className="font-bold text-cyan-700">NPR {parseFloat(doctor.profile.consultationFee).toLocaleString()}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2 border-t">
                      <Button
                        onClick={() => handleViewProfile(doctor)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        View Profile
                      </Button>
                      <Button
                        onClick={() => handleBookAppointment(doctor)}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                        size="sm"
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Book
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>


      {/* Doctor Profile Modal */}
      {showDoctorModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedDoctor.fullName}</CardTitle>
                  <CardDescription>{selectedDoctor.specialization}</CardDescription>
                </div>
                <Button onClick={() => setShowDoctorModal(false)} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-cyan-600" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium text-[#344256]">{selectedDoctor.city}</p>
                  </div>
                </div>
                {selectedDoctor.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-cyan-600" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-[#344256]">{selectedDoctor.phone}</p>
                    </div>
                  </div>
                )}
                {selectedDoctor.email && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-cyan-600" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-[#344256] text-sm">{selectedDoctor.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Specialization Details */}
              <div>
                <Label className="text-base font-semibold mb-2 block">Specialization</Label>
                <p className="text-gray-700">{selectedDoctor.specialization}</p>
              </div>

              {/* Availability Status */}
              {selectedDoctor.emailVerified && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-900">Available for Appointments</p>
                      <p className="text-sm text-green-700 mt-1">
                        Book now to secure your preferred time slot
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  {selectedDoctor.profile?.consultationFee && (
                    <div className="mt-3 pt-3 border-t border-green-200 flex items-center justify-between">
                      <span className="text-sm text-green-800 font-medium">Consultation Fee</span>
                      <span className="text-lg font-bold text-cyan-700">NPR {parseFloat(selectedDoctor.profile.consultationFee).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowDoctorModal(false);
                    handleBookAppointment(selectedDoctor);
                  }}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
                <Button
                  onClick={() => setShowDoctorModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
