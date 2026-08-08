import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Plus, Award, CheckCircle2, XCircle, Clock, Link2, FileText, ShieldAlert, Sparkles, Users, Send } from 'lucide-react';

const StudentActivityRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [userMemberships, setUserMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    communityId: '',
    title: '',
    category: 'HACKATHON',
    description: '',
    proofLink: '',
    proofFileName: '',
    requestedPoints: 5,
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      let studentIdParam = user?.studentId || user?.id;

      // 1. Fetch student's submitted requests
      const reqRes = await api.get(`/activity-requests/student/${studentIdParam}`);
      setRequests(reqRes.data || []);

      // 2. Fetch student's approved memberships
      let approvedMems = [];
      if (user?.studentId) {
        const memRes = await api.get(`/memberships/student/${user.studentId}`);
        approvedMems = (memRes.data || []).filter((m) => m.status === 'APPROVED');
      } else if (user?.id) {
        const userMemRes = await api.get(`/memberships/user/${user.id}`);
        approvedMems = (userMemRes.data || []).filter((m) => m.status === 'APPROVED');
      }

      setUserMemberships(approvedMems);

      if (approvedMems.length > 0) {
        setFormData((prev) => ({ ...prev, communityId: approvedMems[0].communityId }));
      }
    } catch (err) {
      console.error('Error fetching activity requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.communityId) {
      alert('Please select a community you belong to.');
      return;
    }

    setSubmitting(true);
    try {
      let studentIdParam = user?.studentId || user?.id;
      const payload = {
        ...formData,
        studentId: studentIdParam,
        communityId: parseInt(formData.communityId),
        requestedPoints: parseInt(formData.requestedPoints) || 5,
      };

      await api.post('/activity-requests', payload);
      alert('🎉 Activity Achievement Request submitted! Your Faculty Coordinator will review & grant gamification points.');
      setShowModal(false);
      setFormData({
        communityId: userMemberships.length > 0 ? userMemberships[0].communityId : '',
        title: '',
        category: 'HACKATHON',
        description: '',
        proofLink: '',
        proofFileName: '',
        requestedPoints: 5,
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit activity request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading individual achievement claims..." />;

  const isMemberOfAnyCommunity = userMemberships.length > 0;
  const totalPointsGranted = requests
    .filter((r) => r.status === 'APPROVED')
    .reduce((acc, r) => acc + (r.grantedPoints || 0), 0);

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-sans font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#7c3aed]" /> Individual Achievement Claims & Point Evaluation
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900 mt-1">Activity Requests</h1>
          <p className="text-xs text-slate-600 mt-1">
            Submit external hackathon wins, research papers, certifications, and projects to your Faculty Coordinator for point awards.
          </p>
        </div>

        {isMemberOfAnyCommunity ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-600 text-black font-extrabold text-xs shadow-sm hover:scale-105 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Submit Achievement Claim
          </button>
        ) : (
          <div className="px-4 py-2.5 rounded-xl bg-purple-600/10 border border-purple-600/30 text-slate-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#7c3aed] shrink-0" />
            <span>Join a community to submit activity claims</span>
          </div>
        )}
      </div>

      {/* Metric Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-slate-200 flex items-center justify-center text-[#7c3aed]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[#7c3aed]xl font-sans font-extrabold text-slate-900">+{totalPointsGranted} Pts</div>
            <div className="text-[10px] text-[#7c3aed] font-mono">Granted Points Earned</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[#7c3aed]xl font-sans font-extrabold text-slate-900">
              {requests.filter((r) => r.status === 'APPROVED').length} Claims
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">Approved Achievements</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-[#7c3aed]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[#7c3aed]xl font-sans font-extrabold text-slate-900">
              {requests.filter((r) => r.status === 'PENDING').length} Pending
            </div>
            <div className="text-[10px] text-[#7c3aed] font-mono">Under Coordinator Review</div>
          </div>
        </div>
      </div>

      {/* Main List of Submitted Claims */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-200 space-y-6">
        <h3 className="font-sans text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#7c3aed]" /> Submitted Activity Claims ({requests.length})
        </h3>

        {requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((r) => (
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

                  <div>
                    <h4 className="font-sans text-lg font-bold text-slate-900">{r.title}</h4>
                    <p className="text-xs text-[#7c3aed] font-sans font-bold mt-0.5">{r.communityName}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-[#eef2f6] p-3 rounded-xl border border-slate-200">
                    {r.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                    <div>Requested: <strong className="text-slate-900">{r.requestedPoints || 5} Pts</strong></div>
                    <div>
                      Granted: <strong className="text-slate-800">{r.grantedPoints ? `+${r.grantedPoints} Pts` : 'Pending'}</strong>
                    </div>
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
                      <div className="text-[10px] text-[#7c3aed] font-bold uppercase">Coordinator Feedback:</div>
                      <p className="text-slate-600/90 italic">{r.coordinatorFeedback}</p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200">
                  Submitted: {r.createdAt ? new Date(r.createdAt).toLocaleString() : 'Recently'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 shadow-sm rounded-2xl rounded-2xl border border-dashed border-slate-200 space-y-4">
            <Award className="w-10 h-10 text-[#7c3aed]/40 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-slate-900">No Activity Claims Submitted Yet</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Have you won a hackathon, earned a technical certification, or completed an external project? Submit an activity claim to your Faculty Coordinator for point awards!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT ACTIVITY CLAIM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-white text-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl max-w-lg w-full p-6 lg:p-8 rounded-3xl border border-purple-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-[#7c3aed]" />
                <div>
                  <h3 className="font-sans text-xl font-bold text-slate-900">Submit Activity Claim</h3>
                  <p className="text-[10px] text-[#7c3aed] uppercase tracking-widest font-mono">Individual Achievement Point Request</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-600 hover:text-slate-900 text-lg font-bold px-2">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Target Community</label>
                <select
                  required
                  value={formData.communityId}
                  onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 font-bold"
                >
                  <option value="" className="bg-white text-slate-900">-- Select Joined Community --</option>
                  {userMemberships.map((m) => (
                    <option key={m.communityId} value={m.communityId} className="bg-white text-slate-900">
                      {m.communityName}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  Note: Activity requests can strictly be submitted only to communities you have joined.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Achievement Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 1st Winner - National AI & Cloud Hackathon"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900"
                  >
                    <option value="HACKATHON" className="bg-white text-slate-900">HACKATHON</option>
                    <option value="CERTIFICATION" className="bg-white text-slate-900">CERTIFICATION</option>
                    <option value="RESEARCH" className="bg-white text-slate-900">RESEARCH PAPER</option>
                    <option value="COMPETITION" className="bg-white text-slate-900">COMPETITION</option>
                    <option value="VOLUNTEERING" className="bg-white text-slate-900">VOLUNTEERING</option>
                    <option value="PROJECT" className="bg-white text-slate-900">PROJECT</option>
                    <option value="OTHER" className="bg-white text-slate-900">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Requested Points (Suggestion)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.requestedPoints}
                    onChange={(e) => setFormData({ ...formData, requestedPoints: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Description & Contribution</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail your role, achievement, project URL, or key learnings..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Proof URL / Certificate Link</label>
                <input
                  type="url"
                  value={formData.proofLink}
                  onChange={(e) => setFormData({ ...formData, proofLink: e.target.value })}
                  placeholder="https://certificate.org/verify/12345"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-900 font-bold hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-600 text-black font-extrabold shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'} <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentActivityRequestsPage;
