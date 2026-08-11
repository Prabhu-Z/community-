import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PrintReportModal from '../../components/reports/PrintReportModal';
import { FileText, Printer, Building2, User } from 'lucide-react';

const CoordinatorReportsPage = () => {
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchCommunities();
  }, [user]);

  const fetchCommunities = async () => {
    try {
      const res = await api.get('/communities');
      let myCommunity = null;

      if (res.data && res.data.length > 0) {
        myCommunity =
          res.data.find(
            (c) =>
              c.coordinatorUserId === user?.id ||
              (user?.email &&
                (c.studentCoordinator?.toLowerCase().includes(user.email.toLowerCase()) ||
                  c.facultyCoordinator?.toLowerCase().includes(user.email.toLowerCase())))
          ) || null;
      }

      setCommunity(myCommunity);
      if (myCommunity) {
        setCommunities([myCommunity]);
        
        // Fetch approved members of this community
        const memsRes = await api.get(`/memberships/community/${myCommunity.id}`);
        setMembers((memsRes.data || []).filter(m => m.status === 'APPROVED'));
      } else {
        setCommunities([]);
        setMembers([]);
      }
    } catch (err) {
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (communityId) => {
    try {
      const res = await api.get(`/reports/community/${communityId}`);
      setReportData(res.data);
      setReportModal(true);
    } catch (err) {
      alert('Failed to generate community report.');
    }
  };

  const handleGenerateStudentReport = async (studentId) => {
    try {
      const res = await api.get(`/reports/student/${studentId}`);
      setReportData(res.data);
      setReportModal(true);
    } catch (err) {
      alert('Failed to generate student report.');
    }
  };

  const handleDownloadCsv = async (communityId, communityName) => {
    try {
      const response = await api.get(`/reports/community/${communityId}/csv`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${communityName.replace(/\s+/g, '_')}_student_metrics_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to download CSV report.');
    }
  };

  const handleDownloadStudentCsv = async (studentId, studentName) => {
    try {
      const response = await api.get(`/reports/student/${studentId}/csv`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentName.replace(/\s+/g, '_')}_performance_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to download student CSV report.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading reporting suite..." />;

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
      <div>
        <h1 className="font-sans text-3xl font-extrabold text-slate-900">Community Performance Reports</h1>
        <p className="text-xs text-slate-600 mt-1">Generate official PDF/Print reports for membership, event metrics, and volunteer hours.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {communities.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-sans text-xl font-bold text-slate-900">{c.name}</h3>
              <p className="text-xs text-[#7c3aed] font-sans">{c.category}</p>
              <p className="text-xs text-slate-500 mt-1">Admin Lead: {c.facultyCoordinator}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDownloadCsv(c.id, c.name)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-[#7c3aed] transition flex items-center gap-1.5 justify-center shadow-sm"
              >
                <FileText className="w-4 h-4" /> Export CSV Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Community Members List for Transcripts */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-100">
        <h3 className="font-sans text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#8b5cf6]" /> Community Member Transcripts ({members.length})
        </h3>
        <div className="space-y-3">
          {members.length > 0 ? (
            members.map((m) => (
              <div key={m.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-sans font-bold text-slate-900 text-base">{m.studentName}</span>
                  <p className="text-xs text-slate-500 font-mono">Code: {m.studentCode} • {m.department} • Role: {m.role}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadStudentCsv(m.studentId, m.studentName)}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-[#7c3aed] transition flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">No approved members in this community chapter yet.</p>
          )}
        </div>
      </div>

      <PrintReportModal isOpen={reportModal} onClose={() => setReportModal(false)} reportData={reportData} />
    </div>
  );
};

export default CoordinatorReportsPage;
