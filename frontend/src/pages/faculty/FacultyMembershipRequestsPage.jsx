import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Check, X, ShieldCheck, UserCheck, Calendar, Sparkles, Building2, User, Filter, Eye } from 'lucide-react';

const FacultyMembershipRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [reqRes, commRes] = await Promise.all([
        api.get('/memberships/admin/pending'),
        api.get('/communities').catch(() => ({ data: [] }))
      ]);
      setRequests(reqRes.data || []);
      setCommunities(commRes.data || []);
    } catch (err) {
      console.error('Error fetching initial requests & communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/memberships/admin/pending');
      setRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching pending applications:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      await api.put(`/memberships/${id}/approve`);
      await fetchRequests();
    } catch (err) {
      alert('Approval failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setLoading(true);
      await api.put(`/memberships/${id}/reject`);
      await fetchRequests();
    } catch (err) {
      alert('Rejection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on selected community
  const filteredRequests = requests.filter(r => {
    if (selectedCommunityId === 'ALL') return true;
    return r.communityId.toString() === selectedCommunityId.toString();
  });

  const handleApproveAll = async () => {
    if (filteredRequests.length === 0) return;
    if (!window.confirm(`Are you sure you want to approve all ${filteredRequests.length} join requests currently filtered?`)) return;
    
    try {
      setLoading(true);
      await Promise.all(
        filteredRequests.map(r => api.put(`/memberships/${r.id}/approve`))
      );
      alert(`🎉 Successfully approved all ${filteredRequests.length} requests!`);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to approve all requests:', err);
      alert('Failed to approve some requests.');
      await fetchRequests();
    } finally {
      setLoading(false);
    }
  };

  if (loading && requests.length === 0) return <LoadingSpinner label="Loading pending community applications..." />;

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7c3aed]" /> Admin Governance Oversight
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Community Join Requests
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium">
            Grant final approval or decline pending student applications to join official campus communities.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-purple-50 text-[#7c3aed] border border-purple-200 text-xs font-mono font-bold flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-[#8b5cf6]" /> {requests.length} Requests Pending
        </div>
      </div>

      {/* Filter and Bulk Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm rounded-3xl p-3">
        {/* Community Filter */}
        <div className="relative w-full sm:w-72">
          <select
            value={selectedCommunityId}
            onChange={(e) => setSelectedCommunityId(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-extrabold focus:outline-none focus:border-[#8b5cf6] cursor-pointer appearance-none"
          >
            <option value="ALL">All Communities</option>
            {communities.map(c => (
              <option key={c.id} value={c.id.toString()}>{c.name}</option>
            ))}
          </select>
          <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Approve All Button */}
        {filteredRequests.length > 0 && (
          <button
            onClick={handleApproveAll}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Check className="w-4 h-4" /> Approve All Filtered ({filteredRequests.length})
          </button>
        )}
      </div>

      {/* Requests Grid */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition duration-205 relative group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7c3aed] border border-purple-100">
                    {req.communityCategory || 'Technical'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    Req #{req.id}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {req.studentName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Reg No: {req.studentCode} ({req.department})
                  </p>
                  <p className="text-xs text-[#7c3aed] font-bold mt-1.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#8b5cf6]" /> {req.communityName}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    req.coordinatorApproved 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {req.coordinatorApproved ? '✓ Coordinator Approved' : '⏳ Pending Coordinator'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
                    ⏳ Pending Admin
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/faculty/students/${req.studentId || req.id}`)}
                  className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] border border-purple-200 transition active:scale-95"
                  title="View Student Extracurricular Portfolio Dashboard"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(req.id)}
                  className="flex-1 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-purple-500/10"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <Building2 className="w-16 h-16 text-[#7c3aed]/50 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">All Caught Up!</h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              No pending community membership requests matched your selected filter.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyMembershipRequestsPage;
