import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Users, Edit3, Save, ShieldCheck, GraduationCap, UserMinus, Crown, UserPlus, UserCheck, Star, Building2 } from 'lucide-react';

const CommunityManagePage = () => {
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'leaders', or 'all'

  useEffect(() => {
    fetchCommunityAndMembers();
  }, [user]);

  const fetchCommunityAndMembers = async () => {
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
      setFormData(myCommunity || {});

      if (myCommunity?.id) {
        const [memRes, pendRes] = await Promise.all([
          api.get(`/memberships/community/${myCommunity.id}`).catch(() => ({ data: [] })),
          api.get(`/community-groups/community/${myCommunity.id}/pending`).catch(() => ({ data: [] })),
        ]);
        setMembers(memRes.data || []);
        setPendingGroups(pendRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching community data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/communities/${community.id}`, formData);
      setIsEditing(false);
      fetchCommunityAndMembers();
    } catch (err) {
      alert('Failed to update community details.');
    }
  };

  const handleAssignLeader = async (membershipId, studentName) => {
    try {
      await api.put(`/memberships/${membershipId}/assign-leader`);
      alert(`⭐ ${studentName} has been assigned as a Student Leader! They can now propose events.`);
      fetchCommunityAndMembers();
    } catch (err) {
      alert('Failed to assign Student Leader role.');
    }
  };

  const handleDismissLeader = async (membershipId, studentName) => {
    const confirmed = window.confirm(`Are you sure you want to dismiss ${studentName} from Student Leader role?`);
    if (!confirmed) return;

    try {
      await api.put(`/memberships/${membershipId}/dismiss-leader`);
      alert(`${studentName}'s Student Leader role has been reset to Member.`);
      fetchCommunityAndMembers();
    } catch (err) {
      alert('Failed to dismiss Student Leader.');
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

  const handleApproveGroup = async (groupId, groupName) => {
    try {
      await api.put(`/community-groups/${groupId}/approve`);
      alert(`✅ Group "${groupName}" approved! It is now live in Group Openings for students.`);
      fetchCommunityAndMembers();
    } catch (err) {
      alert('Failed to approve group request.');
    }
  };

  const handleDeclineGroup = async (groupId, groupName) => {
    const confirmed = window.confirm(`Decline creation request for "${groupName}"?`);
    if (!confirmed) return;

    try {
      await api.put(`/community-groups/${groupId}/decline`);
      alert(`❌ Group request for "${groupName}" has been declined.`);
      fetchCommunityAndMembers();
    } catch (err) {
      alert('Failed to decline group request.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading community information & leaders..." />;

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

  const studentLeaders = members.filter(m => m.role === 'STUDENT_COORDINATOR' || m.role === 'EVENT_ORGANIZER' || m.role === 'TEAM_LEAD');
  const regularMembers = members.filter(m => m.role !== 'STUDENT_COORDINATOR' && m.role !== 'EVENT_ORGANIZER' && m.role !== 'TEAM_LEAD');

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sans font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7c3aed]" /> Community Information & Leadership Roster
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900 mt-1">{community.name}</h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage community details, assign student leaders, and verify event proposals for {community.name}.
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 text-[#8b5cf6] border border-slate-200 font-bold text-xs hover:bg-purple-600/30 transition self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4" /> {isEditing ? 'Cancel Editing' : 'Edit Information'}
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-200">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Community Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Category</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</label>
              <textarea
                rows={4}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Faculty Coordinator</label>
                <input
                  type="text"
                  value={formData.facultyCoordinator || ''}
                  onChange={(e) => setFormData({ ...formData, facultyCoordinator: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Faculty Head</label>
                <input
                  type="text"
                  value={formData.studentCoordinator || ''}
                  onChange={(e) => setFormData({ ...formData, studentCoordinator: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-900"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-chestnut-700 to-purple-600 text-slate-900 font-bold text-xs shadow-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-chestnut-700/30 text-[#7c3aed] border border-slate-200">
                Category: {community.category}
              </span>
              <Badge status={community.status}>{community.status}</Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-2">{community.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <div><strong>Admin Lead:</strong> {community.facultyCoordinator || 'Unassigned'}</div>
              <div><strong>Student Lead:</strong> {community.studentCoordinator || 'Unassigned'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Roster & Student Leaders Category Navigation Tabs */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-[#7c3aed]" />
            <div>
              <h3 className="font-sans text-xl font-bold text-slate-900">Community Roster & Leadership</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign or dismiss Student Leaders and manage approved members.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#eef2f6] p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-600 text-black shadow-md'
                  : 'text-slate-600 hover:text-[#7c3aed]'
              }`}
            >
              ⏳ Group Requests ({pendingGroups.length})
            </button>
            <button
              onClick={() => setActiveTab('leaders')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'leaders'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-600 text-black shadow-md'
                  : 'text-slate-600 hover:text-[#7c3aed]'
              }`}
            >
              <Crown className="w-3.5 h-3.5" /> Student Leaders ({studentLeaders.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-600 text-black shadow-md'
                  : 'text-slate-600 hover:text-[#7c3aed]'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> All Members ({members.length})
            </button>
          </div>
        </div>

        {/* TAB 0: PENDING STUDENT GROUP CREATION REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-2">
                ⏳ Pending Student Group Creation Requests ({pendingGroups.length})
              </h4>
            </div>

            {pendingGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingGroups.map((g) => (
                  <div
                    key={g.id}
                    className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 rounded-2xl border border-purple-600/40 bg-gradient-to-b from-purple-600/10 to-transparent space-y-4 flex flex-col justify-between shadow-xl"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-base">
                          {g.groupName}
                        </span>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-600 text-black">
                          PENDING REVIEW
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {g.description || 'No description provided.'}
                      </p>

                      <div className="p-3 rounded-xl bg-white text-slate-900/40 border border-slate-200 space-y-1 text-xs">
                        <div className="font-bold text-[#8b5cf6] flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-[#7c3aed]" /> Requested by Student Leader: {g.leaderStudentName}
                        </div>
                        <div className="text-slate-600 font-mono text-[11px]">
                          Reg #{g.leaderStudentCode} • Dept: {g.leaderDepartment}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px] pt-1">
                          Requested Team Size: <strong className="text-slate-900">{g.maxTeamSize} slots</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDeclineGroup(g.id, g.groupName)}
                        className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition text-center"
                      >
                        ❌ Decline Request
                      </button>
                      <button
                        onClick={() => handleApproveGroup(g.id, g.groupName)}
                        className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition text-center"
                      >
                        ✅ Accept & Approve Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-white/40 rounded-2xl border border-dashed border-stardustsilver-300/20">
                <Crown className="w-8 h-8 text-[#7c3aed]/40 mx-auto mb-2" />
                No pending student group creation requests for {community.name}.
                <p className="text-[11px] text-slate-400 mt-1">Student leaders can request new groups in "My Leader Group".</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'leaders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-[#7c3aed]" /> Assigned Student Leaders ({studentLeaders.length})
              </h4>
            </div>

            {studentLeaders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentLeaders.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-600/10 to-transparent space-y-3 flex flex-col justify-between shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Crown className="w-4 h-4 text-[#7c3aed]" /> {m.studentName}
                        </span>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-600 text-black">
                          STUDENT LEADER
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[#8b5cf6]">Reg #{m.studentCode}</div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1">
                        <GraduationCap className="w-3.5 h-3.5 text-[#8b5cf6]" /> {m.department}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <button
                        onClick={() => handleDismissLeader(m.id, m.studentName)}
                        className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/40 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <UserMinus className="w-3.5 h-3.5" /> Dismiss Student Leader
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-white/40 rounded-2xl border border-dashed border-stardustsilver-300/20">
                <Crown className="w-8 h-8 text-[#7c3aed]/40 mx-auto mb-2" />
                No Student Leaders currently assigned for {community.name}.
                <p className="text-[11px] text-slate-400 mt-1">Switch to "All Members" tab to assign a student as Leader.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL MEMBERS & ASSIGNMENT */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              All Approved Members ({members.length})
            </h4>

            {members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => {
                  const isLeader = m.role === 'STUDENT_COORDINATOR' || m.role === 'EVENT_ORGANIZER' || m.role === 'TEAM_LEAD';
                  return (
                    <div
                      key={m.id}
                      className={`bg-white border border-slate-200 shadow-sm rounded-2xl p-4 rounded-xl border space-y-3 flex flex-col justify-between transition ${
                        isLeader ? 'border-purple-200 bg-purple-600/5' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                            {isLeader && <Crown className="w-3.5 h-3.5 text-[#7c3aed]" />} {m.studentName}
                          </span>
                          <Badge status={m.status}>{m.status}</Badge>
                        </div>
                        <div className="text-xs font-mono text-[#7c3aed]">Reg #{m.studentCode}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                          <GraduationCap className="w-3.5 h-3.5 text-[#8b5cf6]" /> {m.department}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono text-[#8b5cf6] font-bold uppercase">{m.role || 'MEMBER'}</span>
                          <span className="text-slate-500">{m.joinedDate ? new Date(m.joinedDate).toLocaleDateString() : 'Active'}</span>
                        </div>

                        {isLeader ? (
                          <button
                            onClick={() => handleDismissLeader(m.id, m.studentName)}
                            className="w-full py-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-600/30 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                          >
                            <UserMinus className="w-3 h-3" /> Dismiss Leader
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAssignLeader(m.id, m.studentName)}
                            className="w-full py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-200 text-[#8b5cf6] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            <Crown className="w-3 h-3 text-[#7c3aed]" /> Assign as Student Leader
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No registered members found for {community.name} yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityManagePage;
