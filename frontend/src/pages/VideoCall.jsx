import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, FileText, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE = 'http://localhost:5000/api';
AgoraRTC.setLogLevel(4);

export default function VideoCall() {
  const [searchParams] = useSearchParams();
  const navigate      = useNavigate();
  const channel       = searchParams.get('channel') || 'default';
  const myRole        = searchParams.get('role') || 'Doctor';
  const appointmentId = channel.replace('apt_', '');
  const remoteRole    = myRole === 'Doctor' ? 'Patient' : 'Doctor';
  const isDoctor      = myRole === 'Doctor';

  const [status, setStatus]         = useState('connecting');
  const [error, setError]           = useState('');
  const [muted, setMuted]           = useState(false);
  const [camOff, setCamOff]         = useState(false);
  const [remoteUids, setRemoteUids] = useState([]);
  const [ending, setEnding]         = useState(false);

  // Notes panel (doctor only)
  const [showNotes, setShowNotes]   = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const [notes, setNotes] = useState({
    chiefComplaint: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    advice: '',
    testsRequired: '',
    prescriptions: [{ name: '', dosage: '', duration: '', instructions: '' }],
  });

  const clientRef   = useRef(null);
  const audioRef    = useRef(null);
  const videoRef    = useRef(null);
  const localDivRef = useRef(null);
  const joinedRef   = useRef(false);

  useEffect(() => {
    if (joinedRef.current) return;
    joinedRef.current = true;

    const join = async () => {
      try {
        const jwtToken = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/agora/token?channel=${channel}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        const { appId, token: agoraToken } = res.data;

        if (!appId || appId === 'your_agora_app_id') {
          setError('Agora App ID not configured in backend .env');
          setStatus('error');
          return;
        }

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video') {
            setRemoteUids(prev => prev.includes(user.uid) ? prev : [...prev, user.uid]);
            setTimeout(() => user.videoTrack?.play(`remote-${user.uid}`), 300);
          }
          if (mediaType === 'audio') user.audioTrack?.play();
        });

        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video') setRemoteUids(prev => prev.filter(u => u !== user.uid));
        });

        client.on('user-left', (user) => {
          setRemoteUids(prev => prev.filter(u => u !== user.uid));
        });

        const uid = Math.floor(Math.random() * 100000);
        await client.join(appId, channel, agoraToken, uid);

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          {}, { encoderConfig: '480p_1' }
        );
        audioRef.current = audioTrack;
        videoRef.current = videoTrack;
        await client.publish([audioTrack, videoTrack]);

        if (localDivRef.current) videoTrack.play(localDivRef.current);
        setStatus('connected');
      } catch (err) {
        console.error('Agora error:', err);
        setError(err.message || 'Failed to join');
        setStatus('error');
      }
    };

    join();

    return () => {
      audioRef.current?.stop(); audioRef.current?.close();
      videoRef.current?.stop(); videoRef.current?.close();
      clientRef.current?.leave();
    };
  }, []);

  useEffect(() => {
    if (status === 'connected' && localDivRef.current && videoRef.current) {
      videoRef.current.play(localDivRef.current);
    }
  }, [status]);

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    try {
      const token = localStorage.getItem('token');
      // Save appointment note
      await axios.post(`${API_BASE}/doctor/appointments/${appointmentId}/note`,
        { ...notes, prescriptions: notes.prescriptions.filter(p => p.name.trim()) },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      // Fetch appointment to get patientId for medical record
      const aptRes = await axios.get(`${API_BASE}/doctor/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apt = (aptRes.data.appointments || []).find(a => String(a.id) === String(appointmentId));
      if (apt) {
        await axios.post(`${API_BASE}/doctor/medical-records`, {
          patientId: apt.patientId,
          appointmentId,
          recordType: 'Consultation',
          title: `Online Consultation`,
          ...notes,
          prescriptions: notes.prescriptions.filter(p => p.name.trim()),
          status: 'Completed',
          recordDate: new Date().toISOString().split('T')[0],
        }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      }
      toast.success('Notes saved successfully!');
    } catch (err) {
      toast.error('Failed to save notes: ' + (err.response?.data?.error || 'Server error'));
    } finally {
      setNotesSaving(false);
    }
  };

  const endCall = async () => {
    setEnding(true);
    audioRef.current?.stop(); audioRef.current?.close();
    videoRef.current?.stop(); videoRef.current?.close();
    await clientRef.current?.leave();

    if (isDoctor) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${API_BASE}/doctor/appointments/${appointmentId}/status`,
          { status: 'completed' },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        console.log('✅ Appointment marked completed:', response.data);
        toast.success('Appointment marked as completed');
      } catch (e) {
        console.error('Failed to mark completed:', e.response?.data || e.message);
        toast.error('Could not update appointment status: ' + (e.response?.data?.error || e.message));
        // Retry once
        try {
          const token = localStorage.getItem('token');
          await axios.put(
            `${API_BASE}/doctor/appointments/${appointmentId}/status`,
            { status: 'completed' },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
        } catch (e2) { console.error('Retry failed:', e2.response?.data || e2.message); }
      }
      setTimeout(() => navigate('/doctor'), 2500);
    } else {
      setTimeout(() => navigate('/user'), 2500);
    }
  };

  const toggleMute = () => { const n = !muted; audioRef.current?.setEnabled(!n); setMuted(n); };
  const toggleCam  = () => { const n = !camOff; videoRef.current?.setEnabled(!n); setCamOff(n); };

  const addPrescription = () => setNotes(prev => ({
    ...prev,
    prescriptions: [...prev.prescriptions, { name: '', dosage: '', duration: '', instructions: '' }],
  }));

  const updatePrescription = (i, field, val) => setNotes(prev => {
    const arr = [...prev.prescriptions];
    arr[i] = { ...arr[i], [field]: val };
    return { ...prev, prescriptions: arr };
  });

  // Post-call screen
  if (ending) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white px-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">✓</span>
          </div>
          {myRole === 'Patient' ? (
            <>
              <h2 className="text-2xl font-bold mb-3">Consultation Completed</h2>
              <p className="text-gray-300">Your online consultation is complete.</p>
              <p className="text-gray-400 text-sm mt-1">Kindly wait for your report from the doctor.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-3">Call Ended</h2>
              <p className="text-gray-300">Appointment marked as completed.</p>
              <p className="text-gray-400 text-sm mt-1">Redirecting to dashboard...</p>
            </>
          )}
          <Loader2 className="w-5 h-5 animate-spin mx-auto mt-5 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 flex-shrink-0">
        <div>
          <p className="text-white font-semibold">Video Consultation</p>
          <p className="text-gray-400 text-xs">Room: {channel}</p>
        </div>
        <div className="flex items-center gap-3">
          {isDoctor && status === 'connected' && (
            <button
              onClick={() => setShowNotes(v => !v)}
              className="flex items-center gap-1.5 text-xs bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              {showNotes ? 'Hide Notes' : 'Consultation Notes'}
              {showNotes ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
          )}
          {status === 'connecting' && (
            <span className="flex items-center gap-1 text-yellow-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
            </span>
          )}
          {status === 'connected' && (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" /> Live
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-lg font-semibold mb-2">Failed to join</p>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <button onClick={() => navigate(-1)} className="px-4 py-2 border border-white text-white rounded-lg">
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      {status !== 'error' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Video area */}
          <div className={`flex-1 p-4 grid gap-4 content-start ${remoteUids.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}
            style={{ gridAutoRows: 'minmax(0, 1fr)' }}>
            <div className="relative bg-gray-800 rounded-2xl overflow-hidden" style={{ minHeight: 280 }}>
              <div ref={localDivRef} style={{ width: '100%', height: '100%', minHeight: 280 }} />
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {myRole} (You){camOff ? ' · Camera off' : ''}
              </div>
            </div>

            {remoteUids.slice(0, 1).map(uid => (
              <div key={uid} className="relative bg-gray-800 rounded-2xl overflow-hidden" style={{ minHeight: 280 }}>
                <div id={`remote-${uid}`} style={{ width: '100%', height: '100%', minHeight: 280 }} />
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {remoteRole}
                </div>
              </div>
            ))}

            {status === 'connected' && remoteUids.length === 0 && (
              <div className="bg-gray-800 rounded-2xl flex items-center justify-center" style={{ minHeight: 280 }}>
                <div className="text-center text-gray-400">
                  <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin opacity-40" />
                  <p>Waiting for {remoteRole} to join...</p>
                </div>
              </div>
            )}
          </div>

          {/* Notes panel — doctor only */}
          {isDoctor && showNotes && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden flex-shrink-0">
              <div className="px-4 py-3 bg-gray-700 flex items-center justify-between">
                <p className="text-white text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> Consultation Notes
                </p>
                <button onClick={() => setShowNotes(false)} className="text-gray-400 hover:text-white text-xs">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {[
                  { key: 'chiefComplaint', label: 'Chief Complaint', rows: 2 },
                  { key: 'diagnosis', label: 'Diagnosis', rows: 2 },
                  { key: 'symptoms', label: 'Symptoms', rows: 2 },
                  { key: 'treatment', label: 'Treatment Plan', rows: 2 },
                  { key: 'advice', label: 'Advice', rows: 2 },
                  { key: 'testsRequired', label: 'Tests Required', rows: 1 },
                ].map(({ key, label, rows }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                    <textarea
                      rows={rows}
                      value={notes[key]}
                      onChange={e => setNotes(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full bg-gray-700 text-white text-xs px-2 py-1.5 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
                      placeholder={label}
                    />
                  </div>
                ))}

                {/* Prescriptions */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Prescriptions</label>
                  {notes.prescriptions.map((p, i) => (
                    <div key={i} className="bg-gray-700 rounded-lg p-2 mb-2 space-y-1">
                      <input value={p.name} onChange={e => updatePrescription(i, 'name', e.target.value)}
                        placeholder="Medicine name" className="w-full bg-gray-600 text-white text-xs px-2 py-1 rounded border border-gray-500 focus:outline-none focus:border-cyan-500" />
                      <div className="grid grid-cols-2 gap-1">
                        <input value={p.dosage} onChange={e => updatePrescription(i, 'dosage', e.target.value)}
                          placeholder="Dosage" className="bg-gray-600 text-white text-xs px-2 py-1 rounded border border-gray-500 focus:outline-none focus:border-cyan-500" />
                        <input value={p.duration} onChange={e => updatePrescription(i, 'duration', e.target.value)}
                          placeholder="Duration" className="bg-gray-600 text-white text-xs px-2 py-1 rounded border border-gray-500 focus:outline-none focus:border-cyan-500" />
                      </div>
                      <input value={p.instructions} onChange={e => updatePrescription(i, 'instructions', e.target.value)}
                        placeholder="Instructions" className="w-full bg-gray-600 text-white text-xs px-2 py-1 rounded border border-gray-500 focus:outline-none focus:border-cyan-500" />
                    </div>
                  ))}
                  <button onClick={addPrescription} className="text-xs text-cyan-400 hover:text-cyan-300">+ Add Medicine</button>
                </div>
              </div>
              <div className="p-3 border-t border-gray-700">
                <button
                  onClick={handleSaveNotes}
                  disabled={notesSaving}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {notesSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {notesSaving ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      {status !== 'error' && (
        <div className="flex items-center justify-center gap-4 py-5 bg-gray-800 flex-shrink-0">
          <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center ${muted ? 'bg-red-500' : 'bg-gray-600'}`}>
            {muted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
          </button>
          <button onClick={toggleCam} className={`w-12 h-12 rounded-full flex items-center justify-center ${camOff ? 'bg-red-500' : 'bg-gray-600'}`}>
            {camOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
          </button>
          <button onClick={endCall} className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center">
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
