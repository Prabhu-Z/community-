import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { CheckSquare, Plus, Calendar, Clock, Users, Link2, FileText, CheckCircle2, ShieldCheck, ExternalLink, Eye, XCircle, Sparkles, Building2, Send, Check, Download } from 'lucide-react';

const CoordinatorTasksPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pendingFacultyTasks, setPendingFacultyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('faculty'); // 'faculty' or 'active'

  // Create Task Modal State
  const [createModal, setCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    targetYear: 'ALL',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const [reviewModal, setReviewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [subFilter, setSubFilter] = useState('ALL'); // 'ALL', 'FINISHED', 'NOT_FINISHED', 'AWAITING'

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

  const renderTaskCard = (task) => {
    const isCommunityTask = task.taskType === 'COMMUNITY_TASK' || task.assignedByFacultyName != null;
    return (
      <div key={task.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:border-slate-300 transition space-y-4 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isCommunityTask ? 'bg-purple-600/20 text-slate-800 border-purple-600/40' : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
            }`}>
              {isCommunityTask ? '🏛️ Community Task (Faculty)' : '📅 Daily Task (Coordinator)'}
            </span>
            <Badge status={task.status}>{task.status}</Badge>
          </div>

          <h3 className="font-sans text-xl font-bold text-slate-900">{task.title}</h3>
          {task.assignedByFacultyName && (
            <p className="text-[11px] text-[#7c3aed] font-mono">Faculty: {task.assignedByFacultyName}</p>
          )}
          <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-[#7c3aed]" /> Deadline: <span className="font-bold">{task.deadline}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-slate-700">
              <Users className="w-3.5 h-3.5 text-emerald-500" /> Submissions: <strong className="text-slate-900">{task.verifiedStudentCount || 0} / {task.assignedStudentCount} Verified</strong>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <button
            onClick={() => handleOpenReviewModal(task)}
            className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-200 text-[#8b5cf6] font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Eye className="w-4 h-4 text-[#7c3aed]" /> Review Student Proofs ({task.assignedStudentCount})
          </button>

          {/* ONLY COMMUNITY TASKS HAVE "Submit Completed Package to Admin" BUTTON */}
          {isCommunityTask && (
            task.status !== 'COMPLETED' ? (
              <button
                onClick={() => handleSubmitTaskToAdmin(task.id, task.title)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-900 font-extrabold text-xs shadow-lg hover:scale-[1.02] transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Completed Task Package to Admin
              </button>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center border border-emerald-500/30 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Submitted to Admin (COMPLETED)
              </div>
            )
          )}

          {!isCommunityTask && (
            <div className="p-2 text-[11px] text-slate-500 text-center italic font-mono border border-white/5 rounded-xl bg-white/5">
              ℹ️ Daily Task: Verified strictly by Coordinator (+1 Pt awarded per verified student).
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchCommunityAndTasks();
  }, [user]);

  const fetchCommunityAndTasks = async () => {
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
        const taskRes = await api.get(`/tasks/community/${myCommunity.id}`);
        setTasks(taskRes.data || []);

        const pendingRes = await api.get(`/tasks/community/${myCommunity.id}/pending-faculty`);
        setPendingFacultyTasks(pendingRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching coordinator tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFacultyTask = async (taskId, title) => {
    try {
      await api.put(`/tasks/${taskId}/accept`);
      alert(`✅ Community Task "${title}" accepted! Eligible community students can submit proofs.`);
      fetchCommunityAndTasks();
    } catch (err) {
      alert('Failed to accept task.');
    }
  };

  const handleRejectFacultyTask = async (taskId, title) => {
    const confirmed = window.confirm(`Decline faculty task proposal "${title}"?`);
    if (!confirmed) return;

    try {
      await api.put(`/tasks/${taskId}/reject`);
      alert(`Task proposal "${title}" declined.`);
      fetchCommunityAndTasks();
    } catch (err) {
      alert('Failed to decline task.');
    }
  };

  const handleSubmitTaskToAdmin = async (taskId, title) => {
    const confirmed = window.confirm(`Submit final completed task package for "${title}" to Admin / Faculty? The status will be marked as COMPLETED.`);
    if (!confirmed) return;

    try {
      await api.put(`/tasks/${taskId}/submit-to-admin`);
      alert(`🎉 Community Task "${title}" has been successfully submitted to Admin / Faculty! Status marked as COMPLETED.`);
      fetchCommunityAndTasks();
    } catch (err) {
      alert('Failed to submit task to admin.');
    }
  };

  const handleCreateDailyTask = async (e) => {
    e.preventDefault();
    if (!community?.id) return;
    setSubmitting(true);
    try {
      const taskPayload = {
        ...newTask,
        deadline: newTask.deadline ? newTask.deadline.replace('T', ' ') : ''
      };
      await api.post(`/tasks?communityId=${community.id}`, taskPayload);
      alert('📅 Daily Task assigned to community members! Verified strictly by coordinator (No submission to admin needed).');
      setCreateModal(false);
      setNewTask({ title: '', description: '', targetYear: 'ALL', deadline: '' });
      fetchCommunityAndTasks();
    } catch (err) {
      alert('Failed to assign daily task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReviewModal = async (task) => {
    setSelectedTask(task);
    setReviewModal(true);
    setSubFilter('ALL');
    setLoadingSubmissions(true);
    try {
      const res = await api.get(`/tasks/${task.id}/submissions`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Error fetching task submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleExportCSV = () => {
    if (!selectedTask || submissions.length === 0) return;
    
    // Header
    let csvContent = "\uFEFFStudent Name,Roll Number,Submission Status,Submitted Time,Proof Link\n";
    
    // Rows
    submissions.forEach(sub => {
      const name = `"${sub.studentName.replace(/"/g, '""')}"`;
      const code = `"${sub.studentCode.replace(/"/g, '""')}"`;
      const status = sub.status === 'PENDING' ? 'Not Finished' : sub.status;
      const date = sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A';
      const proof = sub.proofLink ? `"${sub.proofLink.replace(/"/g, '""')}"` : 'N/A';
      
      csvContent += `${name},${code},${status},${date},${proof}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${selectedTask.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_completion_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerifySubmission = async (submissionId) => {
    try {
      await api.put(`/tasks/submissions/${submissionId}/verify`);
      if (selectedTask) {
        const res = await api.get(`/tasks/${selectedTask.id}/submissions`);
        setSubmissions(res.data || []);
      }
      fetchCommunityAndTasks();
    } catch (err) {
      alert('Verification failed.');
    }
  };

  const handleRejectSubmission = async (submissionId) => {
    const reason = window.prompt(
      'Enter the reason for rejecting this task submission:',
      'Insufficient proof or invalid files attached.'
    );
    if (reason === null) return;

    try {
      await api.put(`/tasks/submissions/${submissionId}/reject`, { rejectionReason: reason });
      if (selectedTask) {
        const res = await api.get(`/tasks/${selectedTask.id}/submissions`);
        setSubmissions(res.data || []);
      }
      fetchCommunityAndTasks();
    } catch (err) {
      alert('Failed to reject submission.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading community task assignments..." />;

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

  const activeTasks = tasks.filter((t) => !isDeadlineExpired(t.deadline));
  const expiredTasks = tasks.filter((t) => isDeadlineExpired(t.deadline));

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sans font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7c3aed]" /> {community?.name || 'Community'} Workspace
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900 mt-1">Task Assignments & Verification</h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage 🏛️ <strong>Community Tasks</strong> (Faculty ➔ Coordinator ➔ Students) & 📅 <strong>Daily Tasks</strong> (Coordinator ➔ Students).
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-chestnut-700 to-purple-600 text-slate-900 font-bold text-xs shadow-lg hover:scale-105 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Daily Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'faculty'
              ? 'bg-gradient-to-r from-purple-600 to-purple-600 text-black shadow-sm font-extrabold'
              : 'bg-white text-slate-600 hover:text-[#7c3aed] border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Faculty Proposals ({pendingFacultyTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-gradient-to-r from-purple-600 to-purple-600 text-black shadow-sm font-extrabold'
              : 'bg-white text-slate-600 hover:text-[#7c3aed] border border-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-emerald-600" /> Active Tasks ({activeTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('expired')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'expired'
              ? 'bg-gradient-to-r from-purple-600 to-purple-600 text-black shadow-sm font-extrabold'
              : 'bg-white text-slate-600 hover:text-[#7c3aed] border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-rose-500" /> Expired Tasks ({expiredTasks.length})
        </button>
      </div>

      {/* TAB 1: FACULTY COMMUNITY TASKS (PENDING ACCEPTANCE) */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          {pendingFacultyTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingFacultyTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-600/10 to-transparent flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-600/20 text-slate-800 border border-purple-600/30 font-mono flex items-center gap-1">
                        🏛️ Faculty Community Task
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-600 text-black">
                        ACTION REQUIRED
                      </span>
                    </div>

                    <h3 className="font-sans text-xl font-bold text-slate-900">{task.title}</h3>
                    {task.assignedByFacultyName && (
                      <p className="text-xs text-[#8b5cf6] font-mono font-bold">
                        Assigned by: {task.assignedByFacultyName}
                      </p>
                    )}

                    <div className="p-3 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-600/90 leading-relaxed">
                      {task.description}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#7c3aed]" /> <strong>Deadline:</strong> {task.deadline}</div>
                      <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#7c3aed]" /> <strong>Target:</strong> {task.targetYear}</div>
                    </div>
                  </div>

                  {/* Accept / Decline Action Buttons */}
                  <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleRejectFacultyTask(task.id, task.title)}
                      className="py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" /> Decline Task
                    </button>
                    <button
                      onClick={() => handleAcceptFacultyTask(task.id, task.title)}
                      className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-900 text-xs font-extrabold shadow-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-900" /> Accept & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 shadow-sm rounded-3xl rounded-3xl border border-dashed border-stardustsilver-300/20">
              <Sparkles className="w-10 h-10 text-[#7c3aed]/40 mx-auto mb-3" />
              No pending faculty task proposals for {community?.name || 'your community'} at this time.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE TASKS */}
      {activeTab === 'active' && (
        activeTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTasks.map(renderTaskCard)}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 shadow-sm rounded-3xl border border-dashed">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            No active student tasks found in {community?.name || 'your community'} currently.
          </div>
        )
      )}

      {/* TAB 3: EXPIRED TASKS */}
      {activeTab === 'expired' && (
        expiredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75">
            {expiredTasks.map(renderTaskCard)}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 shadow-sm rounded-3xl border border-dashed">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            No expired student tasks found in {community?.name || 'your community'} currently.
          </div>
        )
      )}

      {/* REVIEW SUBMISSIONS MODAL */}
      {reviewModal && selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl max-w-3xl w-full p-6 lg:p-8 rounded-3xl border border-purple-200 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4 shrink-0">
              <div>
                <h3 className="font-sans text-xl font-bold text-slate-900">{selectedTask.title}</h3>
                <p className="text-[11px] text-[#7c3aed] font-mono">
                  {selectedTask.taskType === 'COMMUNITY_TASK' ? '🏛️ Faculty Community Task' : '📅 Coordinator Daily Task'} - Student Roster
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 text-xs font-extrabold transition flex items-center gap-1"
                  title="Export Completion Report to CSV"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button onClick={() => setReviewModal(false)} className="text-slate-600 hover:text-slate-900 text-lg font-bold px-2">✕</button>
              </div>
            </div>

            {/* Stat Summary Bar */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-4 shrink-0 font-sans text-[10px] md:text-xs">
              <div className="text-center">
                <span className="text-slate-500 block">Total Assigned</span>
                <strong className="text-slate-900 text-sm md:text-base font-extrabold">{submissions.length}</strong>
              </div>
              <div className="text-center border-l border-slate-100">
                <span className="text-emerald-600 font-bold block">Verified</span>
                <strong className="text-emerald-500 text-sm md:text-base font-extrabold">
                  {submissions.filter(s => s.status === 'VERIFIED').length}
                </strong>
              </div>
              <div className="text-center border-l border-slate-100">
                <span className="text-amber-600 font-bold block">Awaiting Review</span>
                <strong className="text-amber-500 text-sm md:text-base font-extrabold">
                  {submissions.filter(s => s.status === 'SUBMITTED').length}
                </strong>
              </div>
              <div className="text-center border-l border-slate-100">
                <span className="text-slate-600 block">Not Finished</span>
                <strong className="text-slate-500 text-sm md:text-base font-extrabold">
                  {submissions.filter(s => s.status === 'PENDING').length}
                </strong>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 mb-3 overflow-x-auto shrink-0">
              <button
                onClick={() => setSubFilter('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  subFilter === 'ALL'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                onClick={() => setSubFilter('AWAITING')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  subFilter === 'AWAITING'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Awaiting Review ({submissions.filter(s => s.status === 'SUBMITTED').length})
              </button>
              <button
                onClick={() => setSubFilter('FINISHED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  subFilter === 'FINISHED'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Finished & Submitted ({submissions.filter(s => s.status !== 'PENDING').length})
              </button>
              <button
                onClick={() => setSubFilter('NOT_FINISHED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  subFilter === 'NOT_FINISHED'
                    ? 'bg-slate-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Not Finished Yet ({submissions.filter(s => s.status === 'PENDING').length})
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="p-8 text-center text-xs text-slate-600"><LoadingSpinner label="Fetching student submissions..." /></div>
            ) : submissions.length > 0 ? (
              <div className="overflow-y-auto pr-1 space-y-3 flex-1">
                {submissions.filter(sub => {
                  if (subFilter === 'FINISHED') return sub.status !== 'PENDING';
                  if (subFilter === 'NOT_FINISHED') return sub.status === 'PENDING';
                  if (subFilter === 'AWAITING') return sub.status === 'SUBMITTED';
                  return true;
                }).map((sub) => (
                  <div key={sub.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setReviewModal(false);
                            navigate(`/faculty/students/${sub.studentId}`);
                          }}
                          className="p-1 rounded-lg hover:bg-purple-100 text-[#7c3aed] transition"
                          title="View Student Portfolio Dashboard"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-slate-900 text-sm">{sub.studentName}</span>
                        <span className="text-[10px] font-mono text-[#7c3aed]">({sub.studentCode})</span>
                        <Badge status={sub.status}>{sub.status === 'PENDING' ? 'NOT FINISHED' : sub.status}</Badge>
                      </div>

                      {sub.proofLink && (
                        <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                          <Link2 className="w-3.5 h-3.5 text-[#7c3aed]" />
                          <a href={sub.proofLink} target="_blank" rel="noreferrer" className="text-[#8b5cf6] hover:underline flex items-center gap-1">
                            {sub.proofLink} <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        </div>
                      )}

                      {sub.proofFileName && (
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-600" /> File: {sub.proofFileName}
                        </div>
                      )}

                      {sub.rejectionReason && (
                        <div className="text-[10px] text-rose-400 font-mono pt-1">Reason: {sub.rejectionReason}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      {sub.status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleVerifySubmission(sub.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve (+1 Pt)
                          </button>
                          <button
                            onClick={() => handleRejectSubmission(sub.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                      {sub.status === 'VERIFIED' && <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Verified (+1 Pt)</span>}
                      {sub.status === 'PENDING' && <span className="text-xs text-slate-500 font-mono">Not Finished Yet</span>}
                      {sub.status === 'REJECTED' && <span className="text-xs text-rose-400 font-mono font-bold">Rejected (Decline)</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">No submissions found for this task.</div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW DAILY TASK MODAL */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Assign New Coordinator Daily Task">
        <form onSubmit={handleCreateDailyTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Daily Task Title</label>
            <input
              type="text"
              required
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="e.g. Daily LeetCode Problem Solving & Submission"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Target Student Year</label>
              <select
                value={newTask.targetYear}
                onChange={(e) => setNewTask({ ...newTask, targetYear: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-900"
              >
                <option value="ALL" className="bg-white text-slate-900">ALL YEARS (1st, 2nd, 3rd, 4th Year)</option>
                <option value="1st Year" className="bg-white text-slate-900">1st Year Only</option>
                <option value="2nd Year" className="bg-white text-slate-900">2nd Year Only</option>
                <option value="3rd Year" className="bg-white text-slate-900">3rd Year Only</option>
                <option value="4th Year" className="bg-white text-slate-900">4th Year Only</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Deadline</label>
              <input
                type="datetime-local"
                required
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Task Description & Guidelines</label>
            <textarea
              rows={4}
              required
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Detail daily task instructions, proof upload requirements..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-900"
            />
          </div>

          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-[11px] text-sky-300 font-mono">
            ℹ️ <strong>Daily Task Rule:</strong> Assigned to community members and verified strictly by Coordinator (+1 Pt awarded). Does not require submission to Admin.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-chestnut-700 to-purple-600 text-slate-900 font-bold text-xs shadow-lg disabled:opacity-50"
          >
            {submitting ? 'Assigning Task...' : 'Assign Daily Task to Members'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CoordinatorTasksPage;
