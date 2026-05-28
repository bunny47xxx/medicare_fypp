import React, { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Pill, 
  Activity, 
  Calendar,
  Download,
  Stethoscope,
  User,
  X,
  Eye,
  Upload,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { generateConsultationPdf } from '@/utils/generateConsultationPdf';
import { toast } from 'react-toastify';

export default function ViewRecords() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [user, setUser] = useState(null);

  // Lab report state
  const [labReports, setLabReports] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', file: null, appointmentId: null });
  const [uploading, setUploading] = useState(false);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        loadRecords(parsedUser.id);
        loadLabReports();
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const loadRecords = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Fetch real medical records from API
      const response = await axios.get(`${API_BASE}/patient/medical-records`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.records) {
        // Transform API data to match frontend format
        const transformedRecords = response.data.records.map(record => ({
          id: record.id,
          type: record.recordType,
          title: record.title,
          doctor: record.doctor ? record.doctor.fullName : 'Unknown Doctor',
          specialty: record.doctor ? record.doctor.specialization : 'N/A',
          date: record.recordDate,
          status: record.status,
          // Chief complaint
          chiefComplaint: record.chiefComplaint,
          // Medical history
          pastIllnesses: record.pastIllnesses,
          ongoingConditions: record.ongoingConditions,
          allergies: record.allergies,
          currentMedications: record.currentMedications,
          // Observations
          physicalFindings: record.physicalFindings,
          vitals: record.vitals ? (typeof record.vitals === 'string' ? JSON.parse(record.vitals) : record.vitals) : null,
          // Diagnosis & treatment
          diagnosis: record.diagnosis,
          symptoms: record.symptoms,
          treatment: record.treatment,
          prescriptions: record.prescriptions
            ? (typeof record.prescriptions === 'string' ? JSON.parse(record.prescriptions) : record.prescriptions)
            : [],
          labResults: record.labResults ? (typeof record.labResults === 'string' ? JSON.parse(record.labResults) : record.labResults) : null,
          // Advice
          advice: record.advice,
          testsRequired: record.testsRequired,
          followUpDate: record.followUpDate,
          notes: record.notes,
          appointmentDate: record.appointment ? record.appointment.appointmentDate : null,
          appointmentId: record.appointment ? record.appointment.id : null,
        }));

        setRecords(transformedRecords);
      } else {
        // No records found, show empty state
        setRecords([]);
      }
    } catch (error) {
      console.error('Error loading records:', error);
      // If API fails, show empty state instead of mock data
      setRecords([]);
    }
  };

  const loadLabReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/lab-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLabReports(res.data.reports || []);
    } catch (err) {
      console.error('Error loading lab reports:', err);
    }
  };

  const handleUploadLabReport = async () => {
    if (!uploadForm.title || !uploadForm.file) {
      toast.warn('Title and file are required');
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('file', uploadForm.file);
      if (uploadForm.appointmentId) formData.append('appointmentId', uploadForm.appointmentId);

      await axios.post(`${API_BASE}/lab-reports`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setShowUploadModal(false);
      setUploadForm({ title: '', description: '', file: null, appointmentId: null });
      loadLabReports();
      toast.success('Lab report uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLabReport = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/lab-reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadLabReports();
      toast.success('Lab report deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const generateMockRecords = () => {
    return [
      {
        id: 1,
        type: 'Consultation',
        title: 'Cardiologist Consultation',
        doctor: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        date: '2024-01-15',
        status: 'Completed',
        notes: 'Regular checkup completed. Blood pressure: 120/80 (Normal). Heart rate: 72 bpm. Patient reports feeling well. Continue current medication (Aspirin 81mg daily). Follow-up in 3 months.',
        diagnosis: 'Hypertension - Controlled',
        prescriptions: ['Aspirin 81mg - Take once daily with food'],
        vitals: {
          bloodPressure: '120/80',
          heartRate: '72 bpm',
          temperature: '98.6°F',
          weight: '165 lbs'
        }
      },
      {
        id: 2,
        type: 'Lab Report',
        title: 'Blood Test Results',
        doctor: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        date: '2024-01-10',
        status: 'Completed',
        notes: 'Complete blood count (CBC) and lipid panel results. All values within normal range.',
        diagnosis: 'Normal Results',
        results: {
          hemoglobin: '14.5 g/dL (Normal)',
          cholesterol: '180 mg/dL (Normal)',
          glucose: '95 mg/dL (Normal)',
          whiteBloodCells: '7,200/μL (Normal)'
        }
      },
      {
        id: 3,
        type: 'Prescription',
        title: 'Prescription Refill',
        doctor: 'Dr. Michael Chen',
        specialty: 'Dermatologist',
        date: '2024-01-08',
        status: 'Active',
        notes: 'Topical treatment for skin condition. Apply twice daily.',
        diagnosis: 'Eczema - Improving',
        prescriptions: ['Topical Cream 0.1% - Apply twice daily to affected areas', 'Moisturizer - Apply after shower'],
        refills: 2,
        expiryDate: '2024-04-08'
      },
      {
        id: 4,
        type: 'Consultation',
        title: 'Dermatology Consultation',
        doctor: 'Dr. Michael Chen',
        specialty: 'Dermatologist',
        date: '2024-01-05',
        status: 'Completed',
        notes: 'Virtual consultation for skin condition. Patient reports improvement with current treatment. Skin lesions showing signs of healing. Continue topical treatment as prescribed.',
        diagnosis: 'Eczema - Improving',
        prescriptions: ['Topical Cream - Apply twice daily to affected areas']
      },
      {
        id: 5,
        type: 'Lab Report',
        title: 'X-Ray Results',
        doctor: 'Dr. James Brown',
        specialty: 'Neurologist',
        date: '2023-12-20',
        status: 'Completed',
        notes: 'Chest X-ray shows clear lungs. No abnormalities detected.',
        diagnosis: 'Normal X-Ray',
        results: {
          findings: 'No acute cardiopulmonary abnormalities',
          impression: 'Clear chest X-ray'
        }
      },
      {
        id: 6,
        type: 'Consultation',
        title: 'Annual Physical Examination',
        doctor: 'Dr. Robert Taylor',
        specialty: 'General Medicine',
        date: '2023-12-15',
        status: 'Completed',
        notes: 'Annual physical examination. All vitals within normal range. Blood work results normal. Patient in good health. No medication changes needed.',
        diagnosis: 'General Health Check - Normal',
        vitals: {
          bloodPressure: '118/78',
          heartRate: '68 bpm',
          temperature: '98.4°F',
          weight: '165 lbs',
          height: '5\'10"'
        }
      }
    ];
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowRecordModal(true);
  };

  const handleDownloadRecord = (record) => {
    // Create a downloadable document
    const content = `
MEDICAL RECORD

Type: ${record.type}
Title: ${record.title}
Doctor: ${record.doctor}
Specialty: ${record.specialty}
Date: ${formatDate(record.date)}
Status: ${record.status}
Diagnosis: ${record.diagnosis || 'N/A'}

Notes:
${record.notes || 'N/A'}

${record.prescriptions ? `Prescriptions:\n${record.prescriptions.join('\n')}` : ''}

${record.vitals ? `Vital Signs:\n${Object.entries(record.vitals).map(([k, v]) => `${k}: ${v}`).join('\n')}` : ''}

${record.results ? `Test Results:\n${Object.entries(record.results).map(([k, v]) => `${k}: ${v}`).join('\n')}` : ''}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.type}_${record.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Record downloaded successfully');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchTerm || 
      record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activeTab === 'all'
      || (activeTab === 'prescription'
          ? record.prescriptions?.length > 0
          : record.type.toLowerCase() === activeTab.toLowerCase());
    
    const matchesDate = !dateFilter || record.date === dateFilter;
    
    return matchesSearch && matchesType && matchesDate;
  });

  const recordsByType = {
    all: records,
    consultation: records.filter(r => r.type === 'Consultation'),
    'lab report': records.filter(r => r.type === 'Lab Report'),
    prescription: records.filter(r => r.prescriptions?.length > 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/user')}
            className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-800 mb-4 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-[#344256] mb-2">Medical Records</h1>
          <p className="text-gray-600">View and manage your complete medical history</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Records</p>
                  <p className="text-2xl font-bold text-cyan-600">{records.length}</p>
                </div>
                <FileText className="w-10 h-10 text-cyan-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Consultations</p>
                  <p className="text-2xl font-bold text-blue-600">{recordsByType.consultation.length}</p>
                </div>
                <Stethoscope className="w-10 h-10 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lab Reports</p>
                  <p className="text-2xl font-bold text-green-600">
                    {records.filter(r => r.type === 'Lab Report').length}
                  </p>
                </div>
                <Activity className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prescriptions</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {records.filter(r => r.prescriptions?.length > 0).length}
                  </p>
                </div>
                <Pill className="w-10 h-10 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Tabs */}
              <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
                    activeTab === 'all'
                      ? 'border-b-2 border-cyan-600 text-cyan-600'
                      : 'text-gray-600 hover:text-cyan-600'
                  }`}
                >
                  All Records
                </button>
                <button
                  onClick={() => setActiveTab('consultation')}
                  className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
                    activeTab === 'consultation'
                      ? 'border-b-2 border-cyan-600 text-cyan-600'
                      : 'text-gray-600 hover:text-cyan-600'
                  }`}
                >
                  Consultations
                </button>
                <button
                  onClick={() => setActiveTab('lab report')}
                  className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
                    activeTab === 'lab report'
                      ? 'border-b-2 border-cyan-600 text-cyan-600'
                      : 'text-gray-600 hover:text-cyan-600'
                  }`}
                >
                  Lab Reports
                </button>
                <button
                  onClick={() => setActiveTab('prescription')}
                  className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
                    activeTab === 'prescription'
                      ? 'border-b-2 border-cyan-600 text-cyan-600'
                      : 'text-gray-600 hover:text-cyan-600'
                  }`}
                >
                  Prescriptions
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="max-w-xs"
                  placeholder="Filter by date"
                />
                {dateFilter && (
                  <Button
                    onClick={() => setDateFilter('')}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Lab Reports tab — dedicated upload UI */}
            {activeTab === 'lab report' ? (
              <div className="space-y-4">
                {/* Tests Required by Doctor — only from completed consultations */}
                {(() => {
                  const latest = records
                    .filter(r => r.testsRequired && r.status === 'Completed')
                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                  if (!latest) return null;
                  const uploaded = labReports.find(lr => lr.appointmentId === latest.appointmentId || lr.title === latest.testsRequired);
                  return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-3 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Test Required by Doctor
                      </p>
                      <div className="bg-white border border-yellow-100 rounded-lg p-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">{latest.doctor} · {formatDate(latest.date)}</p>
                          <p className="text-sm font-medium text-[#344256]">{latest.testsRequired}</p>
                        </div>
                        {uploaded ? (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-2 py-0.5">✓ Uploaded</span>
                            <a href={`${API_BASE}/lab-reports/file/${uploaded.filePath}`} target="_blank" rel="noreferrer"
                              className="text-xs text-cyan-600 hover:underline flex items-center gap-0.5">
                              <ExternalLink className="w-3 h-3" /> View
                            </a>
                          </div>
                        ) : (
                          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-xs flex-shrink-0"
                            onClick={() => {
                              setUploadForm({ title: latest.testsRequired, description: `For consultation on ${formatDate(latest.date)}`, file: null, appointmentId: latest.appointmentId });
                              setShowUploadModal(true);
                            }}>
                            <Upload className="w-3 h-3 mr-1" /> Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Uploaded lab reports list */}
                {labReports.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 font-medium">No lab reports uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {records.filter(r => r.testsRequired && r.status === 'Completed').length === 0
                        ? 'Lab report upload will be available after your online consultation is completed'
                        : 'Upload reports suggested by your doctor'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {labReports.map(r => (
                      <div key={r.id} className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {r.fileType?.includes('pdf') ? <FileText className="w-5 h-5 text-green-600" /> : <Activity className="w-5 h-5 text-green-600" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#344256] truncate">{r.title}</p>
                            {r.description && <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>}
                            <p className="text-xs text-gray-400 mt-1">
                              {r.fileName} · {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={`${API_BASE}/lab-reports/file/${r.filePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-1.5 rounded-lg hover:bg-cyan-100 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                          <button onClick={() => handleDeleteLabReport(r.id)} className="text-red-400 hover:text-red-600 p-1.5">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl font-semibold text-gray-700 mb-2">No records found</p>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : activeTab === 'prescription' ? (
              /* Prescription-only view */
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-[#344256]">{record.doctor}</p>
                        <p className="text-xs text-gray-500">{formatDate(record.date)}</p>
                      </div>
                      {record.diagnosis && (
                        <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-3 py-0.5">
                          {record.diagnosis}
                        </span>
                      )}
                    </div>
                    {/* Prescriptions table */}
                    <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-cyan-700 mb-3 uppercase tracking-wide">Prescriptions</p>
                      <div className="space-y-2">
                        {record.prescriptions.map((p, i) => (
                          <div key={i} className="bg-white border border-cyan-100 rounded-lg p-3 flex items-start gap-3">
                            <span className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center text-xs font-bold text-cyan-700 flex-shrink-0">{i + 1}</span>
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-gray-400">Medicine</p>
                                <p className="font-semibold">{typeof p === 'string' ? p : p.name}</p>
                              </div>
                              {p.dosage && <div><p className="text-xs text-gray-400">Dosage</p><p>{p.dosage}</p></div>}
                              {p.duration && <div><p className="text-xs text-gray-400">Duration</p><p>{p.duration}</p></div>}
                              {p.instructions && <div><p className="text-xs text-gray-400">Instructions</p><p>{p.instructions}</p></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${
                            record.type === 'Consultation' ? 'bg-blue-100' :
                            record.type === 'Lab Report' ? 'bg-green-100' :
                            'bg-purple-100'
                          }`}>
                            {record.type === 'Consultation' && <Stethoscope className="w-6 h-6 text-blue-600" />}
                            {record.type === 'Lab Report' && <Activity className="w-6 h-6 text-green-600" />}
                            {record.type === 'Prescription' && <Pill className="w-6 h-6 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg text-[#344256]">{record.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                record.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {record.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>{record.doctor}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(record.date)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Stethoscope className="w-4 h-4" />
                                <span>{record.specialty}</span>
                              </div>
                            </div>
                            {record.diagnosis && (
                              <p className="text-sm text-gray-700 mb-2">
                                <strong>Diagnosis:</strong> {record.diagnosis}
                              </p>
                            )}
                            {record.prescriptions?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                <span className="text-xs text-gray-500 mr-1 flex items-center gap-1">
                                  <Pill className="w-3 h-3" /> Prescriptions:
                                </span>
                                {record.prescriptions.slice(0, 3).map((p, i) => (
                                  <span key={i} className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full px-2 py-0.5">
                                    {typeof p === 'string' ? p : p.name}
                                    {p.dosage ? ` ${p.dosage}` : ''}
                                  </span>
                                ))}
                                {record.prescriptions.length > 3 && (
                                  <span className="text-xs text-gray-400">+{record.prescriptions.length - 3} more</span>
                                )}
                              </div>
                            )}
                            {record.notes && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                {record.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          onClick={() => handleViewRecord(record)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => generateConsultationPdf(record, {
                            doctorName: record.doctor,
                            appointmentDate: record.appointmentDate || record.date,
                            patientName: user?.fullName,
                          })}
                          variant="outline"
                          size="sm"
                          className="text-cyan-600 hover:text-cyan-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Record Detail Modal */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white">
            <CardHeader className="border-b bg-gradient-to-r from-cyan-50 to-blue-50 sticky top-0 z-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedRecord.type === 'Consultation' ? 'bg-blue-100' :
                    selectedRecord.type === 'Lab Report' ? 'bg-green-100' :
                    selectedRecord.type === 'Prescription' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {selectedRecord.type === 'Consultation' && <Stethoscope className="w-6 h-6 text-blue-600" />}
                    {selectedRecord.type === 'Lab Report' && <Activity className="w-6 h-6 text-green-600" />}
                    {selectedRecord.type === 'Prescription' && <Pill className="w-6 h-6 text-purple-600" />}
                    {!['Consultation','Lab Report','Prescription'].includes(selectedRecord.type) && <FileText className="w-6 h-6 text-gray-600" />}
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#344256]">{selectedRecord.title}</CardTitle>
                    <CardDescription className="mt-0.5">
                      {selectedRecord.doctor} &nbsp;•&nbsp; {formatDate(selectedRecord.date)}
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={() => setShowRecordModal(false)} variant="ghost" size="sm"><X className="w-5 h-5" /></Button>
              </div>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                selectedRecord.status === 'Completed' ? 'bg-green-100 text-green-700' :
                selectedRecord.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
              }`}>{selectedRecord.status}</span>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              {/* Provider Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl">
                <div><p className="text-xs text-gray-500">Doctor</p><p className="font-semibold text-sm">{selectedRecord.doctor}</p></div>
                <div><p className="text-xs text-gray-500">Specialty</p><p className="font-semibold text-sm">{selectedRecord.specialty || 'N/A'}</p></div>
                <div><p className="text-xs text-gray-500">Date</p><p className="font-semibold text-sm">{formatDate(selectedRecord.date)}</p></div>
                <div><p className="text-xs text-gray-500">Type</p><p className="font-semibold text-sm">{selectedRecord.type}</p></div>
              </div>

              {/* Chief Complaint */}
              {selectedRecord.chiefComplaint && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
                  <p className="text-xs font-semibold text-red-700 mb-1 uppercase tracking-wide">Chief Complaint</p>
                  <p className="text-gray-800">{selectedRecord.chiefComplaint}</p>
                </div>
              )}

              {/* Medical History */}
              {(selectedRecord.pastIllnesses || selectedRecord.ongoingConditions || selectedRecord.allergies || selectedRecord.currentMedications) && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-orange-700 mb-3 uppercase tracking-wide">Medical History</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRecord.pastIllnesses && <div><p className="text-xs text-gray-500">Past Illnesses</p><p className="text-sm text-gray-800 mt-0.5">{selectedRecord.pastIllnesses}</p></div>}
                    {selectedRecord.ongoingConditions && <div><p className="text-xs text-gray-500">Ongoing Conditions</p><p className="text-sm text-gray-800 mt-0.5">{selectedRecord.ongoingConditions}</p></div>}
                    {selectedRecord.allergies && <div><p className="text-xs text-gray-500">Allergies</p><p className="text-sm text-gray-800 mt-0.5">{selectedRecord.allergies}</p></div>}
                    {selectedRecord.currentMedications && <div><p className="text-xs text-gray-500">Current Medications</p><p className="text-sm text-gray-800 mt-0.5">{selectedRecord.currentMedications}</p></div>}
                  </div>
                </div>
              )}

              {/* Doctor's Observations */}
              {(selectedRecord.physicalFindings || (selectedRecord.vitals && Object.values(selectedRecord.vitals).some(v => v))) && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">Doctor's Observations</p>
                  {selectedRecord.physicalFindings && (
                    <div className="mb-3"><p className="text-xs text-gray-500">Physical Findings</p><p className="text-sm text-gray-800 mt-0.5">{selectedRecord.physicalFindings}</p></div>
                  )}
                  {selectedRecord.vitals && Object.values(selectedRecord.vitals).some(v => v) && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Vitals</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[['bp','Blood Pressure'],['hr','Heart Rate'],['temp','Temperature'],['weight','Weight'],['spo2','SpO2']].map(([k, label]) =>
                          selectedRecord.vitals[k] ? (
                            <div key={k} className="bg-white border border-blue-100 rounded-lg p-2 text-center">
                              <p className="text-xs text-gray-500">{label}</p>
                              <p className="font-bold text-blue-700 text-sm mt-0.5">{selectedRecord.vitals[k]}</p>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Diagnosis & Symptoms */}
              {(selectedRecord.diagnosis || selectedRecord.symptoms) && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Diagnosis</p>
                  {selectedRecord.diagnosis && <div><p className="text-xs text-gray-500">Condition(s)</p><p className="text-gray-800 mt-0.5">{selectedRecord.diagnosis}</p></div>}
                  {selectedRecord.symptoms && <div><p className="text-xs text-gray-500">Symptoms</p><p className="text-gray-800 mt-0.5">{selectedRecord.symptoms}</p></div>}
                </div>
              )}

              {/* Treatment */}
              {selectedRecord.treatment && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl">
                  <p className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">Treatment Plan</p>
                  <p className="text-gray-800">{selectedRecord.treatment}</p>
                </div>
              )}

              {/* Prescriptions */}
              {selectedRecord.prescriptions?.length > 0 && (
                <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-cyan-700 mb-3 uppercase tracking-wide">Prescriptions</p>
                  <div className="space-y-2">
                    {selectedRecord.prescriptions.map((p, i) => (
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

              {/* Lab Results */}
              {selectedRecord.labResults && Object.keys(selectedRecord.labResults).length > 0 && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-700 mb-3 uppercase tracking-wide">Lab Results</p>
                  <div className="space-y-1">
                    {Object.entries(selectedRecord.labResults).map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2 px-3 bg-white rounded-lg text-sm">
                        <span className="text-gray-600">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advice & Follow-up */}
              {(selectedRecord.advice || selectedRecord.testsRequired || selectedRecord.followUpDate) && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Advice & Follow-up</p>
                  {selectedRecord.advice && <div><p className="text-xs text-gray-500">Advice & Recommendations</p><p className="text-gray-800 mt-0.5">{selectedRecord.advice}</p></div>}
                  {selectedRecord.testsRequired && <div><p className="text-xs text-gray-500">Tests / Reports Required</p><p className="text-gray-800 mt-0.5">{selectedRecord.testsRequired}</p></div>}
                  {selectedRecord.followUpDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-yellow-600" />
                      <div><p className="text-xs text-gray-500">Follow-up Date</p><p className="font-semibold text-gray-800">{formatDate(selectedRecord.followUpDate)}</p></div>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Notes */}
              {selectedRecord.notes && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Additional Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedRecord.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t">
                <Button
                  variant="outline"
                  className="flex-1 border-cyan-600 text-cyan-700 hover:bg-cyan-50"
                  onClick={() => generateConsultationPdf(selectedRecord, {
                    doctorName: selectedRecord.doctor,
                    appointmentDate: selectedRecord.appointmentDate || selectedRecord.date,
                    patientName: user?.fullName,
                  })}
                >
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
                <Button onClick={() => setShowRecordModal(false)} className="flex-1 bg-cyan-600 hover:bg-cyan-700">Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Footer />

      {/* Upload Lab Report Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#344256]">Upload Lab Report</h2>
              <button onClick={() => { setShowUploadModal(false); setUploadForm({ title: '', description: '', file: null, appointmentId: null }); }}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Report Title <span className="text-red-500">*</span></Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. Blood Test, X-Ray, MRI"
                  value={uploadForm.title}
                  onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[70px]"
                  placeholder="Any notes about this report..."
                  value={uploadForm.description}
                  onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label>File <span className="text-red-500">*</span></Label>
                <div className="mt-1 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-cyan-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="lab-file-input"
                    onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  />
                  <label htmlFor="lab-file-input" className="cursor-pointer">
                    {uploadForm.file ? (
                      <div>
                        <p className="text-sm font-medium text-cyan-700">{uploadForm.file.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{(uploadForm.file.size / 1024).toFixed(0)} KB</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to select file</p>
                        <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG — max 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleUploadLabReport}
                  disabled={uploading || !uploadForm.title || !uploadForm.file}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  {uploading ? 'Uploading...' : 'Upload Report'}
                </Button>
                <Button onClick={() => { setShowUploadModal(false); setUploadForm({ title: '', description: '', file: null, appointmentId: null }); }} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

