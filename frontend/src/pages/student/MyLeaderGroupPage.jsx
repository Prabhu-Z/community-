import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Users, Plus, Minus, Crown, ShieldCheck, GraduationCap, UserMinus, Trash2, Edit3, Sparkles, AlertCircle, Building2 } from 'lucide-react';

const MyLeaderGroupPage = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [myCommunities, setMyCommunities] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [myGroups, setMyGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [isStudentLeader, setIsStudentLeader] = useState(true);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    maxTeamSize: 5,
  });

  useEffect(() => {
    if (!user) return;
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const studentRes = await api.get(`/students/user/${user.id}`).catch(() => null);
      const studentData = studentRes?.data || null;
      setStudent(studentData);

      if (studentData?.id) {
        const memRes = await api.get(`/memberships/student/${studentData.id}`);
        const activeMems = (memRes.data || []).filter(m => m.status === 'APPROVED');
        setMyCommunities(activeMems);
        if (activeMems.length > 0) {
          setSelectedCommunityId(activeMems[0].communityId.toString());
        }

        const groupsRes = await api.get(`/community-groups/student/${studentData.id}`);
        const ledGroups = (groupsRes.data || []).filter(g => g.leaderStudentId === studentData.id);
        setMyGroups(ledGroups);
        if (ledGroups.length > 0) {
          setActiveGroup(ledGroups[0]);
        }

        // Determine if student holds a leadership position
        const leaderRoles = [
          'STUDENT_COORDINATOR',
          'COMMUNITY_COORDINATOR',
          'EVENT_ORGANIZER',
          'TEAM_LEAD',
          'SECRETARY',
          'JOINT_SECRETARY',
          'PRESIDENT',
          'LEADER',
          'COORDINATOR'
        ];

        const hasLeaderRoleInMem = activeMems.some(m =>
          m.role && leaderRoles.includes(m.role.toUpperCase())
        );

        const rawUserRole = (user.role || '').toUpperCase();
        const isUserLeaderRole = rawUserRole.includes('COORDINATOR') || rawUserRole.includes('ORGANIZER') || rawUserRole.includes('LEAD');
        
        const isLeader = hasLeaderRoleInMem || isUserLeaderRole || ledGroups.length > 0;
        setIsStudentLeader(isLeader);
      }
    } catch (err) {
      console.error('Error fetching student group data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!student?.id) return;

    const commId = selectedCommunityId || (myCommunities.length > 0 ? myCommunities[0].communityId.toString() : '1');

    setSubmitting(true);
    try {
      const res = await api.post('/community-groups', {
        communityId: parseInt(commId),
        leaderStudentId: student.id,
        groupName: formData.groupName,
        description: formData.description,
        maxTeamSize: parseInt(formData.maxTeamSize) || 5,
      });

      alert(`🎉 Group "${formData.groupName}" successfully created under your community!`);
      setCreateModal(false);
      setFormData({ groupName: '', description: '', maxTeamSize: 5 });
      fetchInitialData();
    } catch (err) {
      alert('Failed to create group.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustTeamSize = async (delta) => {
    if (!activeGroup) return;
    const newSize = Math.max(1, activeGroup.maxTeamSize + delta);
    if (newSize < activeGroup.currentMemberCount) {
      alert(`Cannot decrease capacity below current member count (${activeGroup.currentMemberCount}).`);
      return;
    }

    try {
      const res = await api.put(`/community-groups/${activeGroup.id}/max-team-size?maxTeamSize=${newSize}`);
      setActiveGroup(res.data);
      setMyGroups(prev => prev.map(g => g.id === res.data.id ? res.data : g));
    } catch (err) {
      alert('Failed to update team size.');
    }
  };

  const handleRemoveMember = async (studentId, studentName) => {
    if (!activeGroup) return;
    if (studentId === student.id) {
      alert('You are the Team Leader! Use Delete Group if you wish to disassemble this group.');
      return;
    }

    const confirmRemove = window.confirm(`Remove ${studentName} from "${activeGroup.groupName}"?`);
    if (!confirmRemove) return;

    try {
      const res = await api.post(`/community-groups/${activeGroup.id}/leave?studentId=${studentId}`);
      setActiveGroup(res.data);
      setMyGroups(prev => prev.map(g => g.id === res.data.id ? res.data : g));
    } catch (err) {
      alert('Failed to remove member.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${activeGroup.groupName}"? All team memberships will be deleted.`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/community-groups/${activeGroup.id}`);
      alert('Group deleted.');
      setActiveGroup(null);
      fetchInitialData();
    } catch (err) {
      alert('Failed to delete group.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading your leader group workspace..." />;

  if (!isStudentLeader) {
    return (
      <div className="space-y-8 p-2 lg:p-4">
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
          <ShieldCheck className="w-16 h-16 text-[#8b5cf6] mx-auto" />
          <div className="space-y-2">
            <h2 className="text-[#7c3aed]xl font-extrabold text-slate-900">Student Leader Workspace Reserved</h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              The "My Leader Group" workspace is restricted to designated Student Leaders, Team Leads, and Faculty Heads. Regular members can browse open groups and join teams under Group Openings!
            </p>
          </div>
          <Link
            to="/student/group-openings"
            className="px-6 py-3 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
          >
            <Users className="w-4 h-4 text-slate-900" /> Go to Group Openings
          </Link>
        </div>
      </div>
    );
  }

  if (!myCommunities || myCommunities.length === 0) {
    return (
      <div className="space-y-8 p-2 lg:p-4">
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
          <Building2 className="w-16 h-16 text-[#8b5cf6] mx-auto" />
          <div className="space-y-2">
            <h2 className="text-[#7c3aed]xl font-extrabold text-slate-900">No Communities Joined Yet</h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You haven't joined any community chapter yet. Please explore and join a community first to manage or lead a student group!
            </p>
          </div>
          <Link
            to="/student/communities"
            className="px-6 py-3 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
          >
            <Users className="w-4 h-4 text-slate-900" /> Explore & Join Communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 lg:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-[#8b5cf6]" /> Student Leader Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            My Community Group
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Create student groups in your community, dynamically adjust team size (+ / -), and manage your team roster.
          </p>
        </div>

        {!activeGroup && (
          <button
            onClick={() => setCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs flex items-center gap-2 shadow-sm active:scale-95 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-slate-900" /> Create New Group
          </button>
        )}
      </div>

      {/* ACTIVE GROUP WORKSPACE */}
      {activeGroup ? (
        <div className="space-y-6">
          {/* PENDING APPROVAL ALERT BANNER */}
          {activeGroup.approvalStatus === 'PENDING' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 shadow-sm">
              <div className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                ⏳ Group Creation Request Pending Approval
              </div>
              <p className="leading-relaxed text-amber-800">
                Your request to create <strong>"{activeGroup.groupName}"</strong> has been submitted to your Faculty Coordinator for review. Once accepted, your group will go live in <strong>Group Openings</strong> for regular students to join!
              </p>
            </div>
          )}

          {activeGroup.approvalStatus === 'DECLINED' && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1 shadow-sm">
              <div className="font-extrabold text-sm text-rose-900 flex items-center gap-2">
                ❌ Group Creation Request Declined
              </div>
              <p className="leading-relaxed text-rose-800">
                Your request to create <strong>"{activeGroup.groupName}"</strong> was declined by the Faculty Coordinator. You may delete this group and re-submit a new request.
              </p>
            </div>
          )}

          {/* Main Group Header Card */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-purple-100 text-[#7c3aed] border border-purple-200">
                    {activeGroup.communityName || 'Community Team'}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${
                    activeGroup.approvalStatus === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : activeGroup.approvalStatus === 'DECLINED'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {activeGroup.approvalStatus === 'APPROVED' ? 'LIVE / APPROVED' : activeGroup.approvalStatus === 'DECLINED' ? 'DECLINED' : 'PENDING APPROVAL'}
                  </span>
                </div>
                <h2 className="text-[#7c3aed]xl md:text-3xl font-extrabold text-slate-900 mt-2 flex items-center gap-2">
                  {activeGroup.groupName}
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  {activeGroup.description || 'No description provided.'}
                </p>
              </div>

              {/* DYNAMIC TEAM SIZE ADJUSTER CONTROL */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100 text-center space-y-2">
                <span className="text-[10px] font-mono text-slate-600 uppercase font-bold">Dynamic Team Size Capacity</span>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleAdjustTeamSize(-1)}
                    disabled={activeGroup.maxTeamSize <= activeGroup.currentMemberCount}
                    className="w-8 h-8 rounded-lg bg-white text-slate-800 border border-slate-300 font-bold hover:bg-slate-100 disabled:opacity-40 transition flex items-center justify-center shadow-sm"
                    title="Decrease max capacity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold font-mono text-[#7c3aed] px-2">
                    {activeGroup.currentMemberCount} / {activeGroup.maxTeamSize}
                  </span>
                  <button
                    onClick={() => handleAdjustTeamSize(1)}
                    className="w-8 h-8 rounded-lg bg-[#8b5cf6] text-white font-bold hover:bg-[#7c3aed] transition flex items-center justify-center shadow-sm"
                    title="Increase max capacity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Click + or - to dynamically adjust max slots
                </div>
              </div>
            </div>

            {/* Team Leader Banner */}
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-[#7c3aed] font-bold">
                  <Crown className="w-5 h-5 text-[#8b5cf6]" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Team Leader: {activeGroup.leaderStudentName}</div>
                  <div className="text-slate-600 font-mono text-[11px]">
                    Reg #{activeGroup.leaderStudentCode} • Dept: {activeGroup.leaderDepartment}
                  </div>
                </div>
              </div>

              <button
                onClick={handleDeleteGroup}
                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" /> Disassemble Group
              </button>
            </div>

            {/* TEAM ROSTER LIST */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#8b5cf6]" /> Joined Team Members ({activeGroup.members?.length || 0})
                </h3>
                <span className="text-xs font-mono text-[#7c3aed] font-bold">
                  {activeGroup.maxTeamSize - activeGroup.currentMemberCount} Open Slots Remaining
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGroup.members && activeGroup.members.length > 0 ? (
                  activeGroup.members.map((m) => {
                    const isLeader = m.role === 'LEADER' || m.studentId === activeGroup.leaderStudentId;
                    return (
                      <div
                        key={m.id}
                        className={`bg-white p-4 rounded-xl border space-y-2 flex flex-col justify-between shadow-sm ${
                          isLeader ? 'border-purple-300 bg-purple-50/50' : 'border-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                              {isLeader && <Crown className="w-4 h-4 text-[#8b5cf6]" />} {m.studentName}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              isLeader ? 'bg-[#8b5cf6] text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {isLeader ? 'LEADER' : 'MEMBER'}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-[#7c3aed] font-bold">Reg #{m.studentCode}</div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                            <GraduationCap className="w-3.5 h-3.5 text-[#8b5cf6]" /> {m.department}
                          </div>
                        </div>

                        {!isLeader && (
                          <div className="pt-2 border-t border-slate-100">
                            <button
                              onClick={() => handleRemoveMember(m.studentId, m.studentName)}
                              className="w-full py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition flex items-center justify-center gap-1"
                            >
                              <UserMinus className="w-3.5 h-3.5" /> Remove Member
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full p-8 text-center text-xs text-slate-500 font-medium">
                    No members have joined your team yet. Share your group with members in Group Openings!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EMPTY STATE WHEN NO GROUPS CREATED YET */
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
          <Crown className="w-16 h-16 text-[#8b5cf6] mx-auto" />
          <div className="space-y-2">
            <h2 className="text-[#7c3aed]xl font-extrabold text-slate-900">No Active Leader Group</h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              You haven't created a student group under your community yet. Click below to start your team, set team size, and invite student members!
            </p>
          </div>
          <button
            onClick={() => setCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-slate-900" /> Create My Student Group
          </button>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create Student Community Group">
        <form onSubmit={handleCreateGroup} className="space-y-4 text-xs text-slate-800">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Group / Team Name</label>
            <input
              type="text"
              required
              value={formData.groupName}
              onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
              placeholder="e.g. Web Dev Rebels, Robotics Core Alpha"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-[#8b5cf6]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Initial Max Team Size</label>
            <input
              type="number"
              min={1}
              max={50}
              required
              value={formData.maxTeamSize}
              onChange={(e) => setFormData({ ...formData, maxTeamSize: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-[#8b5cf6]"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              You can dynamically increase or decrease team capacity (+ / -) anytime after creation.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description / Project Goal</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Briefly describe what your team will work on..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-[#8b5cf6]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateModal(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold flex items-center gap-1.5 disabled:opacity-50 shadow-sm active:scale-95 transition"
            >
              {submitting ? 'Creating Group...' : 'Create & Launch Group'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyLeaderGroupPage;
