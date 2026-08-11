import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Users, Edit3, Save, ShieldCheck, GraduationCap, UserMinus, Crown, UserPlus, UserCheck, Star, Building2, Trash2, Eye, Globe, Minus, Plus } from 'lucide-react';

const CommunityManagePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'groups', 'leaders', or 'all'
  const [activeGroups, setActiveGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  // Cross-Community Collaboration States
  const [incomingCollabs, setIncomingCollabs] = useState([]);
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState(null);
  const [nominatedStudentIds, setNominatedStudentIds] = useState([]);
  const [submittingCollab, setSubmittingCollab] = useState(false);

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
        const [memRes, pendRes, groupsRes, incomingCollabsRes] = await Promise.all([
          api.get(`/memberships/community/${myCommunity.id}`).catch(() => ({ data: [] })),
          api.get(`/community-groups/community/${myCommunity.id}/pending`).catch(() => ({ data: [] })),
          api.get(`/community-groups/community/${myCommunity.id}`).catch(() => ({ data: [] })),
          api.get(`/collaboration-requests/incoming/${myCommunity.id}`).catch(() => ({ data: [] })),
        ]);
        setMembers(memRes.data || []);
        setPendingGroups(pendRes.data || []);
        setActiveGroups((groupsRes.data || []).filter(g => g.approvalStatus === 'APPROVED'));
        setIncomingCollabs(incomingCollabsRes.data || []);
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

  const handleDismantleGroup = async (groupId, groupName) => {
    const confirmed = window.confirm(`Are you sure you want to dismantle the group "${groupName}"? All team memberships will be deleted.`);
    if (!confirmed) return;

    try {
      setLoading(true);
      await api.delete(`/community-groups/${groupId}`);
      alert(`Group "${groupName}" dismantled successfully.`);
      setGroupModalOpen(false);
      setSelectedGroup(null);
      fetchCommunityAndMembers();
    } catch (err) {
      console.error('Error dismantling group:', err);
      alert('Failed to dismantle group.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromGroup = async (groupId, studentId, studentName) => {
    const confirmed = window.confirm(`Are you sure you want to remove ${studentName} from this group?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      await api.post(`/community-groups/${groupId}/leave?studentId=${studentId}`);
      alert(`Removed ${studentName} from group roster successfully.`);
      fetchCommunityAndMembers();
      // Refresh modal group data
      try {
        const res = await api.get(`/community-groups/${groupId}`);
        setSelectedGroup(res.data);
      } catch {
        setGroupModalOpen(false);
        setSelectedGroup(null);
      }
    } catch (err) {
      console.error('Error removing student from group:', err);
      alert(err.response?.data?.message || 'Failed to remove member from group.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNominationModal = (collabObj) => {
    setSelectedCollab(collabObj);
    setNominatedStudentIds([]);
    setCollabModalOpen(true);
  };

  const handleToggleNominatedStudent = (studentId) => {
    setNominatedStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmitNominations = async (e) => {
    e.preventDefault();
    if (!selectedCollab || nominatedStudentIds.length === 0 || submittingCollab) return;

    setSubmittingCollab(true);
    try {
      await api.post(`/collaboration-requests/${selectedCollab.id}/approve`, nominatedStudentIds);
      alert('🎉 Nominated students registered and notified successfully!');
      setCollabModalOpen(false);
      fetchCommunityAndMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit nominations.');
    } finally {
      setSubmittingCollab(false);
    }
  };

  const handleRejectCollaboration = async (requestId) => {
    const confirmed = window.confirm('Are you sure you want to decline this event collaboration request?');
    if (!confirmed) return;

    try {
      await api.post(`/collaboration-requests/${requestId}/reject`);
      alert('Declined the collaboration request.');
      fetchCommunityAndMembers();
    } catch (err) {
      alert('Failed to decline collaboration request.');
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

  const unjoinedLeaders = studentLeaders.filter(sl => {
    const leadingGroup = activeGroups.find(g => g.leaderStudentId === sl.studentId);
    return !leadingGroup;
  });

  const unjoinedGeneralStudents = regularMembers.filter(rm => {
    const inAnyGroup = activeGroups.some(g => 
      g.members && g.members.some(m => m.studentId === rm.studentId)
    );
    return !inAnyGroup;
  });

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

          <div className="flex items-center gap-2 bg-[#eef2f6] p-1 rounded-xl border border-slate-200 text-xs flex-wrap">
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
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'groups'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-600 text-black shadow-md'
                  : 'text-slate-600 hover:text-[#7c3aed]'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Student Groups ({activeGroups.length})
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
            <button
              onClick={() => setActiveTab('collaborations')}
              className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'collaborations'
                  ? 'bg-[#8b5cf6] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#7c3aed]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Collab Invites ({incomingCollabs.length})
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

        {activeTab === 'groups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8b5cf6]" /> Active Student Groups ({activeGroups.length})
              </h4>
            </div>

            {activeGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGroups.map((g) => (
                  <div 
                    key={g.id} 
                    onClick={() => {
                      setSelectedGroup(g);
                      setGroupModalOpen(true);
                    }}
                    className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 space-y-4 flex flex-col justify-between shadow-sm cursor-pointer hover:border-[#8b5cf6]/50 transition duration-200"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-[#7c3aed]">
                          Active Team
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Capacity: {g.currentMemberCount} / {g.maxTeamSize}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-slate-900 text-base">{g.groupName}</h5>
                      <p className="text-xs text-slate-600 line-clamp-2">{g.description || 'No description provided.'}</p>
                      
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <div className="text-[11px] text-slate-500">
                          <strong>Student Leader:</strong> {g.leaderStudentName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Dept: {g.leaderDepartment} • Reg #{g.leaderStudentCode}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismantleGroup(g.id, g.groupName);
                        }}
                        className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        title="Dismantle / Delete this Student Group and reset all memberships"
                      >
                        <Trash2 className="w-4 h-4" /> Dismantle Group
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-white/40 rounded-2xl border border-dashed border-slate-300">
                <Users className="w-8 h-8 text-[#7c3aed]/40 mx-auto mb-2" />
                No active student groups created for {community.name} yet.
                <p className="text-[11px] text-slate-400 mt-1">Student leaders can request new groups under the "My Leader Group" workspace.</p>
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

                    <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/faculty/students/${m.studentId || m.id}`)}
                        className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] border border-purple-200 transition shadow-sm"
                        title="View Student Leader Portfolio Dashboard"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDismissLeader(m.id, m.studentName)}
                        className="flex-1 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/40 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
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

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/faculty/students/${m.studentId || m.id}`)}
                            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] border border-purple-200 transition shadow-sm"
                            title="View Student Portfolio Dashboard"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isLeader ? (
                            <button
                              onClick={() => handleDismissLeader(m.id, m.studentName)}
                              className="flex-1 py-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-600/30 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                            >
                              <UserMinus className="w-3 h-3" /> Dismiss Leader
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAssignLeader(m.id, m.studentName)}
                              className="flex-1 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-200 text-[#8b5cf6] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                            >
                              <Crown className="w-3 h-3 text-[#7c3aed]" /> Assign Leader
                            </button>
                          )}
                        </div>
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

        {/* TAB 4: COLLABORATION INVITATION REQUESTS */}
        {activeTab === 'collaborations' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#8b5cf6]" /> Incoming Event Collaboration Invites ({incomingCollabs.length})
            </h4>

            {incomingCollabs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {incomingCollabs.map((collab) => (
                  <div
                    key={collab.id}
                    className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 border-purple-200 bg-gradient-to-b from-purple-500/5 to-transparent space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7c3aed] border border-purple-200">
                          Invite From: {collab.requestingCommunityName}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {collab.createdAt ? new Date(collab.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>

                      <h3 className="font-sans text-lg font-extrabold text-slate-900">
                        {collab.eventTitle}
                      </h3>

                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-150 leading-relaxed font-medium">
                        <strong>Event Description:</strong> {collab.eventDescription || 'No description provided.'}
                      </p>

                      {collab.message && (
                        <div className="text-xs text-indigo-700 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100 leading-relaxed">
                          <strong>Invitation Note:</strong> {collab.message}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                        <div><strong>Date:</strong> {collab.eventDate}</div>
                        <div><strong>Time:</strong> {collab.eventTime}</div>
                        <div className="col-span-2"><strong>Venue:</strong> {collab.eventVenue}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-150 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleRejectCollaboration(collab.id)}
                        className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        Decline Invite
                      </button>
                      <button
                        onClick={() => handleOpenNominationModal(collab)}
                        className="py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        Accept & Nominate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 shadow-sm rounded-3xl border border-dashed border-slate-200">
                <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                No incoming event collaboration requests at this time.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Group Detail Modal for Coordinator */}
      {selectedGroup && (
        <Modal 
          isOpen={groupModalOpen} 
          onClose={() => {
            setGroupModalOpen(false);
            setSelectedGroup(null);
          }} 
          title={`Group Details: ${selectedGroup.groupName}`}
        >
          <div className="space-y-6 text-xs text-slate-800">
            {/* Group Overview & Dynamic Team Size Adjustment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">Group Description</span>
                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed font-medium min-h-[64px]">
                  {selectedGroup.description || 'No description provided.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 flex flex-col justify-center items-center text-center space-y-2">
                <span className="text-[10px] font-mono font-bold text-purple-950 uppercase tracking-widest">
                  Dynamic Team Size Capacity
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      const currentCount = selectedGroup.members?.filter(m => m.role !== 'PENDING').length || 0;
                      const newSize = Math.max(1, selectedGroup.maxTeamSize - 1);
                      if (newSize < currentCount) {
                        alert(`Cannot decrease capacity below current approved member count (${currentCount}).`);
                        return;
                      }
                      try {
                        setLoading(true);
                        const res = await api.put(`/community-groups/${selectedGroup.id}/max-team-size?maxTeamSize=${newSize}`);
                        setSelectedGroup(res.data);
                        fetchCommunityAndMembers();
                      } catch (err) {
                        alert('Failed to update capacity.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={selectedGroup.maxTeamSize <= (selectedGroup.members?.filter(m => m.role !== 'PENDING').length || 0)}
                    className="w-8 h-8 rounded-lg bg-white text-slate-800 border border-slate-300 font-bold hover:bg-slate-100 disabled:opacity-40 transition flex items-center justify-center shadow-sm"
                    title="Decrease max capacity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-extrabold font-mono text-slate-900 px-1">
                    {selectedGroup.members?.filter(m => m.role !== 'PENDING').length || 0} / {selectedGroup.maxTeamSize}
                  </span>
                  <button
                    onClick={async () => {
                      const newSize = selectedGroup.maxTeamSize + 1;
                      try {
                        setLoading(true);
                        const res = await api.put(`/community-groups/${selectedGroup.id}/max-team-size?maxTeamSize=${newSize}`);
                        setSelectedGroup(res.data);
                        fetchCommunityAndMembers();
                      } catch (err) {
                        alert('Failed to update capacity.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-[#8b5cf6] text-white font-bold hover:bg-[#7c3aed] transition flex items-center justify-center shadow-sm"
                    title="Increase max capacity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Faculty-only control to adjust group capacity slots
                </div>
              </div>
            </div>

            {/* Student Leader Details & Edit Leadership */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
              <span className="text-[10px] font-mono font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-600" /> Group Student Leader
              </span>
              <div className="flex items-center justify-between gap-4 border-b border-amber-200/50 pb-3">
                <div>
                  <h5 className="font-extrabold text-slate-900 text-sm">{selectedGroup.leaderStudentName || 'No Leader (Vacant)'}</h5>
                  {selectedGroup.leaderStudentName && (
                    <p className="text-[10px] text-slate-500 font-mono">Reg #{selectedGroup.leaderStudentCode} • {selectedGroup.leaderDepartment}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedGroup.leaderStudentId && (
                    <button
                      onClick={() => {
                        setGroupModalOpen(false);
                        navigate(`/faculty/students/${selectedGroup.leaderStudentId}`);
                      }}
                      className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] border border-purple-200 transition shadow-sm"
                      title="View Student Leader Portfolio Dashboard"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {selectedGroup.leaderStudentId && (
                    <button
                      onClick={() => handleRemoveFromGroup(selectedGroup.id, selectedGroup.leaderStudentId, selectedGroup.leaderStudentName)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition shadow-sm"
                      title="Remove Student Leader from group (vacate position)"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Leadership dropdown */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-amber-900/70">Assign/Edit Student Leader:</label>
                <div className="flex gap-2">
                  <select
                    id="leaderSelect"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#8b5cf6]"
                    defaultValue=""
                  >
                    <option value="" disabled>-- Select an unassigned Student Leader --</option>
                    {unjoinedLeaders.map(l => (
                      <option key={l.id} value={l.studentId}>
                        {l.studentName} ({l.studentCode})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={async () => {
                      const select = document.getElementById('leaderSelect');
                      const studentId = select.value;
                      if (!studentId) {
                        alert('Please select a student leader first.');
                        return;
                      }
                      try {
                        setLoading(true);
                        const res = await api.put(`/community-groups/${selectedGroup.id}/assign-leader?studentId=${studentId}`);
                        alert('🎉 Successfully updated Group Leadership!');
                        fetchCommunityAndMembers();
                        setSelectedGroup(res.data);
                      } catch (err) {
                        alert(err.response?.data?.message || 'Failed to assign leader.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition active:scale-95 shrink-0"
                  >
                    Assign Leader
                  </button>
                </div>
              </div>
            </div>

            {/* Members List & Member Assignment */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                  Group Members ({selectedGroup.members?.filter(m => m.role !== 'PENDING').length || 0} / {selectedGroup.maxTeamSize})
                </span>
              </div>

              {/* Assign General Member dropdown */}
              <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
                <label className="block text-[10px] uppercase font-bold text-[#7c3aed]">Assign Member to Group:</label>
                <div className="flex gap-2">
                  <select
                    id="memberSelect"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#8b5cf6]"
                    defaultValue=""
                  >
                    <option value="" disabled>-- Select an unassigned student --</option>
                    {unjoinedGeneralStudents.map(s => (
                      <option key={s.id} value={s.studentId}>
                        {s.studentName} ({s.studentCode})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={async () => {
                      const select = document.getElementById('memberSelect');
                      const studentId = select.value;
                      if (!studentId) {
                        alert('Please select a student first.');
                        return;
                      }
                      try {
                        setLoading(true);
                        const res = await api.post(`/community-groups/${selectedGroup.id}/assign-member?studentId=${studentId}`);
                        alert('🎉 Member assigned to group successfully!');
                        fetchCommunityAndMembers();
                        setSelectedGroup(res.data);
                      } catch (err) {
                        alert(err.response?.data?.message || 'Failed to assign member.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs transition active:scale-95 shrink-0"
                  >
                    Assign Member
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedGroup.members && selectedGroup.members.filter(m => m.role !== 'PENDING').length > 0 ? (
                  selectedGroup.members.filter(m => m.role !== 'PENDING').map((m) => {
                    const isLeader = m.role === 'LEADER' || m.studentId === selectedGroup.leaderStudentId;
                    if (isLeader) return null; // Skip leader since we showed them above
                    return (
                      <div key={m.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{m.studentName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Reg #{m.studentCode} • {m.department}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setGroupModalOpen(false);
                              navigate(`/faculty/students/${m.studentId || m.id}`);
                            }}
                            className="p-1.5 rounded-lg bg-white hover:bg-purple-100 text-[#7c3aed] border border-slate-200 transition shadow-sm"
                            title="View Member Portfolio Dashboard"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveFromGroup(selectedGroup.id, m.studentId || m.id, m.studentName)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-600 border border-slate-200 transition shadow-sm"
                            title="Remove student from this group"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No members have joined this group yet.
                  </div>
                )}
              </div>
            </div>

            {/* Footer Close & Dismantle */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleDismantleGroup(selectedGroup.id, selectedGroup.groupName)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1.5 text-xs"
                title="Dismantle / Delete this student leader group"
              >
                <Trash2 className="w-4 h-4 text-white" /> Dismantle Group
              </button>
              <button
                type="button"
                onClick={() => {
                  setGroupModalOpen(false);
                  setSelectedGroup(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CROSS-COMMUNITY STUDENT NOMINATION MODAL */}
      {selectedCollab && (
        <Modal 
          isOpen={collabModalOpen} 
          onClose={() => {
            setCollabModalOpen(false);
            setSelectedCollab(null);
          }} 
          title={`Nominate Students for ${selectedCollab.eventTitle}`}
        >
          <form onSubmit={handleSubmitNominations} className="space-y-4 text-xs text-slate-800">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                Host Event details
              </span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 mt-1 text-[11px]">
                <strong className="text-slate-900 block text-xs">{selectedCollab.eventTitle}</strong>
                <p className="text-slate-600">Hosted by: <strong>{selectedCollab.requestingCommunityName}</strong></p>
                <p className="text-slate-500 font-mono">Date: {selectedCollab.eventDate} ({selectedCollab.eventTime}) | Venue: {selectedCollab.eventVenue}</p>
                {selectedCollab.message && (
                  <p className="text-indigo-800 bg-indigo-50/50 p-2 rounded-lg border border-indigo-150 mt-1.5 leading-relaxed font-medium">
                    <strong>Invitation Note:</strong> {selectedCollab.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">
                Select Members from your Community to Nominate
              </label>
              
              <div className="max-h-60 overflow-y-auto pr-1 border border-slate-200 rounded-2xl p-3 space-y-2.5 bg-white scrollbar-thin">
                {members.length > 0 ? (
                  members.map((m) => {
                    const isChecked = nominatedStudentIds.includes(m.studentId);
                    return (
                      <div 
                        key={m.id} 
                        onClick={() => handleToggleNominatedStudent(m.studentId)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                          isChecked ? 'border-emerald-350 bg-emerald-50/20' : 'border-slate-150 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by div onClick
                          className="w-4 h-4 text-[#8b5cf6] border-slate-350 rounded focus:ring-[#8b5cf6]"
                        />
                        <div className="flex-1">
                          <strong className="text-slate-900 text-xs">{m.studentName}</strong>
                          <span className="text-[10px] text-slate-500 font-mono block">Reg #{m.studentCode} • {m.department}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    No approved community members to nominate.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-150 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCollabModalOpen(false);
                  setSelectedCollab(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={nominatedStudentIds.length === 0 || submittingCollab}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-50 active:scale-95 shadow-sm transition"
              >
                {submittingCollab ? 'Submitting...' : `Nominate & Register (${nominatedStudentIds.length} Students)`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CommunityManagePage;
