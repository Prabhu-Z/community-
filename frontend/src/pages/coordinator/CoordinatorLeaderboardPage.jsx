import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Trophy, Award, Medal, Crown, Star, Users, ShieldCheck, Building2 } from 'lucide-react';

const CoordinatorLeaderboardPage = () => {
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityAndLeaderboard();
  }, [user]);

  const fetchCommunityAndLeaderboard = async () => {
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
        const lbRes = await api.get(`/leaderboard/community/${myCommunity.id}`);
        setLeaderboard(lbRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching coordinator leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading community member leaderboard..." />;

  if (!community || !community.id) {
    return (
      <div className="space-y-8 p-2 lg:p-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-12 text-center space-y-4">
          <Building2 className="w-16 h-16 text-[#8b5cf6] mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">No Communities Assigned</h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You currently have no assigned community. Please contact your Super Admin to be assigned as a Faculty Coordinator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="space-y-8 p-2 lg:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8b5cf6]" /> {community?.name || 'Community'} Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Community Member Leaderboard</h1>
          <p className="text-xs text-slate-600 mt-1">
            Student ranking based strictly on verified task completed points in <strong>{community?.name}</strong>.
          </p>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3.map((st, index) => {
            let badgeBg = 'bg-amber-100 text-amber-900';
            let medalIcon = <Trophy className="w-6 h-6 text-amber-800" />;

            if (st.rank === 2) {
              badgeBg = 'bg-slate-100 text-slate-800';
              medalIcon = <Medal className="w-6 h-6 text-slate-700" />;
            } else if (st.rank === 3) {
              badgeBg = 'bg-amber-50 text-amber-900';
              medalIcon = <Award className="w-6 h-6 text-amber-800" />;
            }

            return (
              <div key={st.studentId || index} className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 text-center space-y-3 relative">
                <div className={`w-14 h-14 mx-auto rounded-2xl ${badgeBg} flex items-center justify-center shadow-sm`}>
                  {medalIcon}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{st.studentName}</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{st.department}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 font-bold text-[#7c3aed] text-sm">
                  <Star className="w-4 h-4 text-purple-600 fill-purple-600" /> {st.points} Points Earned
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL MEMBER LEADERBOARD ROSTER */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 space-y-4">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#8b5cf6]" /> Respective Community Roster ({leaderboard.length} Members)
        </h3>

        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#7c3aed] font-mono font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Student Code</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Points Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {leaderboard.map((st) => (
                  <tr key={st.studentId} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900">#{st.rank}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{st.studentName}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 font-semibold">{st.studentCode}</td>
                    <td className="py-3.5 px-4 text-slate-700">{st.department}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#7c3aed] text-sm">
                      ⭐ {st.points} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">No members or points recorded yet.</div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorLeaderboardPage;
