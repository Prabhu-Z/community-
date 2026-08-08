import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Search, Users, ShieldCheck, Mail, GraduationCap, Calendar, UserMinus, Building2 } from 'lucide-react';

const CoordinatorStudentSearchPage = () => {
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchCommunityAndMembers();
  }, [user]);

  const fetchCommunityAndMembers = async () => {
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
        const memRes = await api.get(`/memberships/community/${myCommunity.id}`);
        setMembers(memRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching coordinator community members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (membershipId, studentName) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${studentName} from ${community.name}? They will be removed only from this specific community.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/memberships/${membershipId}`);
      fetchCommunityAndMembers();
    } catch (err) {
      alert('Failed to remove member from community.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading registered members for your community..." />;

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

  const filteredMembers = members.filter((m) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (m.studentName && m.studentName.toLowerCase().includes(query)) ||
      (m.studentCode && m.studentCode.toLowerCase().includes(query)) ||
      (m.department && m.department.toLowerCase().includes(query));
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sans font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7c3aed]" /> Coordinator Community Scope • {community.name}
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900 mt-1">
            Community Member Search
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Strictly scoped search across registered student members of <strong>{community.name}</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, reg #, dept..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-900 placeholder-almond-300/30 text-xs focus:outline-none focus:border-purple-600/60"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-slate-100 text-slate-900 text-xs focus:outline-none focus:border-purple-600/60"
          >
            <option value="ALL" className="bg-white text-slate-900">All Member Roles</option>
            <option value="MEMBER" className="bg-white text-slate-900">Regular Members</option>
            <option value="CORE_MEMBER" className="bg-white text-slate-900">Core Members</option>
            <option value="SECRETARY" className="bg-white text-slate-900">Secretary</option>
            <option value="PRESIDENT" className="bg-white text-slate-900">President / Head</option>
          </select>
        </div>
      </div>

      {/* Roster Counter Badge */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-4 rounded-xl border border-purple-600/20 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-700">
          <Users className="w-5 h-5 text-[#7c3aed]" />
          <span>
            Total Registered Members in <strong>{community.name}</strong>:
          </span>
          <span className="font-bold font-mono text-[#7c3aed] text-sm">{members.length}</span>
        </div>
        <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-chestnut-700/30 text-[#7c3aed] border border-purple-600/20">
          {community.category}
        </span>
      </div>

      {/* Member Cards Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 rounded-2xl border border-slate-100 space-y-4 flex flex-col justify-between hover:border-purple-200 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-chestnut-700/40 border border-chestnut-500/30 flex items-center justify-center text-[#8b5cf6] font-bold text-sm">
                    {m.studentName ? m.studentName[0] : 'S'}
                  </div>
                  <Badge status={m.status}>{m.status}</Badge>
                </div>

                <div>
                  <h3 className="font-sans text-lg font-bold text-slate-900">{m.studentName}</h3>
                  <div className="text-xs font-mono text-[#7c3aed]">Reg #{m.studentCode}</div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-[#8b5cf6]" />
                    <span>Department: {m.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#7c3aed]" />
                    <span>Joined: {m.joinedDate ? new Date(m.joinedDate).toLocaleDateString() : 'Active Member'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-[#8b5cf6] border border-purple-600/20 font-bold uppercase">
                    {m.role || 'MEMBER'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">{community.name}</span>
                </div>

                {/* Remove Member Button */}
                <button
                  onClick={() => handleRemoveMember(m.id, m.studentName)}
                  className="w-full py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <UserMinus className="w-3.5 h-3.5" /> Remove from Community
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-12 rounded-2xl border border-slate-100 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-600/30 mx-auto" />
          <h3 className="font-sans text-lg font-bold text-slate-900">No Matching Members Found</h3>
          <p className="text-xs text-slate-500">
            No registered members of {community.name} match your current search query.
          </p>
        </div>
      )}
    </div>
  );
};

export default CoordinatorStudentSearchPage;
