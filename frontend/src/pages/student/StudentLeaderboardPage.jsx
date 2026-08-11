import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Trophy, Award, Medal, Crown, Star, Users, CheckSquare, Sparkles, Building2, Calendar, Ticket, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentLeaderboardPage = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRankInfo, setMyRankInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserCommunities();
  }, [user]);

  const fetchUserCommunities = async () => {
    try {
      let studentIdParam = user?.studentId || user?.id;
      const memRes = await api.get(`/memberships/student/${studentIdParam}`).catch(() => ({ data: [] }));

      const myMems = (memRes.data || []).filter(m => m.status === 'APPROVED');

      // Only list enrolled and approved communities
      const commOptions = [];
      myMems.forEach(m => {
        commOptions.push({ communityId: m.communityId, communityName: m.communityName || 'Community' });
      });

      setCommunities(commOptions);

      if (commOptions.length > 0) {
        setSelectedCommunity(commOptions[0]);
        loadLeaderboard(commOptions[0].communityId);
      } else {
        setLeaderboard([]);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching user communities for leaderboard:', err);
      setLoading(false);
    }
  };

  const loadLeaderboard = async (communityId) => {
    setLoading(true);
    try {
      let data = [];
      if (communityId && communityId !== 'ALL') {
        const [lbRes, memRes] = await Promise.all([
          api.get(`/leaderboard/community/${communityId}`).catch(() => ({ data: [] })),
          api.get(`/memberships/community/${communityId}`).catch(() => ({ data: [] }))
        ]);

        const lbData = lbRes.data || [];
        const membersData = memRes.data || [];

        let finalEntries = [...lbData];

        membersData.forEach((m) => {
          const exists = finalEntries.some(
            (e) => e.studentId === m.studentId || e.studentCode === m.studentCode || (e.studentName && e.studentName === m.studentName)
          );
          if (!exists) {
            finalEntries.push({
              studentId: m.studentId || m.id,
              studentName: m.studentName || 'Student Member',
              studentCode: m.studentCode || 'N/A',
              department: m.department || 'General',
              points: m.points || 0,
            });
          }
        });

        finalEntries.sort((a, b) => b.points - a.points);
        finalEntries.forEach((item, idx) => {
          item.rank = idx + 1;
        });

        data = finalEntries;
      } else {
        const globalRes = await api.get('/leaderboard/all').catch(() => ({ data: [] }));
        data = globalRes.data || [];
      }

      setLeaderboard(data);

      let studentId = user?.studentId || user?.id;
      const myEntry = data.find(
        (entry) =>
          entry.studentId === studentId ||
          (user?.email && entry.studentCode?.toLowerCase().includes(user.email.split('@')[0].toLowerCase())) ||
          (user?.name && entry.studentName?.toLowerCase() === user.name.toLowerCase())
      );

      if (myEntry) {
        setMyRankInfo(myEntry);
      } else if (data.length > 0) {
        setMyRankInfo(data[0]);
      } else {
        setMyRankInfo(null);
      }
    } catch (err) {
      console.error('Error loading community leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommunityChange = (communityId) => {
    const found = communities.find((c) => c.communityId === Number(communityId));
    if (found) {
      setSelectedCommunity(found);
      loadLeaderboard(found.communityId);
    }
  };

  if (loading) return <LoadingSpinner label="Loading community points & leaderboard..." />;

  const firstPlace = leaderboard[0];
  const secondPlace = leaderboard[1];
  const thirdPlace = leaderboard[2];

  return (
    <div className="space-y-8 p-2 lg:p-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#8b5cf6]" /> Community Gamification & Leaderboard
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Community Leaderboard</h1>
          <p className="text-xs text-slate-600 mt-1">
            Earn points and climb your community leaderboard through active participation!
          </p>
        </div>

        {/* Community Selector */}
        {communities.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <Users className="w-4 h-4 text-[#8b5cf6]" />
            <select
              value={selectedCommunity?.communityId || ''}
              onChange={(e) => handleCommunityChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {communities.map((c) => (
                <option key={c.communityId} value={c.communityId} className="bg-white text-slate-900">
                  {c.communityName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* GAMIFICATION LEGEND STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7c3aed] flex items-center justify-center font-bold">
            <Ticket className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Event Registered</div>
            <div className="text-sm font-bold text-[#7c3aed] font-mono">+1 Point</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Daily Task Completed</div>
            <div className="text-sm font-bold text-sky-700 font-mono">+3 Points</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Community Task Completed</div>
            <div className="text-sm font-bold text-amber-900 font-mono">+5 Points</div>
          </div>
        </div>
      </div>

      {communities.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-[#8b5cf6] mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Not Enrolled in Any Community Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Join an active campus community to participate in community tasks, earn points, and climb your community leaderboard!
          </p>
          <Link
            to="/student/communities"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition shadow-sm text-xs"
          >
            Explore & Join Communities
          </Link>
        </div>
      ) : (
        <>
          {/* MY RANK HIGHLIGHT BANNER */}
          {myRankInfo && (
            <div className="bg-gradient-to-r from-purple-100 via-purple-50 to-white border border-purple-200 shadow-sm rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-600 text-slate-900 flex items-center justify-center shadow-md">
                  <Crown className="w-8 h-8 text-slate-900" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-extrabold text-[#7c3aed] uppercase tracking-widest">
                    Your Standings in {selectedCommunity?.communityName}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    {myRankInfo.studentName}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Department: {myRankInfo.department} • Code: {myRankInfo.studentCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 bg-white px-6 py-3.5 rounded-2xl border border-purple-100 shadow-sm self-stretch sm:self-auto justify-around">
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">Your Rank</div>
                  <div className="text-3xl font-extrabold text-[#7c3aed]">#{myRankInfo.rank}</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">Total Points</div>
                  <div className="text-3xl font-extrabold text-slate-900 flex items-center gap-1 justify-center">
                    <Star className="w-5 h-5 text-purple-600 fill-purple-600" /> {myRankInfo.points} <span className="text-xs font-sans text-slate-500">pts</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HALL OF FAME PODIUMS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#8b5cf6]" />
              <h3 className="text-xl font-bold text-slate-900">Hall of Fame - Top 3 Performers</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              {/* 2ND PLACE PODIUM */}
              {secondPlace ? (
                <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 text-center space-y-3 relative overflow-hidden order-2 md:order-1">
                  <div className="absolute top-3 right-3 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                    SILVER #2
                  </div>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-200 text-slate-800 flex items-center justify-center shadow-sm">
                    <Medal className="w-8 h-8 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{secondPlace.studentName}</h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{secondPlace.department}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 font-bold text-[#7c3aed] text-sm">
                    ⭐ {secondPlace.points} Points
                  </div>
                </div>
              ) : null}

              {/* 1ST PLACE GOLD CROWN PODIUM (Taller) */}
              {firstPlace ? (
                <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 shadow-md rounded-3xl p-8 text-center space-y-4 relative overflow-hidden order-1 md:order-2 transform -translate-y-2">
                  <div className="absolute top-3 right-3 text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-purple-600 text-slate-900 shadow-sm">
                    👑 1ST PLACE
                  </div>
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-600 text-slate-900 flex items-center justify-center shadow-lg">
                    <Crown className="w-10 h-10 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{firstPlace.studentName}</h3>
                    <p className="text-xs text-amber-900 font-bold font-mono mt-0.5">{firstPlace.department}</p>
                  </div>
                  <div className="pt-3 border-t border-amber-200 font-mono font-extrabold text-[#7c3aed] text-base">
                    🌟 {firstPlace.points} Points
                  </div>
                </div>
              ) : null}

              {/* 3RD PLACE PODIUM */}
              {thirdPlace ? (
                <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 text-center space-y-3 relative overflow-hidden order-3">
                  <div className="absolute top-3 right-3 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    BRONZE #3
                  </div>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-sm">
                    <Award className="w-8 h-8 text-amber-800" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{thirdPlace.studentName}</h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{thirdPlace.department}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 font-bold text-amber-800 text-sm">
                    ⭐ {thirdPlace.points} Points
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* FULL LEADERBOARD ROSTER TABLE */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8b5cf6]" /> Full Member Leaderboard ({leaderboard.length} Members)
            </h3>

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
                    <tr
                      key={st.studentId}
                      className={`hover:bg-slate-50 transition ${
                        myRankInfo?.studentId === st.studentId ? 'bg-purple-50 text-[#7c3aed] font-bold border-l-4 border-l-[#8b5cf6]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900">
                        #{st.rank}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                        {st.studentName}
                        {myRankInfo?.studentId === st.studentId && (
                          <span className="px-2 py-0.5 rounded-full bg-[#8b5cf6] text-white text-[9px] font-extrabold uppercase">
                            YOU
                          </span>
                        )}
                      </td>
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
          </div>
        </>
      )}
    </div>
  );
};

export default StudentLeaderboardPage;
