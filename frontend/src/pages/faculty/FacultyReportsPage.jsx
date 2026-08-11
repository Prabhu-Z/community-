import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PrintReportModal from '../../components/reports/PrintReportModal';
import { FileText, Printer, Building2, User } from 'lucide-react';

const FacultyReportsPage = () => {
  const [students, setStudents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [studentRes, commsRes] = await Promise.all([
        api.get('/students'),
        api.get('/communities'),
      ]);
      setStudents(studentRes.data || []);
      setCommunities(commsRes.data || []);
    } catch (err) {
      console.error('Error fetching reporting data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStudentReport = async (studentId) => {
    try {
      const res = await api.get(`/reports/student/${studentId}`);
      setReportData(res.data);
      setReportModal(true);
    } catch (err) {
      alert('Failed to generate report.');
    }
  };

  const handleDownloadAllCsv = async () => {
    try {
      const response = await api.get('/reports/all/csv', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `all_communities_performance_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to download CSV report.');
    }
  };

  const handleDownloadCommunityCsv = async (communityId, communityName) => {
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
      alert('Failed to download community CSV report.');
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

  if (loading) return <LoadingSpinner label="Loading faculty report generator..." />;

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900">College Official Reports Suite</h1>
          <p className="text-xs text-slate-600 mt-1">Export official student activity transcripts and community performance summaries.</p>
        </div>
        <button
          onClick={handleDownloadAllCsv}
          className="px-5 py-3 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-[#7c3aed] transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" /> Export All Communities CSV
        </button>
      </div>

      {/* Community-Wise CSV Reports Section */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-100">
        <h3 className="font-sans text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#8b5cf6]" /> Community-Wise CSV Exports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.length > 0 ? (
            communities.map((c) => (
              <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <span className="font-sans font-bold text-slate-900 text-sm">{c.name}</span>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">{c.category}</p>
                </div>
                <button
                  onClick={() => handleDownloadCommunityCsv(c.id, c.name)}
                  className="w-full py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-[#7c3aed] transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-4 h-4" /> Download CSV Report
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">No active communities found.</p>
          )}
        </div>
      </div>

      {/* Students CSV & PDF Transcripts Section */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-100">
        <h3 className="font-sans text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#8b5cf6]" /> Student Transcripts & Portfolios ({students.length})
        </h3>
        <div className="space-y-3">
          {students.length > 0 ? (
            students.map((s) => (
              <div key={s.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-sans font-bold text-slate-900 text-base">{s.name}</span>
                  <p className="text-xs text-slate-500 font-mono">Code: {s.studentCode} • {s.department}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadStudentCsv(s.id, s.name)}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-[#7c3aed] transition flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">No students registered in SCTS.</p>
          )}
        </div>
      </div>

      <PrintReportModal isOpen={reportModal} onClose={() => setReportModal(false)} reportData={reportData} />
    </div>
  );
};

export default FacultyReportsPage;
