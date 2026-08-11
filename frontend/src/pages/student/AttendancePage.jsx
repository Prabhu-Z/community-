import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { CheckCircle2, Award, CalendarCheck, Camera, QrCode, Key, Send } from 'lucide-react';

const AttendancePage = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check-in states
  const [studentId, setStudentId] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [selectedCheckinEventId, setSelectedCheckinEventId] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Load html5-qrcode library dynamically from unpkg CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/html5-qrcode";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchStudentDataAndAttendance = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      let studentIdParam = user?.studentId;
      if (!studentIdParam && user?.id) {
        try {
          const profileRes = await api.get(`/students/user/${user.id}`);
          if (profileRes.data && profileRes.data.id) {
            studentIdParam = profileRes.data.id;
          }
        } catch (e) {
          console.warn('Could not fetch student profile:', e);
        }
      }

      setStudentId(studentIdParam);

      if (studentIdParam) {
        // Fetch student's attendance logs
        const attRes = await api.get(`/attendance/student/${studentIdParam}`);
        setAttendance(attRes.data || []);

        // Fetch student's registered events (where user is registered & event is upcoming)
        const eventsRes = await api.get(`/events?studentId=${studentIdParam}`);
        const activeRegs = (eventsRes.data || []).filter(e => e.isUserRegistered && e.status === 'UPCOMING');
        setRegisteredEvents(activeRegs);
        if (activeRegs.length > 0) {
          setSelectedCheckinEventId(activeRegs[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching student attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDataAndAttendance();
  }, [user]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCheckinEventId) {
      alert('Please select an event to check-in.');
      return;
    }
    if (!otpValue || otpValue.trim().length !== 4) {
      alert('Please enter a valid 4-digit OTP code.');
      return;
    }
    setCheckingIn(true);
    try {
      await api.post(`/attendance/check-in?eventId=${selectedCheckinEventId}&studentId=${studentId}&otp=${otpValue.trim()}`);
      
      // Audio chime
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {}

      alert('🎉 Checked in successfully! Your attendance is recorded.');
      setOtpValue('');
      fetchStudentDataAndAttendance();
    } catch (err) {
      alert('Check-in failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setCheckingIn(false);
    }
  };

  const startScanner = () => {
    if (!window.Html5QrcodeScanner) {
      alert("QR Scanner library is still loading. Please try again in a moment.");
      return;
    }
    setScannerOpen(true);
    setTimeout(() => {
      const html5QrcodeScanner = new window.Html5QrcodeScanner(
        "student-qr-reader", { fps: 10, qrbox: 250 }
      );
      
      const onScanSuccess = async (decodedText) => {
        html5QrcodeScanner.clear();
        setScannerOpen(false);

        // Parse: scts-checkin:eventId:otp
        if (decodedText.startsWith('scts-checkin:')) {
          const parts = decodedText.split(':');
          const eventId = parts[1];
          const otp = parts[2];

          try {
            await api.post(`/attendance/check-in?eventId=${eventId}&studentId=${studentId}&otp=${otp}`);
            
            // Success audio chime
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.setValueAtTime(880, audioCtx.currentTime);
              gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.15);
            } catch (e) {}

            alert('🎉 Checked in successfully via QR Scan! Your attendance is recorded.');
            fetchStudentDataAndAttendance();
          } catch (err) {
            alert('Check-in failed: ' + (err.response?.data?.message || err.message));
          }
        } else {
          alert('Invalid check-in QR Code format.');
        }
      };

      html5QrcodeScanner.render(onScanSuccess, () => {});
      window.activeStudentScanner = html5QrcodeScanner;
    }, 150);
  };

  const closeScanner = () => {
    if (window.activeStudentScanner) {
      try {
        window.activeStudentScanner.clear();
      } catch (e) {}
    }
    setScannerOpen(false);
  };

  if (loading) return <LoadingSpinner label="Loading verified attendance records..." />;

  const columns = [
    {
      header: 'Event Title & Category',
      accessor: 'eventTitle',
      cell: (r) => (
        <div>
          <div className="font-sans font-bold text-slate-900 text-sm">{r.eventTitle}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Record ID: #{r.id}
          </div>
        </div>
      ),
    },
    {
      header: 'Organizing Community',
      accessor: 'communityName',
      cell: (r) => <span className="font-sans font-bold text-[#7c3aed]">{r.communityName}</span>,
    },
    {
      header: 'Recorded Timestamp',
      accessor: 'recordedTime',
      cell: (r) => (
        <span className="font-mono text-xs text-slate-600">
          {r.recordedTime ? new Date(r.recordedTime).toLocaleString() : 'Recently Verified'}
        </span>
      ),
    },
    {
      header: 'Verification Status',
      accessor: 'status',
      cell: (r) => <Badge status={r.status || 'ATTENDED'}>{r.status || 'ATTENDED'}</Badge>,
    },
  ];

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sans font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-[#7c3aed]" /> Official Verification Log
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900 mt-1">Event Attendance Log</h1>
          <p className="text-xs text-slate-600 mt-1">
            Official verified event attendance records for extracurricular participation.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/90 px-4 py-2.5 rounded-2xl border border-slate-200 self-start sm:self-auto font-mono text-xs shadow-sm">
          <Award className="w-4 h-4 text-emerald-500" />
          <span>Verified Attendance: <strong className="text-emerald-700 font-bold">{attendance.length} Logged</strong></span>
        </div>
      </div>

      {/* EVENT CHECK-IN PANEL */}
      {studentId && registeredEvents.length > 0 && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Scan Box */}
          <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8 space-y-4">
            <div>
              <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4" /> Option 1: Instant Scanning
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Scan Check-in QR Code</h2>
              <p className="text-xs text-slate-500 mt-1">
                Scan the check-in QR Code projected on the coordinator's screen.
              </p>
            </div>
            
            <button
              onClick={startScanner}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-[#8b5cf6] text-black font-extrabold text-sm shadow-md hover:scale-[1.02] transition flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" /> Launch Check-in Camera
            </button>
          </div>

          {/* OTP Box */}
          <form onSubmit={handleOtpSubmit} className="flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4" /> Option 2: OTP Keypad
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">Enter Check-in OTP</h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your event and enter the 4-digit OTP shown on the coordinator's board.
              </p>
            </div>

            <div className="space-y-3">
              <select
                value={selectedCheckinEventId}
                onChange={(e) => setSelectedCheckinEventId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-sans text-xs font-bold shadow-sm"
              >
                {registeredEvents.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.communityName})
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 5849"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-center text-sm font-extrabold tracking-widest bg-slate-50 focus:ring-2 focus:ring-[#8b5cf6]/50 outline-none text-slate-900"
                />
                <button
                  type="submit"
                  disabled={checkingIn}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> {checkingIn ? 'Verifying...' : 'Check-in'}
                </button>
              </div>
            </div>
          </form>

        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-200 space-y-4">
        <h3 className="font-sans text-xl font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Verified On-Site Attendance Records ({attendance.length})
        </h3>

        <DataTable
          columns={columns}
          data={attendance}
          emptyMessage="No verified event attendance records logged yet."
        />
      </div>

      {/* STUDENT CAMERA QR SCANNER MODAL */}
      {scannerOpen && (
        <Modal
          isOpen={scannerOpen}
          onClose={closeScanner}
          title="Scan Check-in QR Code"
        >
          <div className="space-y-4 text-xs text-slate-800 text-center">
            <p className="text-slate-500 leading-relaxed font-medium">
              Point your camera at the check-in QR Code projected on the coordinator's dashboard.
            </p>
            
            <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-inner p-2">
              <div id="student-qr-reader" className="w-full"></div>
            </div>
            
            <div className="pt-3 border-t border-slate-150 flex justify-end">
              <button
                type="button"
                onClick={closeScanner}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AttendancePage;
