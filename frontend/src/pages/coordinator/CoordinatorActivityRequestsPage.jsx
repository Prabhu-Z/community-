import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Award, CheckCircle2, XCircle, Clock, Link2, FileText, Sparkles, UserCheck, GraduationCap, Building2 } from 'lucide-react';

const CoordinatorActivityRequestsPage = () => {
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' vs 'ALL'

  // Modal / Approval State
  const [selectedReq, setSelectedReq] = useState(null);
  const [grantedPoints, setGrantedPoints] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCommunityAndRequests();
  }, [user]);

  const fetchCommunityAndRequests = async () => {
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
        const res = await api.get(`/activity-requests/community/${myCommunity.id}`);
        setRequests(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching activity claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setSubmitting(true);
    try {
      await api.put(
        `/activity-requests/${selectedReq.id}/approve?points=${grantedPoints}&feedback=${encodeURIComponent(feedback)}`
      );
      alert(`✅ Approved achievement claim "${selectedReq.title}"! Awarded +${grantedPoints} Points to ${selectedReq.studentName}.`);
      setSelectedReq(null);
      fetchRequests();
    } catch (err) {
      alert('Failed to approve activity claim.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (reqObj) => {
    const reason = window.prompt(`Provide feedback for declining "${reqObj.title}":`, 'Proof verification unsuccessful.');
    if (reason === null) return;

    try {
      await api.put(`/activity-requests/${reqObj.id}/reject?feedback=${encodeURIComponent(reason)}`);
      alert(`Decline recorded for "${reqObj.title}". Notification sent to student.`);
      fetchRequests();
    } catch (err) {
      alert('Failed to reject claim.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading student activity claims..." />;

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

  const filteredRequests = requests.filter((r) => (activeTab === 'PENDING' ? r.status === 'PENDING' : true));

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sans font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#7c3aed]" /> Student Achievements & Gamification Point Awards
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900 mt-1">Activity Claim Approvals</h1>
          <p className="text-xs text-slate-600 mt-1">
            Review individual achievement claims submitted by students in your community & grant custom gamification points.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/90 px-4 py-2.5 rounded-2xl border border-slate-200 self-start sm:self-auto font-mono text-xs">
          <Award className="w-4 h-4 text-[#7c3aed]" />
          <span>Pending Claims: <strong className="text-slate-800">{requests.filter((r) => r.status === 'PENDING').length} Requests</strong></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'PENDING'
              ? 'bg-gradient-to-r from-purple-600 to-purple-600 text-black shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#7c3aed] border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" /> Pending Evaluation ({requests.filter((r) => r.status === 'PENDING').length})
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'ALL'
              ? 'bg-gradient-to-r from-purple-600 to-purple-600 text-black shadow-sm'
              : 'bg-white text-slate-600 hover:text-[#7c3aed] border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" /> All Claims History ({requests.length})
        </button>
      </div>

      {/* Request Grid */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4 hover:border-purple-200 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-chestnut-700/30 text-[#7c3aed] border border-purple-600/20">
                    {r.category}
                  </span>
                  <Badge status={r.status}>{r.status}</Badge>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>{r.studentName}</span>
                  <span className="text-[#8b5cf6] font-mono text-[11px]">(Reg #{r.studentCode})</span>
                </div>

                <div>
                  <h4 className="font-sans text-lg font-bold text-slate-900">{r.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{r.communityName}</p>
                </div>

                <p className="text-xs text-slate-600/90 leading-relaxed bg-[#eef2f6] p-3 rounded-xl border border-slate-200">
                  {r.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                  <div>Requested: <strong className="text-slate-900">{r.requestedPoints || 5} Pts</strong></div>
                  <div>Granted: <strong className="text-slate-800">{r.grantedPoints ? `+${r.grantedPoints} Pts` : 'Pending'}</strong></div>
                </div>

                {r.proofLink && (
                  <a
                    href={r.proofLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#8b5cf6] underline font-mono text-[11px] truncate flex items-center gap-1.5 pt-1"
                  >
                    <Link2 className="w-3.5 h-3.5" /> {r.proofLink}
                  </a>
                )}

                {r.coordinatorFeedback && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                    <div className="text-[10px] text-[#7c3aed] font-bold uppercase">Feedback Provided:</div>
                    <p className="text-slate-600/90 italic">{r.coordinatorFeedback}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons for Pending Claims */}
              {r.status === 'PENDING' && (
                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleReject(r)}
                    className="py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" /> Decline Claim
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReq(r);
                      setGrantedPoints(r.requestedPoints || 5);
                      setFeedback('Excellent achievement! Points awarded.');
                    }}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-900 text-xs font-extrabold shadow-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-900" /> Evaluate & Award Points
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 shadow-sm rounded-3xl rounded-3xl border border-dashed border-slate-200">
          <Award className="w-10 h-10 text-[#7c3aed]/40 mx-auto mb-3" />
          No activity requests found for this filter tab.
        </div>
      )}

      {/* EVALUATION & POINT AWARDING MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-white text-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl max-w-md w-full p-6 lg:p-8 rounded-3xl border border-purple-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-[#7c3aed]" />
                <div>
                  <h3 className="font-sans text-xl font-bold text-slate-900">Award Gamification Points</h3>
                  <p className="text-[10px] text-[#7c3aed] font-mono">Evaluate Achievement Claim</p>
                </div>
              </div>
              <button onClick={() => setSelectedReq(null)} className="text-slate-600 hover:text-slate-900 text-lg font-bold px-2">
                ✕
              </button>
            </div>

            <form onSubmit={handleApprove} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="font-sans font-bold text-slate-900 text-sm">{selectedReq.title}</div>
                <div className="text-[11px] text-[#8b5cf6]">Submitted by: {selectedReq.studentName}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Points to Grant</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={grantedPoints}
                  onChange={(e) => setGrantedPoints(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 text-slate-900 font-bold text-base text-slate-800 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Requested by student: {selectedReq.requestedPoints || 5} Pts
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Feedback / Notes</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Approved! Great job winning 1st place in national hackathon."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-900 font-bold hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-900 font-extrabold shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Granting Points...' : 'Approve & Award Points'} <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorActivityRequestsPage;
