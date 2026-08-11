import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { CheckSquare, Plus, Calendar, Clock, Users, ShieldCheck, Eye, Sparkles, Building2, AlertCircle, ChevronRight, CheckCircle2, Lock } from 'lucide-react';

const FacultyTasksPage = () => {
  const { user } = useAuth();
  const [groupedTasks, setGroupedTasks] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Task Modal for Viewing Accepted Communities
  const [selectedGroupedTask, setSelectedGroupedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Faculty Task Broadcast Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskTargetType, setTaskTargetType] = useState('ALL'); // 'ALL' or specific community ID
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    targetYear: 'ALL',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59',
    taskType: 'COMMUNITY_TASK'
  });

  const [taskFilter, setTaskFilter] = useState('active'); // 'active' or 'expired'

  const isDeadlineExpired = (deadlineStr) => {
    if (!deadlineStr) return false;
    try {
      const clean = deadlineStr.replace('T', ' ').trim();
      if (clean.length >= 16) {
        const parts = clean.substring(0, 16).split(' ');
        const dateParts = parts[0].split('-');
        const timeParts = parts[1].split(':');
        const deadlineDate = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
          parseInt(timeParts[0]),
          parseInt(timeParts[1])
        );
        return new Date() > deadlineDate;
      }
      if (clean.length >= 10) {
        const dateParts = clean.substring(0, 10).split('-');
        const deadlineDate = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
          23,
          59,
          59
        );
        return new Date() > deadlineDate;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  useEffect(() => {
    fetchTasksAndCommunities();
  }, []);

  const fetchTasksAndCommunities = async () => {
    setLoading(true);
    try {
      const [tasksRes, commRes] = await Promise.all([
        api.get('/tasks/faculty/grouped').catch(() => ({ data: [] })),
        api.get('/communities').catch(() => ({ data: [] }))
      ]);
      setGroupedTasks(tasksRes?.data || []);
      setAllCommunities(commRes?.data || []);
    } catch (err) {
      console.error('Error fetching faculty tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProposeFacultyTask = async (e) => {
    e.preventDefault();
    setTaskSubmitting(true);
    try {
      const facultyNameParam = encodeURIComponent(user?.name || user?.email || 'Faculty Office');
      const payload = {
        ...taskForm,
        taskType: 'COMMUNITY_TASK',
        assignedByFacultyName: user?.name || user?.email || 'Faculty Office'
      };

      if (taskTargetType === 'ALL') {
        await api.post(`/tasks/faculty/propose-all?facultyName=${facultyNameParam}`, payload);
        alert('🏛️ Task broadcast successfully to all 30+ campus communities!');
      } else {
        const commId = parseInt(taskTargetType);
        await api.post(`/tasks?communityId=${commId}`, payload);
        alert(`🏛️ Task assigned successfully to selected community!`);
      }

      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        targetYear: 'ALL',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 23:59',
        taskType: 'COMMUNITY_TASK'
      });
      fetchTasksAndCommunities();
    } catch (err) {
      console.error('Error proposing task:', err);
      alert(err.response?.data?.message || err.message || 'Failed to broadcast task proposal to coordinators.');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleOpenDetailModal = (task) => {
    setSelectedGroupedTask(task);
    setShowDetailModal(true);
  };

  if (loading) return <LoadingSpinner label="Loading administrative task oversight..." />;

  const activeGroupedTasks = groupedTasks.filter((t) => !isDeadlineExpired(t.deadline));
  const expiredGroupedTasks = groupedTasks.filter((t) => isDeadlineExpired(t.deadline));

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sans font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7c3aed]" /> Admin Extracurricular Workspace
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900 mt-1">Task Assignments & Broadcasts</h1>
          <p className="text-xs text-slate-600 mt-1">
            Propose, manage, and audit college-wide community challenges and NAAC compliance tasks.
          </p>
        </div>

        <button
          onClick={() => setShowTaskModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-chestnut-700 to-purple-600 text-slate-900 font-bold text-xs shadow-lg hover:scale-105 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Propose New Task
        </button>
      </div>

      {/* DEDICATED TABLE: FACULTY ASSIGNED COMMUNITY TASKS */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-[#8b5cf6]" /> Proposed Tasks & Community Acceptance
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Filter by active or expired deadlines. Click a row to view acceptance breakdowns per student chapter.
            </p>
          </div>
        </div>

        {/* Sub-tabs for Active vs Expired Tasks */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <button
            onClick={() => setTaskFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              taskFilter === 'active'
                ? 'bg-gradient-to-r from-purple-600 to-purple-600 text-black shadow-sm font-extrabold'
                : 'bg-white text-slate-600 hover:text-[#7c3aed] border border-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-600" /> Active Tasks ({activeGroupedTasks.length})
          </button>

          <button
            onClick={() => setTaskFilter('expired')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              taskFilter === 'expired'
                ? 'bg-gradient-to-r from-purple-600 to-purple-600 text-black shadow-sm font-extrabold'
                : 'bg-white text-slate-600 hover:text-[#7c3aed] border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-rose-500" /> Expired Tasks ({expiredGroupedTasks.length})
          </button>
        </div>

        {taskFilter === 'active' && (
          activeGroupedTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[#7c3aed] font-mono font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Task Title & Details</th>
                    <th className="py-3 px-4">Year & Deadline</th>
                    <th className="py-3 px-4">Community Acceptance Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {activeGroupedTasks.map((gt, idx) => {
                    const hasAccepted = gt.acceptedCommunitiesCount > 0;
                    return (
                      <tr
                        key={idx}
                        onClick={() => handleOpenDetailModal(gt)}
                        className="hover:bg-slate-50 cursor-pointer transition group"
                      >
                        <td className="py-4 px-4">
                          <div className="font-extrabold text-slate-900 text-sm group-hover:text-[#7c3aed] transition">{gt.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{gt.description}</div>
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px]">
                          <div>Target: <strong className="text-slate-900">{gt.targetYear}</strong></div>
                          <div className="text-slate-500 font-medium">{gt.deadline}</div>
                        </td>
                        <td className="py-4 px-4">
                          {hasAccepted ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                {gt.acceptedCommunitiesCount} / {gt.totalCommunitiesTargeted} Communities Accepted
                              </span>
                            </div>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold flex items-center gap-1.5 inline-flex">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                              No community has accepted this task yet
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetailModal(gt);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-[#8b5cf6] text-[#7c3aed] hover:text-white border border-purple-200 font-bold text-xs inline-flex items-center gap-1 transition shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Acceptance <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
              <CheckSquare className="w-8 h-8 text-[#8b5cf6] mx-auto mb-2" />
              No active proposed tasks found. Click "+ Propose New Task" to start.
            </div>
          )
        )}

        {taskFilter === 'expired' && (
          expiredGroupedTasks.length > 0 ? (
            <div className="overflow-x-auto opacity-75">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[#7c3aed] font-mono font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Task Title & Details</th>
                    <th className="py-3 px-4">Year & Deadline</th>
                    <th className="py-3 px-4">Community Acceptance Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {expiredGroupedTasks.map((gt, idx) => {
                    const hasAccepted = gt.acceptedCommunitiesCount > 0;
                    return (
                      <tr
                        key={idx}
                        onClick={() => handleOpenDetailModal(gt)}
                        className="hover:bg-slate-50 cursor-pointer transition group"
                      >
                        <td className="py-4 px-4">
                          <div className="font-extrabold text-slate-900 text-sm group-hover:text-[#7c3aed] transition">{gt.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{gt.description}</div>
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px]">
                          <div>Target: <strong className="text-slate-900">{gt.targetYear}</strong></div>
                          <div className="text-rose-500 font-bold">{gt.deadline} (Expired)</div>
                        </td>
                        <td className="py-4 px-4">
                          {hasAccepted ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                {gt.acceptedCommunitiesCount} / {gt.totalCommunitiesTargeted} Communities Accepted
                              </span>
                            </div>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold flex items-center gap-1.5 inline-flex">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                              No community has accepted this task yet
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetailModal(gt);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-[#8b5cf6] text-[#7c3aed] hover:text-white border border-purple-200 font-bold text-xs inline-flex items-center gap-1 transition shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Acceptance <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
              <Clock className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              No expired proposed tasks found.
            </div>
          )
        )}
      </div>

      {/* MODAL 1: COMMUNITY ACCEPTANCE ROSTER FOR SELECTED TASK */}
      {showDetailModal && selectedGroupedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-3xl w-full p-6 lg:p-8 relative max-h-[85vh] flex flex-col text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedGroupedTask.title}</h3>
                <p className="text-[11px] text-[#7c3aed] font-mono font-bold">
                  Community Acceptance Breakdown ({selectedGroupedTask.acceptedCommunitiesCount} / {selectedGroupedTask.totalCommunitiesTargeted} Accepted)
                </p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2">✕</button>
            </div>

            <div className="overflow-y-auto pr-1 space-y-6 flex-1 text-xs">
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                <div className="text-slate-800 leading-relaxed text-xs font-medium">{selectedGroupedTask.description}</div>
                <div className="flex flex-wrap gap-4 font-mono text-[11px] text-[#7c3aed] font-bold pt-2 border-t border-purple-100">
                  <span>Target Year: {selectedGroupedTask.targetYear}</span>
                  <span>Deadline: {selectedGroupedTask.deadline}</span>
                  <span>Assigned By: {selectedGroupedTask.assignedByFacultyName}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Communities That Accepted The Task ({selectedGroupedTask.communityAssignments.filter(ca => ca.status !== 'PENDING' && ca.status !== 'DECLINED').length})
                </h4>

                {selectedGroupedTask.communityAssignments.filter(ca => ca.status !== 'PENDING' && ca.status !== 'DECLINED').length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedGroupedTask.communityAssignments.filter(ca => ca.status !== 'PENDING' && ca.status !== 'DECLINED').map((ca) => (
                      <div key={ca.id} className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{ca.communityName}</div>
                          <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                            Status: <strong className="text-emerald-800 font-bold">{ca.status === 'COMPLETED' ? 'COMPLETED (Submitted to Admin)' : 'ASSIGNED & ACTIVE'}</strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] font-mono text-emerald-800 font-extrabold">
                            Verified Students: {ca.verifiedStudentCount} / {ca.assignedStudentCount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-center font-mono font-bold">
                    ⚠️ No community has accepted this task yet.
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#8b5cf6]" /> Communities Pending Review ({selectedGroupedTask.communityAssignments.filter(ca => ca.status === 'PENDING').length})
                </h4>

                {selectedGroupedTask.communityAssignments.filter(ca => ca.status === 'PENDING').length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {selectedGroupedTask.communityAssignments.filter(ca => ca.status === 'PENDING').map((ca) => (
                      <div key={ca.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{ca.communityName}</span>
                        <span className="text-[10px] font-mono text-[#7c3aed] font-bold">PENDING</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-center text-[11px]">
                    All communities have reviewed this task.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FACULTY PROPOSE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-lg w-full p-6 lg:p-8 relative text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-[#8b5cf6]" />
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Assign Campus Community Task</h3>
                  <p className="text-[10px] text-[#7c3aed] uppercase tracking-widest font-mono font-bold">Propose Task to Communities</p>
                </div>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProposeFacultyTask} className="space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Target Community Scope</label>
                <select
                  value={taskTargetType}
                  onChange={(e) => setTaskTargetType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-[#8b5cf6]"
                >
                  <option value="ALL" className="bg-white text-slate-900">📣 ALL COMMUNITIES (Broadcast to All 30+ Chapters)</option>
                  {allCommunities.map(c => (
                    <option key={c.id} value={c.id} className="bg-white text-slate-900">
                      👥 {c.name} ({c.studentCoordinator || 'No Coordinator'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. NAAC Criterion 5.3: Annual Activity Report Submission"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description & Guidelines</label>
                <textarea
                  required
                  rows={4}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe task goals, files required, and evaluation criteria..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Target Student Year</label>
                  <select
                    value={taskForm.targetYear}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, targetYear: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#8b5cf6]"
                  >
                    <option value="ALL">All Years</option>
                    <option value="1st Year">1st Year Only</option>
                    <option value="2nd Year">2nd Year Only</option>
                    <option value="3rd Year">3rd Year Only</option>
                    <option value="4th Year">4th Year Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Deadline Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={taskForm.deadline ? taskForm.deadline.replace(' ', 'T') : ''}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, deadline: e.target.value.replace('T', ' ') }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={taskSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-chestnut-700 to-purple-600 text-slate-900 font-extrabold shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
                >
                  {taskSubmitting ? 'Proposing...' : 'Propose Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyTasksPage;
