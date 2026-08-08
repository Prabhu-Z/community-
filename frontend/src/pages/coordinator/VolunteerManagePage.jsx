import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Check, X, Building2 } from 'lucide-react';

const VolunteerManagePage = () => {
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [hoursList, setHoursList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityAndHours();
  }, [user]);

  const fetchCommunityAndHours = async () => {
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
        const res = await api.get('/volunteer-hours/pending');
        setHoursList(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching volunteer hours:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/volunteer-hours/${id}/verify?status=${status}`);
      fetchCommunityAndHours();
    } catch (err) {
      alert('Verification status update failed.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading pending volunteer hours..." />;

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
        <h1 className="font-sans text-3xl font-extrabold text-slate-900">Volunteer Hours Verification</h1>
        <p className="text-xs text-slate-600 mt-1">Review and approve student service hours before inclusion in official totals.</p>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white text-[#7c3aed] font-sans border-b border-slate-100">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Register Code</th>
                <th className="p-3">Activity / Drive</th>
                <th className="p-3">Community</th>
                <th className="p-3">Hours Logged</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-almond-300/5">
              {hoursList && hoursList.length > 0 ? (
                hoursList.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-100/40">
                    <td className="p-3 font-sans font-bold text-slate-900">{h.studentName}</td>
                    <td className="p-3 font-mono">{h.studentCode}</td>
                    <td className="p-3 font-medium text-almond-100">{h.activityName}</td>
                    <td className="p-3 font-sans text-[#7c3aed]">{h.communityName}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{h.hours} hrs</td>
                    <td className="p-3 font-mono">{h.activityDate}</td>
                    <td className="p-3 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleVerify(h.id, 'VERIFIED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Verify
                      </button>
                      <button
                        onClick={() => handleVerify(h.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 font-bold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No pending volunteer hours to verify.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VolunteerManagePage;
