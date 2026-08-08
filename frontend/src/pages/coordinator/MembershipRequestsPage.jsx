import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Check, X, ShieldCheck, UserCheck, Calendar, Sparkles, Building2 } from 'lucide-react';

const MembershipRequestsPage = () => {
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityAndRequests();
  }, [user]);

  const fetchCommunityAndRequests = async () => {
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
        // Fetch pending requests STRICTLY for this coordinator's community
        const reqRes = await api.get(`/memberships/community/${myCommunity.id}/pending`);
        setRequests(reqRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching coordinator pending applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/memberships/${id}/approve`);
      fetchCommunityAndRequests();
    } catch (err) {
      alert('Approval failed.');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/memberships/${id}/reject`);
      fetchCommunityAndRequests();
    } catch (err) {
      alert('Rejection failed.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading pending membership applications..." />;

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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7c3aed]" /> Coordinator Authority Scope • {community.name}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Pending Membership Applications
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium">
            Review, approve, or decline pending student applications specifically for <strong>{community.name}</strong>.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-[#8b5cf6] text-white/10 border border-[#8b5cf6]/30 text-[#7c3aed] text-xs font-mono font-bold flex items-center gap-2">
          <UserCheck className="w-4 h-4" /> {requests.length} Pending Review
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-2xl">
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-800">
            {/* Header: Pure Black / Obsidian with Celestial Gold stroke and text */}
            <thead className="bg-[#121216] text-[#7c3aed] font-bold uppercase tracking-wider border-b border-[#8b5cf6]/20">
              <tr>
                <th className="p-4 font-extrabold">Student Name</th>
                <th className="p-4 font-extrabold">Register Code</th>
                <th className="p-4 font-extrabold">Department</th>
                <th className="p-4 font-extrabold">Target Community</th>
                <th className="p-4 font-extrabold">Requested Role</th>
                <th className="p-4 font-extrabold">Application Date</th>
                <th className="p-4 text-right font-extrabold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-white text-slate-900/40">
              {requests && requests.length > 0 ? (
                requests.map((r, index) => (
                  <tr
                    key={r.id}
                    className="hover:bg-[#8b5cf6] text-white/10 transition-all duration-300 group hover:translate-x-1"
                  >
                    <td className="p-4 font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors">
                      {r.studentName}
                    </td>
                    <td className="p-4 font-mono text-slate-600">{r.studentCode}</td>
                    <td className="p-4">{r.department}</td>
                    <td className="p-4 font-bold text-[#7c3aed]">{r.communityName}</td>
                    <td className="p-4">
                      <Badge status={r.role}>{r.role}</Badge>
                    </td>
                    <td className="p-4 font-mono text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#7c3aed]/70" /> {r.joinedDate}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-[#3C2F00] border border-emerald-500/40 font-extrabold flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Accept
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-[#7c3aed] border border-rose-500/40 font-extrabold flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" /> Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-600/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Sparkles className="w-8 h-8 text-[#7c3aed]/50 animate-pulse" />
                      <p className="font-semibold text-sm">No pending membership applications found for {community.name}.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembershipRequestsPage;
