import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

import { CheckSquare, Link2, Upload, FileText, CheckCircle2, Clock, XCircle, ExternalLink, Users, Sparkles, Calendar, AlertCircle, Lock } from 'lucide-react';

const StudentTasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [userMemberships, setUserMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category & Status Filter States
  const [taskTypeFilter, setTaskTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

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

  // Submission Modal State
  const [submitModal, setSubmitModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofLink, setProofLink] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileUrl, setProofFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchTasksAndMemberships();
  }, [user]);

  const fetchTasksAndMemberships = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let studentIdParam = user?.studentId || user?.id;
      let approvedMems = [];

      try {
        const memRes = await api.get(`/memberships/student/${studentIdParam}`);
        approvedMems = (memRes.data || []).filter(m => m.status === 'APPROVED');
      } catch (e) {
        if (user?.id) {
          const uMemRes = await api.get(`/memberships/user/${user.id}`).catch(() => ({ data: [] }));
          approvedMems = (uMemRes.data || []).filter(m => m.status === 'APPROVED');
        }
      }

      setUserMemberships(approvedMems);

      const res = await api.get(`/tasks/student/${studentIdParam}`).catch(() => ({ data: [] }));
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error fetching student tasks & memberships:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmitModal = (task) => {
    setSelectedTask(task);
    setProofLink(task.proofLink || '');
    setProofFileName(task.proofFileName || '');
    setProofFileUrl(task.proofFileUrl || '');
    setSuccessMsg('');
    setValidationError('');
    setSubmitModal(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFileName(file.name);
      const fakeUrl = URL.createObjectURL(file);
      setProofFileUrl(fakeUrl);
      setValidationError('');
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    const trimmedLink = (proofLink || '').trim();
    const trimmedFileName = (proofFileName || '').trim();
    const trimmedFileUrl = (proofFileUrl || '').trim();

    // Proof Validation Check: Must provide at least one proof
    if (!trimmedLink && !trimmedFileName && !trimmedFileUrl) {
      setValidationError('⚠️ Submission Blocked: You must provide a Proof URL/Link OR upload a proof photo/document before submitting.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg('');
    setValidationError('');
    try {
      await api.post(`/tasks/submissions/${selectedTask.id}/submit`, {
        proofLink: trimmedLink,
        proofFileName: trimmedFileName,
        proofFileUrl: trimmedFileUrl,
      });
      setSuccessMsg('Task proof submitted! Deliverable updated.');
      setTimeout(() => {
        setSubmitModal(false);
        setSuccessMsg('');
        fetchTasksAndMemberships();
      }, 1500);
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message;
      setValidationError(serverMsg || 'Failed to submit task proof. Please check your proof details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading assigned tasks and deliverables..." />;

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'ACTIVE') {
      if (t.status !== 'PENDING') return false;
    } else if (statusFilter === 'PAST_SUBMITTED') {
      if (t.status === 'PENDING') return false;
    }

    if (taskTypeFilter === 'COMMUNITY_TASK') {
      return t.taskType === 'COMMUNITY_TASK' || t.assignedByFacultyName != null;
    }
    if (taskTypeFilter === 'DAILY_TASK') {
      return t.taskType === 'DAILY_TASK' || t.assignedByFacultyName == null;
    }

    return true;
  });

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-[#7c3aed]" /> Deliverables & Proof Submissions
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">My Assigned Tasks</h1>
          <p className="text-xs text-slate-600 mt-1">
            Earn <strong>+1 Point</strong> for every verified task completion on your community leaderboard!
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-slate-200 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setTaskTypeFilter('COMMUNITY_TASK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              taskTypeFilter === 'COMMUNITY_TASK'
                ? 'bg-gradient-to-r from-[#8b5cf6] to-purple-600 text-black shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-[#7c3aed]'
            }`}
          >
            🏛️ Community Tasks
          </button>

          <button
            onClick={() => setTaskTypeFilter('DAILY_TASK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              taskTypeFilter === 'DAILY_TASK'
                ? 'bg-gradient-to-r from-[#8b5cf6] to-purple-600 text-black shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-[#7c3aed]'
            }`}
          >
            ⚡ Daily Tasks
          </button>

          <button
            onClick={() => setTaskTypeFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              taskTypeFilter === 'ALL'
                ? 'bg-gradient-to-r from-[#8b5cf6] to-purple-600 text-black shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-[#7c3aed]'
            }`}
          >
            All Types
          </button>
        </div>
      </div>



      {/* Status Filter Sub-Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-600/60 font-semibold mr-1">Filter Status:</span>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'ACTIVE'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:text-[#7c3aed] bg-slate-50'
            }`}
          >
            Active Tasks ({tasks.filter(t => t.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setStatusFilter('PAST_SUBMITTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === 'PAST_SUBMITTED'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:text-[#7c3aed] bg-slate-50'
            }`}
          >
            Past Submitted ({tasks.filter(t => t.status !== 'PENDING').length})
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((t) => {
            const isCommunityTask = t.taskType === 'COMMUNITY_TASK' || t.assignedByFacultyName != null;

            return (
              <div
                key={t.id}
                className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 hover:border-[#8b5cf6]/40 transition group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isCommunityTask ? 'bg-purple-600/20 text-slate-800 border-purple-600/30' : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    }`}>
                      {isCommunityTask ? '🏛️ Community Task' : '📅 Daily Task'}
                    </span>
                    <Badge status={t.status}>{t.status}</Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#7c3aed] transition">{t.taskTitle}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-sans">{t.taskDescription}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#7c3aed]" />
                      <span>
                        Deadline: <strong className="text-slate-900">{t.deadline}</strong>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600/60 font-mono">
                      <span>Community: {t.communityName}</span>
                      <span className="text-slate-800 font-bold">+1 Pt</span>
                    </div>
                  </div>

                  {/* Submitted Proof Details */}
                  {t.status !== 'PENDING' && (
                    <div className="p-3 rounded-xl bg-white/5 border border-slate-200 space-y-1.5 text-xs">
                      <div className="text-[10px] text-[#7c3aed] font-semibold uppercase tracking-wider">
                        Submitted Proof Details:
                      </div>
                      {t.proofLink && (
                        <a
                          href={t.proofLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#7c3aed] underline font-mono text-[11px] truncate flex items-center gap-1"
                        >
                          <Link2 className="w-3 h-3 text-[#7c3aed]" /> {t.proofLink} <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      )}
                      {t.proofFileName && (
                        <div className="text-slate-600 text-[11px] font-mono flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-600" /> {t.proofFileName}
                        </div>
                      )}
                      {t.status === 'REJECTED' && t.rejectionReason && (
                        <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-[11px] mt-1">
                          <strong>Reason:</strong> {t.rejectionReason}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200">
                  {isDeadlineExpired(t.deadline) && t.status !== 'VERIFIED' ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2"
                      title="The submission deadline for this task has passed."
                    >
                      <Lock className="w-4 h-4 text-slate-400" /> Deadline Expired
                    </button>
                  ) : (
                    <>
                      {t.status === 'PENDING' && (
                        <button
                          onClick={() => handleOpenSubmitModal(t)}
                          className="w-full py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition shadow-sm text-xs font-bold shadow-md flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4 text-black" /> Submit Task Proof
                        </button>
                      )}
                      {t.status === 'SUBMITTED' && (
                        <div className="py-2.5 rounded-xl bg-purple-500/20 text-[#8b5cf6] border border-[#8b5cf6]/30 font-bold text-xs flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#8b5cf6]" /> Submitted
                        </div>
                      )}
                      {t.status === 'VERIFIED' && (
                        <div className="py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Verified (+1 Pt Awarded)
                        </div>
                      )}
                      {t.status === 'REJECTED' && (
                        <button
                          onClick={() => handleOpenSubmitModal(t)}
                          className="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition"
                        >
                          <XCircle className="w-4 h-4 text-rose-400" /> Resubmit Task Proof
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-4 shadow-xl">
          <CheckSquare className="w-10 h-10 text-[#7c3aed]/40 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Tasks Matching Filter ({statusFilter})</h3>
            <p className="text-xs text-slate-600/60 mt-1 max-w-md mx-auto">
              Tasks assigned by your Faculty Coordinator appear strictly after joining that community!
            </p>
          </div>
        </div>
      )}

      {/* Modal: Task Submission */}
      <Modal
        isOpen={submitModal}
        onClose={() => setSubmitModal(false)}
        title={selectedTask ? `Submit Proof - ${selectedTask.taskTitle}` : 'Submit Task Proof'}
      >
        <form onSubmit={handleSubmitProof} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 text-sm">{selectedTask?.taskTitle}</div>
            <div className="text-slate-600 leading-relaxed text-xs">{selectedTask?.taskDescription}</div>
            <div className="text-[#7c3aed] font-mono text-[11px] pt-1">Deadline: {selectedTask?.deadline}</div>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> {validationError}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMsg}
            </div>
          )}

          {/* Proof Link Input */}
          <div>
            <label className="block font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#7c3aed]" /> Proof URL / Link (GitHub, Google Drive, Project Demo)
            </label>
            <input
              type="url"
              value={proofLink}
              onChange={(e) => {
                setProofLink(e.target.value);
                setValidationError('');
              }}
              placeholder="https://github.com/my-project or https://drive.google.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6] font-mono"
            />
          </div>

          {/* Proof File Attachment */}
          <div>
            <label className="block font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#7c3aed]" /> Upload Proof Screenshot / Photo / PDF
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-slate-200 text-slate-600 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 text-[#7c3aed] file:text-[#7c3aed] hover:file:bg-[#8b5cf6] text-white/30"
            />
            {proofFileName && (
              <div className="mt-1.5 text-xs text-[#7c3aed] flex items-center gap-1 font-mono">
                <FileText className="w-3.5 h-3.5" /> Selected File: {proofFileName}
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSubmitModal(false)}
              className="px-4 py-2 rounded-xl bg-white/10 text-slate-900 font-bold hover:bg-white/20 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition shadow-sm text-black font-bold text-xs shadow-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Task Proof'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentTasksPage;
