import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Modal from './Modal';
import Badge from './Badge';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { Users, UserCheck, Shield, Crown, Upload, Sparkles, Building2, Trash2, ArrowRightLeft, Eye } from 'lucide-react';

const CommunityDetailModal = ({ isOpen, onClose, community, onOpenAssignModal, onOpenImportModal, onDeleteCommunity }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role === 'ROLE_STUDENT';
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // States for transferring students
  const [movingMember, setMovingMember] = useState(null);
  const [allCommunities, setAllCommunities] = useState([]);
  const [targetCommunityId, setTargetCommunityId] = useState('');

  useEffect(() => {
    if (isOpen && community?.id) {
      fetchMembers();
    }
  }, [isOpen, community]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/memberships/community/${community.id}`);
      setMembers(res.data || []);
    } catch (err) {
      console.error('Error fetching community members:', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateMove = async (member) => {
    setMovingMember(member);
    setTargetCommunityId('');
    try {
      const res = await api.get('/communities');
      setAllCommunities(res.data || []);
    } catch (err) {
      console.error('Error fetching communities for transfer:', err);
    }
  };

  const handleExecuteMove = async () => {
    if (!targetCommunityId || !movingMember) return;
    try {
      setLoading(true);
      await api.put(`/memberships/${movingMember.id}/move?targetCommunityId=${targetCommunityId}`);
      setMovingMember(null);
      fetchMembers();
    } catch (err) {
      console.error('Error moving student:', err);
      alert('Failed to move student.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (membershipId) => {
    if (!window.confirm('Are you sure you want to remove this student from the community?')) return;
    try {
      setLoading(true);
      await api.delete(`/memberships/${membershipId}`);
      fetchMembers();
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Failed to remove student.');
    } finally {
      setLoading(false);
    }
  };

  if (!community) return null;

  // Separate members into Hierarchy Levels:
  // Level 2: Student Leaders
  const studentLeaders = members.filter(m => 
    m.role === 'STUDENT_COORDINATOR' || 
    m.role === 'STUDENT_LEADER' || 
    m.role === 'LEADER' ||
    m.role === 'PRESIDENT' ||
    m.role === 'VICE_PRESIDENT' ||
    m.role === 'SECRETARY'
  );

  // Level 3: Enrolled General Members
  const enrolledStudents = members.filter(m => !studentLeaders.some(sl => sl.id === m.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${community.name} - Hierarchy & Oversight`}>
      <div className="space-y-6 max-h-[78vh] overflow-y-auto pr-1">
        {/* Top Control Bar & Action Buttons */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7c3aed] border border-purple-200">
                {community.category}
              </span>
              <Badge status={community.status}>{community.status}</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-medium">{community.description}</p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto">
            {onOpenImportModal && (
              <button
                type="button"
                onClick={() => onOpenImportModal(community)}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] border border-purple-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Upload className="w-4 h-4 text-[#8b5cf6]" /> Bulk Import
              </button>
            )}

            {onOpenAssignModal && (
              <button
                type="button"
                onClick={() => onOpenAssignModal(community)}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <UserCheck className="w-4 h-4 text-white" /> Edit Leadership
              </button>
            )}

            {onDeleteCommunity && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to permanently delete the community "${community.name}"? This action will remove all associated members, events, registrations, tasks, and historical records.`)) {
                    onDeleteCommunity(community.id);
                  }
                }}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Trash2 className="w-4 h-4 text-rose-500" /> Delete
              </button>
            )}
          </div>
        </div>

        {/* HIERARCHY LEVEL 1: FACULTY LEADERSHIP & ADVISORS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#8b5cf6]" /> Level 1: Faculty Leadership & Advisors
            </h4>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">Primary Governance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Faculty Advisor Card */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-[#8b5cf6] font-bold text-base shrink-0">
                👨‍🏫
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Faculty Lead / Advisor</div>
                <div className="text-xs font-extrabold text-slate-900 truncate">{community.facultyCoordinator || 'Unassigned'}</div>
                <span className="inline-block mt-0.5 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#7c3aed] border border-purple-200">
                  FACULTY ADVISOR
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* HIERARCHY LEVEL 2: STUDENT LEADERS (LEADER GROUP) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" /> Level 2: Student Leaders ({studentLeaders.length})
            </h4>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">Executive Team & Officers</span>
          </div>

          {studentLeaders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {studentLeaders.map((leader) => (
                <div
                  key={leader.id}
                  className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 shadow-sm flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-xs shrink-0">
                      👑
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-extrabold text-slate-900 truncate">{leader.studentName}</div>
                      <div className="text-[10px] text-slate-600 truncate font-medium">
                        {leader.department} • Reg #{leader.studentCode}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-block">
                      {leader.role.replace('_', ' ')}
                    </span>
                    {!isStudent && (
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5">
                        <button
                          onClick={() => {
                            onClose();
                            navigate(`/faculty/students/${leader.studentId || leader.id}`);
                          }}
                          className="p-1 rounded-lg hover:bg-amber-100 text-amber-800 transition"
                          title="View Student Extracurricular Portfolio Dashboard"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleInitiateMove(leader)}
                          className="p-1 rounded-lg hover:bg-amber-100 text-amber-800 transition"
                          title="Move student to another community"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveStudent(leader.id)}
                          className="p-1 rounded-lg hover:bg-rose-100 text-rose-700 transition"
                          title="Remove student from this community"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl font-medium">
              No extra executive student leaders assigned yet.
            </div>
          )}
        </div>

        {/* HIERARCHY LEVEL 3: ENROLLED STUDENTS */}
        {!isStudent && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#8b5cf6]" /> Level 3: Enrolled Students ({enrolledStudents.length})
              </h4>
              <span className="text-xs font-mono text-[#7c3aed] font-bold px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200">
                Capacity: {members.length} / {community.maxSize || 100}
              </span>
            </div>

            {loading ? (
              <LoadingSpinner label="Loading hierarchy member roster..." />
            ) : enrolledStudents.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {enrolledStudents.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs hover:border-[#8b5cf6]/40 transition shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-[#7c3aed] font-bold text-xs shrink-0">
                        {m.studentName ? m.studentName[0] : 'S'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-900 truncate">{m.studentName}</div>
                        <div className="text-[10px] text-slate-500 truncate font-medium">
                          {m.department} • Reg #{m.studentCode}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                        {m.role || 'MEMBER'}
                      </span>
                      <Badge status={m.status}>{m.status}</Badge>
                      {!isStudent && (
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5">
                          <button
                            onClick={() => {
                              onClose();
                              navigate(`/faculty/students/${m.studentId || m.id}`);
                            }}
                            className="p-1 rounded-lg hover:bg-purple-50 text-slate-500 hover:text-[#7c3aed] transition"
                            title="View Student Extracurricular Portfolio Dashboard"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleInitiateMove(m)}
                            className="p-1 rounded-lg hover:bg-purple-50 text-slate-500 hover:text-[#7c3aed] transition"
                            title="Move student to another community"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveStudent(m.id)}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                            title="Remove student from this community"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl font-medium">
                No general enrolled student members found for this community yet.
              </div>
            )}
          </div>
        )}
      </div>

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
                  {allCommunities
                    .filter((c) => c.id !== community.id)
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
    </Modal>
  );
};

export default CommunityDetailModal;
