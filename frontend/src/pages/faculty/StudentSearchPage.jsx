import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Eye, BookOpen, Filter, ArrowRightLeft, Trash2, X } from 'lucide-react';

const StudentSearchPage = () => {
  const [students, setStudents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Move student states
  const [movingMember, setMovingMember] = useState(null);
  const [targetCommunityId, setTargetCommunityId] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const [studentsRes, commRes] = await Promise.all([
        api.get('/students'),
        api.get('/communities').catch(() => ({ data: [] }))
      ]);
      setStudents(studentsRes.data || []);
      setCommunities(commRes.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get(`/search/students?query=${encodeURIComponent(query)}`);
      setStudents(res.data || []);
    } catch (err) {
      console.error('Error searching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setQuery('');
    fetchStudents();
  };

  const handleInitiateMove = (membership, studentName) => {
    setMovingMember({ id: membership.id, studentName, currentCommunityId: membership.communityId });
    setTargetCommunityId('');
  };

  const handleExecuteMove = async () => {
    if (!targetCommunityId || !movingMember) return;
    try {
      setLoading(true);
      await api.put(`/memberships/${movingMember.id}/move?targetCommunityId=${targetCommunityId}`);
      setMovingMember(null);
      fetchStudents();
    } catch (err) {
      console.error('Error moving student:', err);
      alert('Failed to move student.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (membershipId) => {
    if (!window.confirm('Are you sure you want to remove this student from this community?')) return;
    try {
      setLoading(true);
      await api.delete(`/memberships/${membershipId}`);
      fetchStudents();
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Failed to remove student.');
    } finally {
      setLoading(false);
    }
  };

  // Filter students by selected community membership
  const filteredStudents = students.filter(s => {
    if (selectedCommunityId === 'ALL') return true;
    return (s.memberships || []).some(m => 
      m.communityId.toString() === selectedCommunityId.toString() &&
      (m.status === 'APPROVED' || m.status === 'ACTIVE')
    );
  });

  if (loading && students.length === 0) return <LoadingSpinner label="Searching student community database..." />;

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div>
        <h1 className="font-sans text-3xl font-extrabold text-slate-900">Global Student Search & Oversight</h1>
        <p className="text-xs text-slate-600 mt-1">Search any student by Register Number, Name, Department, or Degree to inspect their complete extracurricular portfolio.</p>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-3xl p-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 pl-2">
          <Search className="w-5 h-5 text-[#7c3aed] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Register Code (e.g. REG2026001), Student Name, or Department..."
            className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
          />
        </form>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Community Filter */}
          <div className="relative">
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="w-full sm:w-64 pl-4 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:border-[#8b5cf6] cursor-pointer appearance-none"
            >
              <option value="ALL">All Campus Communities</option>
              {communities.map(c => (
                <option key={c.id} value={c.id.toString()}>{c.name}</option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex gap-2">
            {query && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold active:scale-95 transition"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition shadow-md shadow-purple-500/10"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 rounded-2xl border border-slate-100 space-y-4 hover:border-purple-200 transition shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-slate-200 flex items-center justify-center font-sans text-xl font-bold text-[#7c3aed]">
                    {s.name[0]}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#7c3aed] px-2.5 py-1 rounded-md bg-white border border-purple-600/20">
                    {s.studentCode}
                  </span>
                </div>

                <div>
                  <h3 className="font-sans text-xl font-bold text-slate-900">{s.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{s.department}</p>
                  <p className="text-xs text-slate-500">{s.degree} • Year {s.year} (Sem {s.semester})</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">{s.totalCommunitiesJoined}</div>
                    <div className="text-[10px] text-slate-500">Clubs</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-400">{s.totalVolunteerHours}h</div>
                    <div className="text-[10px] text-slate-500">Hours</div>
                  </div>
                  <div>
                    <div className="font-bold text-[#7c3aed]">{s.attendancePercentage}%</div>
                    <div className="text-[10px] text-slate-500">Attend.</div>
                  </div>
                </div>

                {/* Joined Communities list with Actions */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Communities</div>
                  {s.memberships && s.memberships.filter(m => m.status === 'APPROVED' || m.status === 'ACTIVE').length > 0 ? (
                    <div className="space-y-1.5">
                      {s.memberships
                        .filter(m => m.status === 'APPROVED' || m.status === 'ACTIVE')
                        .map(m => (
                          <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-700">
                            <span className="font-bold truncate max-w-[130px]">{m.communityName}</span>
                            <div className="flex items-center gap-1 shrink-0 pl-2">
                              <button
                                onClick={() => handleInitiateMove(m, s.name)}
                                className="p-1 rounded-lg hover:bg-purple-100 text-[#7c3aed] transition"
                                title="Move student to another community"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveStudent(m.id)}
                                className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition"
                                title="Remove student from this community"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 italic">Not enrolled in any communities.</div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-3">
                <button
                  onClick={() => navigate(`/faculty/students/${s.id}`)}
                  className="w-full py-2.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-200 text-[#8b5cf6] font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Eye className="w-4 h-4" /> View Full Extracurricular Portfolio
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-16 text-center space-y-4 shadow-xl">
          <BookOpen className="w-16 h-16 text-[#7c3aed]/50 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">No Students Found</h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              We couldn't find any students matching your search criteria or community membership filters.
            </p>
          </div>
        </div>
      )}

      {/* Move Member Dialog */}
      {movingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-800">
            <h3 className="text-lg font-extrabold text-slate-900">Move Student</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select the target community where you want to move <strong>{movingMember.studentName}</strong>.
            </p>

            <div className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Community</label>
                <select
                  value={targetCommunityId}
                  onChange={(e) => setTargetCommunityId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#8b5cf6]"
                >
                  <option value="">-- Choose Community --</option>
                  {communities
                    .filter((c) => c.id !== movingMember.currentCommunityId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMovingMember(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMove}
                  disabled={!targetCommunityId}
                  className="px-4 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-bold transition disabled:opacity-50"
                >
                  Move Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSearchPage;
