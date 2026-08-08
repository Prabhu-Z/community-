import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { 
  ArrowLeft, 
  Upload, 
  UserCheck, 
  Shield, 
  Crown, 
  Users, 
  Building2, 
  Search, 
  CheckCircle2, 
  FileSpreadsheet, 
  Download, 
  ChevronRight,
  User,
  Sparkles,
  Layers
} from 'lucide-react';

const FacultyCommunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMember, setSearchMember] = useState('');

  // Modals on detail page
  const [assignModal, setAssignModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Leadership State
  const [assignData, setAssignData] = useState({
    name: '',
    category: 'TECHNICAL',
    maxSize: 100,
    facultyCoordinator: '',
    studentCoordinator: '',
    coordinatorUserId: '',
  });
  const [selectedStudentMembershipId, setSelectedStudentMembershipId] = useState('');

  // Bulk Import State
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    fetchCommunityData();
  }, [id]);

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      const [commRes, membRes, groupsRes] = await Promise.all([
        api.get(`/communities/${id}`),
        api.get(`/memberships/community/${id}`).catch(() => ({ data: [] })),
        api.get(`/community-groups/community/${id}`)
          .catch(() => api.get(`/community-groups/community/${id}/approved`))
          .catch(() => ({ data: [] }))
      ]);

      setCommunity(commRes.data);
      setMembers(membRes.data || []);
      setGroups(groupsRes.data || []);

      if (commRes.data) {
        setAssignData({
          name: commRes.data.name || '',
          category: commRes.data.category || 'TECHNICAL',
          maxSize: commRes.data.maxSize || 100,
          facultyCoordinator: commRes.data.facultyCoordinator || '',
          studentCoordinator: commRes.data.studentCoordinator || '',
          coordinatorUserId: commRes.data.coordinatorUserId || '',
        });
      }
    } catch (err) {
      console.error('Error fetching community detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCoordinator = async (e) => {
    e.preventDefault();
    if (!community) return;
    setSubmitting(true);
    try {
      const parsedUserId = assignData.coordinatorUserId ? parseInt(assignData.coordinatorUserId) : null;
      await api.put(`/communities/${community.id}`, {
        ...community,
        name: assignData.name,
        category: assignData.category,
        maxSize: parseInt(assignData.maxSize) || 100,
        facultyCoordinator: assignData.facultyCoordinator,
        studentCoordinator: assignData.studentCoordinator,
        coordinatorUserId: parsedUserId,
      });

      if (selectedStudentMembershipId) {
        await api.put(`/memberships/${selectedStudentMembershipId}/assign-leader`).catch(() => {});
      }

      setAssignModal(false);
      fetchCommunityData();
    } catch (err) {
      console.error('Failed to update community & coordinators:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent = "register number,name,mail id,department,year\n" +
                       "21CS001,John Doe,john.doe@student.college.edu,Computer Science,3\n" +
                       "21CS002,Jane Smith,jane.smith@student.college.edu,Information Technology,2\n" +
                       "21CS003,Alex Johnson,alex.johnson@student.college.edu,Electronics,1\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    if (!community || !importFile) return;
    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await api.post(`/communities/${community.id}/import-students`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(res.data);
      fetchCommunityData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to import spreadsheet.');
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading community hierarchy & leader teams..." />;

  if (!community) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Community Not Found</h2>
        <button onClick={() => navigate('/faculty/communities')} className="px-4 py-2 bg-[#8b5cf6] text-white rounded-xl font-bold text-xs">
          ← Back to All Communities
        </button>
      </div>
    );
  }

  // Identify Student Leader Memberships
  const isLeaderRole = (role) => {
    if (!role) return false;
    const r = role.toUpperCase();
    return (
      r.includes('COORDINATOR') || 
      r.includes('LEADER') || 
      r.includes('LEAD') || 
      r.includes('PRESIDENT') || 
      r.includes('SECRETARY') ||
      r.includes('ORGANIZER')
    );
  };

  const leaderMemberships = members.filter(m => isLeaderRole(m.role));

  // Build Leader Teams Structure:
  // Combine explicit community-groups AND leader memberships
  const leaderTeams = [];
  const processedStudentIds = new Set();

  // 1. Process explicit groups from backend
  groups.forEach(g => {
    const leaderName = g.leaderStudentName || g.leaderName || 'Student Leader';
    const groupMembers = g.members || g.students || [];

    // Track processed student IDs so we don't duplicate them in unassigned general list
    if (g.leaderStudentId) processedStudentIds.add(g.leaderStudentId);
    groupMembers.forEach(m => {
      if (m.studentId) processedStudentIds.add(m.studentId);
      if (m.id) processedStudentIds.add(m.id);
    });

    leaderTeams.push({
      groupId: g.id,
      groupName: g.groupName || 'Student Team',
      description: g.description,
      leaderName: leaderName,
      leaderStudentCode: g.leaderStudentCode || '',
      leaderDepartment: g.leaderDepartment || '',
      maxTeamSize: g.maxTeamSize || 5,
      members: groupMembers
    });
  });

  // 2. Add leader memberships that don't have a created group yet
  leaderMemberships.forEach(lm => {
    const alreadyInGroup = leaderTeams.some(t => t.leaderName === lm.studentName);
    if (!alreadyInGroup) {
      processedStudentIds.add(lm.studentId);

      // Find any members who might report to this leader or leave team empty
      leaderTeams.push({
        groupId: `mem-leader-${lm.id}`,
        groupName: `${lm.studentName}'s Team`,
        description: `Leadership Group led by ${lm.studentName} (${lm.role || 'STUDENT LEADER'})`,
        leaderName: lm.studentName,
        leaderStudentCode: lm.studentCode,
        leaderDepartment: lm.department,
        maxTeamSize: 10,
        members: []
      });
    }
  });

  // Unassigned General Students
  const unassignedStudents = members.filter(m => {
    if (isLeaderRole(m.role)) return false;
    return !processedStudentIds.has(m.studentId) && !processedStudentIds.has(m.id);
  });

  const filteredUnassigned = unassignedStudents.filter(m =>
    (m.studentName && m.studentName.toLowerCase().includes(searchMember.toLowerCase())) ||
    (m.studentCode && m.studentCode.toLowerCase().includes(searchMember.toLowerCase())) ||
    (m.department && m.department.toLowerCase().includes(searchMember.toLowerCase()))
  );

  return (
    <div className="space-y-8 p-2 lg:p-4">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/faculty/communities')}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4 text-[#8b5cf6]" /> Back to All 30+ Communities
        </button>

        {/* Top Control Buttons Requested by User */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setImportModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] border border-purple-200 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <Upload className="w-4 h-4 text-[#8b5cf6]" /> Bulk Import Spreadsheet
          </button>
          <button
            onClick={() => setAssignModal(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition active:scale-95"
          >
            <UserCheck className="w-4 h-4 text-white" /> Edit Leadership
          </button>
        </div>
      </div>

      {/* Main Community Header Banner */}
      <div className="bg-gradient-to-r from-purple-100 via-purple-50 to-white border border-purple-200 shadow-sm rounded-3xl p-6 lg:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-[#7c3aed] border border-purple-200">
                {community.category}
              </span>
              <Badge status={community.status}>{community.status}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">{community.name}</h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-3xl mt-1 leading-relaxed font-medium">
              {community.description}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm shrink-0 min-w-[220px]">
            <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Total Membership & Capacity</div>
            <div className="text-2xl font-extrabold text-[#7c3aed] mt-0.5 font-mono">
              {members.length} / {community.maxSize || 100}
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200 mt-2">
              <div
                className={`h-full rounded-full transition-all ${
                  members.length >= (community.maxSize || 100) ? 'bg-rose-500' : 'bg-[#8b5cf6]'
                }`}
                style={{ width: `${Math.min(100, Math.round((members.length / (community.maxSize || 100)) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* LEVEL 1: FACULTY ADVISORS & LEADERSHIP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#8b5cf6]" /> Level 1: Faculty Leadership & Advisors
          </h2>
          <span className="text-xs font-mono text-slate-500 font-semibold">Primary Faculty Administrative Governance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Faculty Advisor Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-2xl shrink-0">
              👨‍🏫
            </div>
            <div className="overflow-hidden space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Faculty Lead / Advisor</div>
              <div className="text-lg font-extrabold text-slate-900 truncate">{community.facultyCoordinator || 'Dr. Faculty Advisor'}</div>
              <span className="inline-block text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7c3aed] border border-purple-200">
                FACULTY ADVISOR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LEVEL 2: STUDENT LEADERS & THEIR ASSIGNED STUDENT TEAMS */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" /> Level 2: Student Leaders & Their Assigned Student Teams ({leaderTeams.length} Teams)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Student Leaders displayed at the top of each group, with their assigned team members listed below in hierarchy order.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-bold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
            Leader-Group Hierarchy
          </span>
        </div>

        {leaderTeams.length > 0 ? (
          <div className="space-y-6">
            {leaderTeams.map((team, idx) => (
              <div key={team.groupId || idx} className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4">
                {/* STUDENT LEADER HEADER */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl shrink-0">
                      👑
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase">
                          Student Leader
                        </span>
                        <span className="text-xs font-bold text-slate-600">{team.groupName}</span>
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{team.leaderName}</h3>
                      {team.description && (
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">{team.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-white border border-amber-200 text-amber-900 inline-block shadow-sm">
                      Team Capacity: {team.members.length} / {team.maxTeamSize} Members
                    </span>
                  </div>
                </div>

                {/* ASSIGNED GROUP MEMBERS LISTED UNDER THE STUDENT LEADER */}
                <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-amber-300">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                    <Users className="w-4 h-4 text-[#8b5cf6]" /> Group Members Assigned to {team.leaderName} ({team.members.length})
                  </h4>

                  {team.members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                      {team.members.map((m, mIdx) => (
                        <div key={m.id || m.studentId || mIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs hover:border-[#8b5cf6]/40 transition shadow-sm">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 text-[#7c3aed] font-bold text-xs flex items-center justify-center shrink-0">
                              {m.studentName ? m.studentName[0] : 'S'}
                            </div>
                            <div className="overflow-hidden">
                              <div className="font-extrabold text-slate-900 truncate">{m.studentName || m.name}</div>
                              <div className="text-[10px] text-slate-500 font-medium truncate">
                                {m.department || 'Student'} {m.studentCode ? `• Reg #${m.studentCode}` : ''}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                            TEAM MEMBER
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-slate-500 text-xs font-medium">
                      No team members assigned to this group yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl font-medium">
            No specific student leader teams created yet. Student leaders can create teams under their Student Leader Portal.
          </div>
        )}
      </div>

      {/* LEVEL 3: UNASSIGNED ENROLLED GENERAL STUDENTS */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8b5cf6]" /> Level 3: General Enrolled Student Members ({unassignedStudents.length})
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Enrolled student members who are not assigned to a specific student leader group.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              placeholder="Search general members..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>
        </div>

        {filteredUnassigned.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#7c3aed] font-mono font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Register Code</th>
                  <th className="py-3 px-4">Department & Year</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredUnassigned.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-100 text-[#7c3aed] font-bold text-xs flex items-center justify-center">
                        {m.studentName ? m.studentName[0] : 'S'}
                      </div>
                      <span>{m.studentName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-[11px]">{m.studentCode}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{m.department}</td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px]">
                        {m.role || 'MEMBER'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge status={m.status}>{m.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            No unassigned general student members found.
          </div>
        )}
      </div>

      {/* MODAL 1: EDIT LEADERSHIP & ASSIGN COORDINATOR */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title={`Edit Leadership - ${community.name}`}>
        <form onSubmit={handleAssignCoordinator} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Community Name</label>
            <input
              type="text"
              required
              value={assignData.name}
              onChange={(e) => setAssignData({ ...assignData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={assignData.category}
                onChange={(e) => setAssignData({ ...assignData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
              >
                <option value="TECHNICAL">TECHNICAL</option>
                <option value="CULTURAL">CULTURAL</option>
                <option value="SERVICE">SERVICE</option>
                <option value="SPORTS">SPORTS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Capacity</label>
              <input
                type="number"
                required
                value={assignData.maxSize}
                onChange={(e) => setAssignData({ ...assignData, maxSize: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Coordinator Name</label>
            <input
              type="text"
              required
              value={assignData.facultyCoordinator}
              onChange={(e) => setAssignData({ ...assignData, facultyCoordinator: e.target.value })}
              placeholder="Dr. Admin Lead"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Head Name</label>
            <input
              type="text"
              required
              value={assignData.studentCoordinator}
              onChange={(e) => setAssignData({ ...assignData, studentCoordinator: e.target.value })}
              placeholder="Student Head"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Promote Approved Member to Student Leader</label>
            <select
              value={selectedStudentMembershipId}
              onChange={(e) => setSelectedStudentMembershipId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold"
            >
              <option value="">-- Optional: Select a member to promote to Student Leader --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  ⭐ {m.studentName} ({m.department})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAssignModal(false)}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-extrabold text-xs shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Leadership'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: BULK IMPORT SPREADSHEET */}
      <Modal isOpen={importModal} onClose={() => setImportModal(false)} title={`Bulk Import Students - ${community.name}`}>
        <form onSubmit={handleBulkImportSubmit} className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-2">
            <div className="font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#8b5cf6]" /> Bulk Import CSV / Excel Template
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
              Upload a <code>.csv</code> spreadsheet with student roster details to bulk enroll students directly into <strong>{community.name}</strong>.
            </p>
            <button
              type="button"
              onClick={handleDownloadCsvTemplate}
              className="px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-[#7c3aed] font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm hover:bg-purple-100 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download Sample CSV Template
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Spreadsheet File (.csv)</label>
            <input
              type="file"
              accept=".csv,.xlsx"
              required
              onChange={(e) => setImportFile(e.target.files[0])}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
            />
          </div>

          {importResult && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {importResult.message}
              </div>
              {importResult.addedStudentsCount !== undefined && (
                <div className="font-mono text-[11px]">
                  Enrolled Students Added: <strong>{importResult.addedStudentsCount}</strong>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setImportModal(false)}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={importing || !importFile}
              className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-extrabold text-xs shadow-sm disabled:opacity-50"
            >
              {importing ? 'Importing Roster...' : 'Upload & Import Spreadsheet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyCommunityDetailPage;
