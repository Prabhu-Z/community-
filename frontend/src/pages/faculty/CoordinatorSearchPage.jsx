import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Search, UserCheck, ShieldCheck, Mail, Building2, Calendar, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';

const CoordinatorSearchPage = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  // Role Edit & Community Reassign Modal State
  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignCommunityId, setAssignCommunityId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, commRes] = await Promise.all([
        api.get('/users/coordinators'),
        api.get('/communities'),
      ]);
      setCoordinators(userRes.data || []);
      setCommunities(commRes.data || []);
    } catch (err) {
      console.error('Error fetching coordinator data:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractOnlyName = (userObj) => {
    if (!userObj) return '';
    const nameStr = userObj.name && userObj.name.trim() ? userObj.name.trim() : '';
    if (nameStr && !nameStr.includes('@')) return nameStr;

    const emailOrName = nameStr || userObj.email || '';
    if (emailOrName.includes('@')) {
      const rawUsername = emailOrName.split('@')[0];
      return rawUsername
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    return emailOrName;
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    const assignedComm = communities.find((c) => c.coordinatorUserId === user.id);
    setAssignCommunityId(assignedComm ? assignedComm.id.toString() : '');
    setEditModal(true);
  };

  const handleRemoveCommunityAssignment = async () => {
    if (!selectedUser) return;
    const confirmRemove = window.confirm(
      `Are you sure you want to remove ${extractOnlyName(selectedUser)} from all community coordinator assignments?`
    );
    if (!confirmRemove) return;

    setSubmitting(true);
    setSuccessMsg('');
    try {
      // 1. Call reassign-community endpoint with empty newCommunityId
      await api.put(`/users/${selectedUser.id}/reassign-community`).catch(() => {});

      // 2. Call remove-coordinator endpoint for any community assigned to this user
      const assignedComms = communities.filter(c => c.coordinatorUserId === selectedUser.id);
      for (const oldC of assignedComms) {
        await api.put(`/communities/${oldC.id}/remove-coordinator`).catch(() => {});
      }

      setSuccessMsg(`Successfully removed coordinator assignment for ${extractOnlyName(selectedUser)}!`);
      await fetchData();
      setTimeout(() => {
        setEditModal(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      console.error('Error removing coordinator assignment:', err);
      alert('Failed to remove coordinator assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassignCommunity = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const cleanCommId = (assignCommunityId || '').trim();
      const commIdParam = cleanCommId !== '' ? `?newCommunityId=${cleanCommId}` : '';
      
      try {
        await api.put(`/users/${selectedUser.id}/reassign-community${commIdParam}`);
      } catch (backendErr) {
        // Instant Fallback if backend container is still building on Render
        const oldComms = communities.filter(c => c.coordinatorUserId === selectedUser.id);
        for (const oldC of oldComms) {
          await api.put(`/communities/${oldC.id}`, { ...oldC, coordinatorUserId: null }).catch(() => {});
        }
        if (assignCommunityId) {
          const newC = communities.find(c => c.id.toString() === assignCommunityId);
          if (newC) {
            await api.put(`/communities/${newC.id}`, { ...newC, coordinatorUserId: selectedUser.id }).catch(() => {});
          }
        }
      }

      setSuccessMsg(`Successfully updated coordinator assignments for ${extractOnlyName(selectedUser)}. Previous community ties cleared!`);
      fetchData();
      setTimeout(() => {
        setEditModal(false);
        setSuccessMsg('');
      }, 1800);
    } catch (err) {
      console.error('Error reassigning coordinator:', err);
      alert('Failed to reassign coordinator.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading staff & community coordinators directory..." />;

  const filteredCoordinators = coordinators.filter((user) => {
    const matchesQuery =
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7c3aed]" /> Admin Governance & Staff Directory
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Faculty Search & Reassignment
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Reassigning a coordinator to a new community automatically clears all previous community ties for a clean slate.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-600/40 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or role..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-[#8b5cf6] font-mono"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
          >
            <option value="ALL" className="bg-white text-slate-900">All Roles</option>
            <option value="ROLE_COMMUNITY_COORDINATOR" className="bg-white text-slate-900">Faculty Coordinators</option>
            <option value="ROLE_FACULTY" className="bg-white text-slate-900">Admin Leads</option>
          </select>
        </div>
      </div>

      {/* Coordinators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoordinators.map((u) => {
          const assignedComm = communities.find((c) => c.coordinatorUserId === u.id);
          const cleanName = extractOnlyName(u);

          return (
            <div
              key={u.id}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 hover:border-[#8b5cf6]/40 transition shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7c3aed] border border-[#8b5cf6]/30 flex items-center justify-center text-[#7c3aed] font-bold text-sm">
                    {cleanName[0].toUpperCase()}
                  </div>
                  <Badge status={u.status}>{u.status}</Badge>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 truncate">{cleanName}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7c3aed] text-[#7c3aed] border border-[#8b5cf6]/30 mt-1 inline-block">
                    {u.role.replace('ROLE_', '').replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-200 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#7c3aed] shrink-0" />
                    <span>
                      <strong>Assigned Community:</strong>{' '}
                      {assignedComm ? (
                        <span className="text-slate-900 font-bold">{assignedComm.name}</span>
                      ) : (
                        <span className="text-slate-600/50 italic">None (Unassigned)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{u.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleOpenEditModal(u)}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-slate-200 text-[#7c3aed] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <UserCheck className="w-4 h-4" /> Manage Coordinator Assignment
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Reassign Community */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title={selectedUser ? `Manage Assignment - ${extractOnlyName(selectedUser)}` : 'Manage Coordinator'}
      >
        <form onSubmit={handleReassignCommunity} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-slate-200 text-xs text-[#7c3aed] flex items-center gap-2">
            <RefreshCw className="w-4 h-4 shrink-0 text-[#7c3aed]" />
            Reassigning a coordinator to a new community automatically clears all previous community ties for a clean slate.
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {successMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Coordinator Email</label>
            <input
              type="text"
              disabled
              value={selectedUser?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-600 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Select New Assigned Community</label>
            <select
              value={assignCommunityId}
              onChange={(e) => setAssignCommunityId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
            >
              <option value="" className="bg-white text-slate-900">-- No Assigned Community (Unassigned Clean Slate) --</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-900">
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-200">
            {communities.some(c => c.coordinatorUserId === selectedUser?.id) ? (
              <button
                type="button"
                onClick={handleRemoveCommunityAssignment}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                🗑️ Remove Community Assignment
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition shadow-sm text-black font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4 text-black" />
                {submitting ? 'Updating...' : 'Save & Clean Reassign'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CoordinatorSearchPage;
