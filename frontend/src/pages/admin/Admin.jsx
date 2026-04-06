import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Calendar, 
  FileText, 
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  CheckCircle,
  BadgeCheck,
  XCircle,
  Stethoscope,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [verifications, setVerifications] = useState([]);
  const [verifFilter, setVerifFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState(null); // doctorId
  const [rejectReason, setRejectReason] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'appointments') {
      fetchAppointments();
    } else if (activeTab === 'reports') {
      fetchStats();
    } else if (activeTab === 'verifications') {
      fetchVerifications();
    }
  }, [activeTab, verifFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data.users || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/admin/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAppointments(response.data.appointments || response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
      }
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Calculate basic stats from users and appointments
      setStats({
        totalUsers: users.length,
        totalAppointments: appointments.length,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/admin/verifications?status=${verifFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVerifications(res.data.verifications || []);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (doctorId, action, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/admin/verifications/${doctorId}/review`, {
        action, rejectionReason: reason
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Doctor ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      setRejectModal(null);
      setRejectReason('');
      fetchVerifications();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/admin/users/${userId}/status`, {
        emailVerified: !currentStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-[#344256] mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users and appointments</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'users'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-gray-600 hover:text-cyan-600'
            }`}
          >
            <Users className="inline-block w-5 h-5 mr-2" />
            Users
          </button>
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
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'reports'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-gray-600 hover:text-cyan-600'
            }`}
          >
            <FileText className="inline-block w-5 h-5 mr-2" />
            Reports
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'verifications'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-gray-600 hover:text-cyan-600'
            }`}
          >
            <BadgeCheck className="inline-block w-5 h-5 mr-2" />
            Verifications
            {verifications.filter(v => v.verificationStatus === 'pending').length > 0 && activeTab !== 'verifications' && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {verifications.filter(v => v.verificationStatus === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Manage Users</CardTitle>
                  <CardDescription>View and manage patient/doctor accounts</CardDescription>
                </div>
                <Button onClick={fetchUsers} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="mt-4">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Role</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{user.fullName}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
                              {user.role === 'user' ? 'Patient' : user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'doctor'
                                ? (user.emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {user.role === 'doctor'
                                ? (user.emailVerified ? 'Verified' : 'Unverified')
                                : 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {user.role === 'doctor' && (
                              <Button
                                onClick={() => handleUserStatusToggle(user.id, user.emailVerified)}
                                variant="outline"
                                size="sm"
                                className={user.emailVerified ? "text-yellow-600" : "text-green-600"}
                              >
                                {user.emailVerified ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-1" />
                                    Unverify
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Verify
                                  </>
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>Monitor all appointments</CardDescription>
                </div>
                <Button onClick={fetchAppointments} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No appointments found</div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-[#344256]">
                            {apt.patient?.fullName || 'N/A'} → {apt.doctor?.fullName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(apt.appointmentDate)} {apt.appointmentTime}
                          </p>
                          <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                            apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>System Reports</CardTitle>
                  <CardDescription>System usage statistics</CardDescription>
                </div>
                <Button onClick={fetchStats} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Total Users</p>
                    <p className="text-3xl font-bold text-cyan-600">
                      {stats.users?.total || stats.totalUsers || users.length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Total Appointments</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.appointments?.total || stats.totalAppointments || appointments.length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Verified Users</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.users?.active || users.filter(u => u.emailVerified).length}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No statistics available</div>
              )}
            </CardContent>
          </Card>
        )}
        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <CardTitle>Doctor Verification Requests</CardTitle>
                  <CardDescription>Review and approve doctor credential submissions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={verifFilter}
                    onChange={e => setVerifFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <Button onClick={fetchVerifications} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : verifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BadgeCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No {verifFilter} verification requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verifications.map(v => (
                    <div key={v.id} className="border rounded-xl p-5 bg-white hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-6 h-6 text-cyan-600" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-[#344256]">{v.doctor?.fullName}</p>
                            <p className="text-sm text-gray-500">{v.doctor?.email} • {v.doctor?.city}</p>
                            <p className="text-sm text-cyan-700 font-medium mt-1">{v.doctor?.specialization}</p>
                            {v.nmcNo && (
                              <p className="text-sm text-gray-700 mt-1">
                                <span className="font-semibold">NMC No:</span> {v.nmcNo}
                              </p>
                            )}
                            {v.experience && (
                              <p className="text-sm text-gray-600">{v.experience} years experience</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            v.verificationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                            v.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {v.verificationStatus.charAt(0).toUpperCase() + v.verificationStatus.slice(1)}
                          </span>
                          {v.verificationRequestedAt && (
                            <p className="text-xs text-gray-400">
                              Submitted: {formatDate(v.verificationRequestedAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Qualifications */}
                      {v.qualifications?.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Qualifications</p>
                          <div className="flex flex-wrap gap-2">
                            {v.qualifications.map((q, i) => (
                              <span key={i} className="bg-blue-50 text-blue-800 text-xs px-3 py-1 rounded-full">
                                {q.degree} — {q.institution} {q.year && `(${q.year})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certificates */}
                      {v.certificates?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Certificates</p>
                          <div className="flex flex-wrap gap-2">
                            {v.certificates.map((c, i) => (
                              <span key={i} className="bg-purple-50 text-purple-800 text-xs px-3 py-1 rounded-full">
                                {c.name} — {c.issuedBy} {c.year && `(${c.year})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rejection reason */}
                      {v.rejectionReason && (
                        <div className="mt-3 bg-red-50 p-3 rounded-lg">
                          <p className="text-sm text-red-700"><span className="font-semibold">Rejection reason:</span> {v.rejectionReason}</p>
                        </div>
                      )}

                      {/* Actions */}
                      {v.verificationStatus === 'pending' && (
                        <div className="flex gap-3 mt-4 pt-4 border-t">
                          <Button
                            onClick={() => handleVerificationAction(v.doctorId, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => { setRejectModal(v.doctorId); setRejectReason(''); }}
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </main>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reject Verification</CardTitle>
              <CardDescription>Provide a reason for rejection (visible to the doctor)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 min-h-[100px]"
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => handleVerificationAction(rejectModal, 'reject', rejectReason)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={!rejectReason.trim()}
                >
                  Confirm Rejection
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setRejectModal(null)}>
                  Cancel
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
