import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Trophy, Award, Medal, Crown, Star, Users, Sparkles, Building2, Globe } from 'lucide-react';

const FacultyLeaderboardPage = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState('ALL'); // 'ALL' or communityId
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunitiesAndLeaderboard();
  }, []);

  const fetchCommunitiesAndLeaderboard = async () => {
    try {
      const commRes = await api.get('/communities');
      setCommunities(commRes.data || []);

      loadLeaderboard('ALL');
    } catch (err) {
      console.error('Error fetching faculty leaderboard:', err);
      setLoading(false);
    }
  };

  const loadLeaderboard = async (commId) => {
    setLoading(true);
    try {
      if (commId === 'ALL') {
        const res = await api.get('/leaderboard/all').catch(() => ({ data: [] }));
        setLeaderboard(res.data || []);
      } else {
        const [lbRes, memRes] = await Promise.all([
          api.get(`/leaderboard/community/${commId}`).catch(() => ({ data: [] })),
          api.get(`/memberships/community/${commId}`).catch(() => ({ data: [] }))
        ]);

        const lbData = lbRes.data || [];
        const membersData = memRes.data || [];

        const combined = membersData.map((m) => {
          const matchedEntry = lbData.find(
            (e) => e.studentId === m.studentId || e.studentCode === m.studentCode || (e.studentName && e.studentName === m.studentName)
          );
          return {
            studentId: m.studentId || m.id,
            studentName: m.studentName || 'Student Member',
            studentCode: m.studentCode || 'N/A',
            department: m.department || 'General',
            points: matchedEntry ? matchedEntry.points : (m.points || 0),
          };
        });

        if (combined.length > 0) {
          combined.sort((a, b) => b.points - a.points);
          combined.forEach((item, idx) => {
            item.rank = idx + 1;
          });
          setLeaderboard(combined);
        } else {
          setLeaderboard(lbData);
        }
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommunity = (commId) => {
    setSelectedCommunityId(commId);
    loadLeaderboard(commId);
  };

  if (loading) return <LoadingSpinner label="Loading institutional student leaderboards..." />;

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sans font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#7c3aed]" /> College-Wide Student Performance Oversight
          </span>
          <h1 className="font-sans text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">Institutional Leaderboards</h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Track student achievements and task points across all 30+ campus communities.
          </p>
        </div>

        {/* Dropdown Filter for Faculty */}
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <Globe className="w-4 h-4 text-[#7c3aed]" />
          <select
            value={selectedCommunityId}
            onChange={(e) => handleSelectCommunity(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-white text-slate-900">🏆 ALL COMMUNITIES (Campus Overall)</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id} className="bg-white text-slate-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3.map((st, index) => {
            let badgeBg = 'from-purple-600 to-yellow-600';
            let medalIcon = <Trophy className="w-6 h-6 text-black" />;

            if (st.rank === 2) {
              badgeBg = 'from-slate-300 to-slate-500';
              medalIcon = <Medal className="w-6 h-6 text-black" />;
            } else if (st.rank === 3) {
              badgeBg = 'from-amber-700 to-amber-900';
              medalIcon = <Award className="w-6 h-6 text-slate-900" />;
            }

            return (
              <div key={st.studentId || index} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 rounded-3xl border border-slate-200 text-center space-y-3 relative">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr ${badgeBg} flex items-center justify-center shadow-lg">
                  {medalIcon}
                </div>

                <div>
                  <h3 className="font-sans text-lg font-bold text-slate-900">{st.studentName}</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{st.department}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-center gap-1.5 font-bold text-slate-800 text-sm">
                  <Star className="w-4 h-4 text-[#7c3aed] fill-purple-600" /> {st.points} Points Earned
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL LEADERBOARD ROSTER TABLE */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-200 space-y-4">
        <h3 className="font-sans text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#7c3aed]" /> Student Leaderboard Roster ({leaderboard.length} Students)
        </h3>

        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#7c3aed] font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Student Code</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Points Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-600">
                {leaderboard.map((st) => (
                  <tr key={st.studentId} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-800">#{st.rank}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{st.studentName}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{st.studentCode}</td>
                    <td className="py-3.5 px-4">{st.department}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 text-sm">
                      ⭐ {st.points} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">No points recorded for this selection yet.</div>
        )}
      </div>
    </div>
  );
};

export default FacultyLeaderboardPage;
