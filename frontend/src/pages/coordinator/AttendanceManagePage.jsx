import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { CheckSquare, Check, X, Building2 } from 'lucide-react';

const AttendanceManagePage = () => {
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityAndEvents();
  }, [user]);

  const fetchCommunityAndEvents = async () => {
    try {
      const commRes = await api.get('/communities');
      let myCommunity = null;

      if (commRes.data && commRes.data.length > 0) {
        myCommunity =
          commRes.data.find(
            (c) =>
              c.coordinatorUserId === user?.id ||
              (user?.email &&
                (c.studentCoordinator?.toLowerCase().includes(user.email.toLowerCase()) ||
                  c.facultyCoordinator?.toLowerCase().includes(user.email.toLowerCase())))
          ) || null;
      }

      setCommunity(myCommunity);

      if (myCommunity?.id) {
        const res = await api.get('/events');
        const commEvents = (res.data || []).filter(e => e.communityId === myCommunity.id);
        setEvents(commEvents);
        if (commEvents.length > 0) {
          setSelectedEventId(commEvents[0].id);
          fetchAttendance(commEvents[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (eventId) => {
    try {
      const res = await api.get(`/attendance/event/${eventId}`);
      setAttendanceList(res.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const handleToggleAttendance = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    try {
      await api.post(`/attendance?eventId=${selectedEventId}&studentId=${studentId}&status=${newStatus}`);
      fetchAttendance(selectedEventId);
    } catch (err) {
      alert('Failed to update attendance.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading attendance management portal..." />;

  if (!community || !community.id) {
    return (
      <div className="space-y-8 p-4 lg:p-8">
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-4 shadow-xl">
          <Building2 className="w-16 h-16 text-[#7c3aed]/50 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-[#7c3aed]xl font-extrabold text-slate-900">No Communities Assigned</h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You currently have no assigned community. Please contact your Super Admin to be assigned as a Faculty Coordinator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900">Event Attendance Recording</h1>
          <p className="text-xs text-slate-600 mt-1">Mark student participants PRESENT or ABSENT for official records.</p>
        </div>

        <select
          value={selectedEventId}
          onChange={(e) => {
            setSelectedEventId(e.target.value);
            fetchAttendance(e.target.value);
          }}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-sans text-xs"
        >
          {events.map((e) => (
            <option key={e.id} value={e.id} className="bg-white text-slate-900">
              {e.title} ({e.eventDate})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white text-[#7c3aed] font-sans border-b border-slate-100">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Register Code</th>
                <th className="p-3">Recorded Time</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Toggle Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-almond-300/5">
              {attendanceList && attendanceList.length > 0 ? (
                attendanceList.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-100/40">
                    <td className="p-3 font-sans font-bold text-slate-900">{att.studentName}</td>
                    <td className="p-3 font-mono">{att.studentCode}</td>
                    <td className="p-3 font-mono text-slate-500">{att.recordedTime ? new Date(att.recordedTime).toLocaleString() : 'N/A'}</td>
                    <td className="p-3"><Badge status={att.status}>{att.status}</Badge></td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleAttendance(att.studentId, att.status)}
                        className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 ml-auto text-xs ${
                          att.status === 'PRESENT'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                        }`}
                      >
                        {att.status === 'PRESENT' ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        {att.status === 'PRESENT' ? 'Mark Absent' : 'Mark Present'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No registered students found for selected event.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagePage;
