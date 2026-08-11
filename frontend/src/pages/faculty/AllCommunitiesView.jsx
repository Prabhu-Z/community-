import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import CommunityDetailModal from '../../components/common/CommunityDetailModal';
import { Search, Plus, UserCheck, Eye, KeyRound, CheckCircle2, ShieldCheck, Crown, Users, Upload, FileSpreadsheet, Download, AlertTriangle, Building2 } from 'lucide-react';

const AllCommunitiesView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [communities, setCommunities] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [allUsersList, setAllUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Roster Detail Modal State
  const [detailModal, setDetailModal] = useState(false);
  const [activeCommunity, setActiveCommunity] = useState(null);

  // Create Modal State
  const [createModal, setCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    category: 'TECHNICAL',
    description: '',
    maxSize: 100,
    facultyCoordinator: '',
    studentCoordinator: '',
    status: 'ACTIVE',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Assign Coordinator & Edit Community Modal State
  const [assignModal, setAssignModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communityMembersList, setCommunityMembersList] = useState([]);
  const [selectedStudentMembershipId, setSelectedStudentMembershipId] = useState('');
  const [assignData, setAssignData] = useState({
    name: '',
    category: 'TECHNICAL',
    maxSize: 100,
    facultyCoordinator: '',
    studentCoordinator: '',
    coordinatorUserId: '',
  });

  // Bulk Import Students State
  const [importModal, setImportModal] = useState(false);
  const [importCommunity, setImportCommunity] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Grant Coordinator Role Modal State (By Email)
  const [grantModal, setGrantModal] = useState(false);
  const [grantData, setGrantData] = useState({
    email: '',
    name: '',
    communityId: '',
  });
  const [grantSuccess, setGrantSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      const [commRes, staffRes, usersRes] = await Promise.all([
        api.get('/communities'),
        api.get('/users/coordinators').catch(() => ({ data: [] })),
        api.get('/users/all').catch(() => ({ data: [] })),
      ]);
      setCommunities(commRes.data || []);
      setStaffUsers(staffRes.data || []);
      setAllUsersList(usersRes.data || []);
    } catch (err) {
      console.error('Error fetching communities & staff:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract clean name without @mailid
  const extractOnlyName = (userObj) => {
    if (!userObj) return '';
    const nameStr = userObj.name && userObj.name.trim() ? userObj.name.trim() : '';
    
    if (nameStr && !nameStr.includes('@')) {
      return nameStr;
    }

    const emailOrName = nameStr || userObj.email || userObj.studentName || '';
    if (emailOrName.includes('@')) {
      const rawUsername = emailOrName.split('@')[0];
      return rawUsername
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }

    return emailOrName;
  };

  const handleOpenDetailModal = (community) => {
    navigate(`/faculty/communities/${community.id}`);
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/communities', {
        ...newCommunity,
        maxSize: parseInt(newCommunity.maxSize) || 100
      });
      setCreateModal(false);
      setNewCommunity({
        name: '',
        category: 'TECHNICAL',
        description: '',
        maxSize: 100,
        facultyCoordinator: '',
        studentCoordinator: '',
        status: 'ACTIVE',
      });
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create community.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAssignModal = async (e, community) => {
    e.stopPropagation();
    setSelectedCommunity(community);
    setAssignData({
      name: community.name || '',
      category: community.category || 'TECHNICAL',
      maxSize: community.maxSize || 100,
      facultyCoordinator: community.facultyCoordinator || '',
      studentCoordinator: community.studentCoordinator || '',
      coordinatorUserId: community.coordinatorUserId || '',
    });
    setSelectedStudentMembershipId('');

    // Fetch approved members of this specific community for Student Head selection
    try {
      const res = await api.get(`/memberships/community/${community.id}`);
      const approved = (res.data || []).filter(m => m.status === 'APPROVED');
      setCommunityMembersList(approved);
    } catch (err) {
      setCommunityMembersList([]);
    }

    setAssignModal(true);
  };

  const handleAssignCoordinator = async (e) => {
    e.preventDefault();
    if (!selectedCommunity) return;
    setSubmitting(true);
    try {
      const parsedUserId = assignData.coordinatorUserId ? parseInt(assignData.coordinatorUserId) : null;
      await api.put(`/communities/${selectedCommunity.id}`, {
        ...selectedCommunity,
        name: assignData.name,
        category: assignData.category,
        maxSize: parseInt(assignData.maxSize) || 100,
        facultyCoordinator: assignData.facultyCoordinator,
        studentCoordinator: assignData.studentCoordinator,
        coordinatorUserId: parsedUserId,
      });

      // If a student member was chosen, promote their membership role to STUDENT_COORDINATOR!
      if (selectedStudentMembershipId) {
        await api.put(`/memberships/${selectedStudentMembershipId}/assign-leader`).catch(() => {});
      }

      setAssignModal(false);
      fetchData();
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

  const handleOpenImportModal = (e, community) => {
    e.stopPropagation();
    setImportCommunity(community);
    setImportFile(null);
    setImportResult(null);
    setImportModal(true);
  };

  const handleBulkImportSubmit = async (e) => {
    e.preventDefault();
    if (!importCommunity || !importFile) return;
    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const res = await api.post(`/communities/${importCommunity.id}/import-students`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(res.data);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to import spreadsheet.');
    } finally {
      setImporting(false);
    }
  };

  const handleEmailInputChange = (inputEmail) => {
    const trimmed = inputEmail.trim().toLowerCase();
    const matchedUser = allUsersList.find(u => u.email?.toLowerCase() === trimmed);

    let autoName = '';
    if (matchedUser) {
      autoName = extractOnlyName(matchedUser);
    } else if (trimmed.length > 0) {
      autoName = extractOnlyName({ email: inputEmail });
    }

    setGrantData(prev => ({
      ...prev,
      email: inputEmail,
      name: autoName
    }));
  };

  const handleGrantAccessByEmail = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setGrantSuccess('');
    setErrorMsg('');
    try {
      const cleanCommId = (grantData.communityId || '').trim();
      const payload = {
        email: grantData.email.trim(),
        name: grantData.name.trim(),
        communityId: (cleanCommId !== '' && cleanCommId !== 'null' && !isNaN(cleanCommId)) ? parseInt(cleanCommId) : null
      };

      const res = await api.post('/users/grant-coordinator', payload);
      setGrantSuccess(res.data.message || 'Coordinator access granted successfully!');
      setGrantData({ email: '', name: '', communityId: '' });
      fetchData();
      setTimeout(() => {
        setGrantModal(false);
        setGrantSuccess('');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to grant coordinator access.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCommunity = async (communityId) => {
    try {
      await api.delete(`/communities/${communityId}`);
      setDetailModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete community.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading all college communities..." />;

  const filtered = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  // Exclude staff/coordinators who are ALREADY assigned to any community
  const assignedCoordinatorUserIds = communities
    .map(c => c.coordinatorUserId)
    .filter(Boolean);

  const assignedCoordinatorNamesOrEmails = communities.flatMap(c => [
    c.facultyCoordinator?.toLowerCase(),
    c.studentCoordinator?.toLowerCase()
  ]).filter(Boolean);

  const availableStaffUsers = staffUsers.filter(u => {
    if (!selectedCommunity) return true;
    
    // If user is currently assigned as coordinator of THIS selected community, keep them available
    if (selectedCommunity.coordinatorUserId && u.id === selectedCommunity.coordinatorUserId) {
      return true;
    }
    if (selectedCommunity.facultyCoordinator && selectedCommunity.facultyCoordinator.toLowerCase().includes(u.email?.toLowerCase())) {
      return true;
    }

    // Exclude if user ID is already a community coordinator of ANY OTHER community
    const isAssignedById = assignedCoordinatorUserIds.includes(u.id);

    // Exclude if user email/name matches any existing community coordinator
    const userEmailLower = (u.email || '').toLowerCase();
    const userNameCleanLower = extractOnlyName(u).toLowerCase();
    const isAssignedByNameOrEmail = assignedCoordinatorNamesOrEmails.some(assigned => {
      if (!assigned) return false;
      return assigned.includes(userEmailLower) || (userNameCleanLower && assigned.includes(userNameCleanLower));
    });

    // ONLY NON-COMMUNITY COORDINATORS SHOULD APPEAR
    return !isAssignedById && !isAssignedByNameOrEmail;
  });

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Top Header Banner */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8b5cf6]" /> Admin Governance & Oversight
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">All College Communities</h1>
          <p className="text-xs text-slate-600 mt-1">
            Faculty oversight, new community creation, staff role grants, and coordinator dropdown assignments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communities..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          <button
            onClick={() => setGrantModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#7c3aed] font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-[#8b5cf6]" /> Grant Role by Email
          </button>

          <button
            onClick={() => setCreateModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Plus className="w-4 h-4 text-slate-900" /> Create Community
          </button>
        </div>
      </div>

      {/* Community Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => handleOpenDetailModal(c)}
            className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between cursor-pointer hover:border-[#8b5cf6]/50 hover:shadow-md transition-all duration-300 group shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7c3aed] border border-purple-200">
                  {c.category}
                </span>
                <Badge status={c.status}>{c.status}</Badge>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#7c3aed] transition-colors flex items-center justify-between">
                <span>{c.name}</span>
                <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#8b5cf6]" />
              </h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">{c.description}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <strong className="text-slate-800">Admin Lead:</strong> {c.facultyCoordinator || 'Unassigned'}
                </div>
                <div>
                  <strong className="text-slate-800">Members / Capacity:</strong>{' '}
                  <span className={`font-bold font-mono ${
                    (c.memberCount || 0) >= (c.maxSize || 100) ? 'text-rose-600' : 'text-[#7c3aed]'
                  }`}>
                    {c.memberCount || 0} / {c.maxSize || 100}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-800">Upcoming Events:</strong> {c.upcomingEventCount}
                </div>
              </div>

              {/* Progress bar gauge for capacity */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    (c.memberCount || 0) >= (c.maxSize || 100) ? 'bg-rose-500' : 'bg-[#8b5cf6]'
                  }`}
                  style={{ width: `${Math.min(100, Math.round(((c.memberCount || 0) / (c.maxSize || 100)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Community Detail Roster Modal */}
      <CommunityDetailModal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        community={activeCommunity}
        onOpenAssignModal={(comm) => handleOpenAssignModal({ stopPropagation: () => {} }, comm)}
        onOpenImportModal={(comm) => handleOpenImportModal({ stopPropagation: () => {} }, comm)}
        onDeleteCommunity={handleDeleteCommunity}
      />

      {/* Modal: Grant Coordinator Access By Email */}
      <Modal isOpen={grantModal} onClose={() => setGrantModal(false)} title="Grant Coordinator Role by Email">
        <form onSubmit={handleGrantAccessByEmail} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-slate-200 text-xs text-[#7c3aed]">
            Grant <strong>Faculty Coordinator</strong> access to a registered user by entering their email address (e.g. <code>student@scts.edu</code>). Name auto-fills upon typing a registered email address.
          </div>

          {grantSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {grantSuccess}
            </div>
          )}

          {errorMsg && <div className="p-3 rounded-lg bg-rose-950/50 text-rose-300 text-xs font-bold">{errorMsg}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Coordinator Email Address *</label>
            <input
              type="email"
              required
              value={grantData.email}
              onChange={(e) => handleEmailInputChange(e.target.value)}
              placeholder="e.g. student@scts.edu"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Coordinator Name (Only name, no email domain)</label>
            <input
              type="text"
              value={grantData.name}
              onChange={(e) => setGrantData({ ...grantData, name: e.target.value })}
              placeholder="e.g. Jack Smith"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Assign to Community (Optional)</label>
            <select
              value={grantData.communityId}
              onChange={(e) => setGrantData({ ...grantData, communityId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
            >
              <option value="" className="bg-white text-slate-900">-- Do not assign to a specific community yet --</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-900">
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setGrantModal(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition shadow-sm text-black font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-black" />
              {submitting ? 'Granting Access...' : 'Grant Coordinator Access'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create New Community */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New College Community">
        <form onSubmit={handleCreateCommunity} className="space-y-4 text-xs">
          {errorMsg && <div className="p-3 rounded-lg bg-rose-950/50 text-rose-300 text-xs font-bold">{errorMsg}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Community Name *</label>
            <input
              type="text"
              required
              value={newCommunity.name}
              onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
              placeholder="e.g. Artificial Intelligence Club"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
            <select
              value={newCommunity.category}
              onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
            >
              <option value="TECHNICAL" className="bg-white text-slate-900">Technical & Engineering</option>
              <option value="CULTURAL" className="bg-white text-slate-900">Cultural & Fine Arts</option>
              <option value="SPORTS" className="bg-white text-slate-900">Sports & Athletics</option>
              <option value="SOCIAL_SERVICE" className="bg-white text-slate-900">Social Service & NSS</option>
              <option value="ACADEMIC" className="bg-white text-slate-900">Academic & Research</option>
              <option value="LEADERSHIP" className="bg-white text-slate-900">Leadership & Innovation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Community Capacity / Size Limit (maxSize) *</label>
            <input
              type="number"
              min={1}
              max={10000}
              required
              value={newCommunity.maxSize}
              onChange={(e) => setNewCommunity({ ...newCommunity, maxSize: e.target.value })}
              placeholder="e.g. 100"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6] font-mono"
            />
            <p className="text-[10px] text-slate-600/60 mt-1">
              Faculty can dynamically edit or resize this limit anytime.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={newCommunity.description}
              onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
              placeholder="Describe community objectives, activities, and membership criteria..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Admin Lead Name</label>
              <input
                type="text"
                value={newCommunity.facultyCoordinator}
                onChange={(e) => setNewCommunity({ ...newCommunity, facultyCoordinator: e.target.value })}
                placeholder="Dr. Admin Lead Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Student Lead Name</label>
              <input
                type="text"
                value={newCommunity.studentCoordinator}
                onChange={(e) => setNewCommunity({ ...newCommunity, studentCoordinator: e.target.value })}
                placeholder="Student Lead Name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCreateModal(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition shadow-sm text-black font-bold text-xs disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Community Details & Assign Leadership */}
      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title={selectedCommunity ? `Edit Community & Leadership - ${selectedCommunity.name}` : 'Edit Community & Leadership'}
      >
        <form onSubmit={handleAssignCoordinator} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-slate-200 text-xs text-[#7c3aed]">
            Update community details, size limits, and leadership assignments dynamically.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Community Name *</label>
              <input
                type="text"
                required
                value={assignData.name}
                onChange={(e) => setAssignData({ ...assignData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Category *</label>
              <select
                value={assignData.category}
                onChange={(e) => setAssignData({ ...assignData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
              >
                <option value="TECHNICAL" className="bg-white text-slate-900">Technical & Engineering</option>
                <option value="CULTURAL" className="bg-white text-slate-900">Cultural & Fine Arts</option>
                <option value="SPORTS" className="bg-white text-slate-900">Sports & Athletics</option>
                <option value="SOCIAL_SERVICE" className="bg-white text-slate-900">Social Service & NSS</option>
                <option value="ACADEMIC" className="bg-white text-slate-900">Academic & Research</option>
                <option value="LEADERSHIP" className="bg-white text-slate-900">Leadership & Innovation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7c3aed] mb-1">Community Capacity / Size Limit (maxSize) *</label>
            <input
              type="number"
              min={1}
              max={10000}
              required
              value={assignData.maxSize}
              onChange={(e) => setAssignData({ ...assignData, maxSize: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6] font-mono"
            />
            <p className="text-[10px] text-slate-600/60 mt-1">
              Limits enrollment. Current members count: {selectedCommunity?.memberCount || 0}.
            </p>
          </div>

          {/* 1. Unassigned Coordinators Dropdown -> Auto-fills Admin Lead (Name Only) */}
          <div>
            <label className="block text-xs font-bold text-[#7c3aed] mb-1">
              Select Unassigned Coordinator Staff Member ({availableStaffUsers.length} Available)
            </label>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const u = availableStaffUsers.find((user) => user.email === val || user.id.toString() === val);
                  if (u) {
                    const cleanName = extractOnlyName(u);
                    setAssignData(prev => ({
                      ...prev,
                      facultyCoordinator: cleanName,
                      coordinatorUserId: u.id,
                    }));
                  }
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6] font-mono"
            >
              <option value="" className="bg-white text-slate-900">-- Choose Available Unassigned Staff Member --</option>
              {availableStaffUsers.map((u) => (
                <option key={u.id} value={u.email} className="bg-white text-slate-900">
                  {extractOnlyName(u)} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Respective Community Members Dropdown (OPTIONAL) */}
          <div>
            <label className="block text-xs font-bold text-[#7c3aed] mb-1 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-[#7c3aed]" /> Select Student Head from Community Members (Optional) ({communityMembersList.length} Enrolled)
            </label>
            <select
              onChange={(e) => {
                const memId = e.target.value;
                if (memId) {
                  const m = communityMembersList.find(mem => mem.id.toString() === memId);
                  if (m) {
                    const cleanStudentName = extractOnlyName({ name: m.studentName, email: m.studentCode });
                    setAssignData(prev => ({
                      ...prev,
                      studentCoordinator: cleanStudentName,
                    }));
                    setSelectedStudentMembershipId(m.id);
                  }
                } else {
                  setSelectedStudentMembershipId('');
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6] font-mono"
            >
              <option value="" className="bg-white text-slate-900">-- Choose Student Member to Promote to Head (Optional) --</option>
              {communityMembersList.map((m) => (
                <option key={m.id} value={m.id} className="bg-white text-slate-900">
                  🎓 {extractOnlyName({ name: m.studentName, email: m.studentCode })} ({m.studentCode} - {m.department || 'Student'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Admin Lead / Staff Advisor (Name Only)</label>
            <input
              type="text"
              required
              value={assignData.facultyCoordinator}
              onChange={(e) => setAssignData({ ...assignData, facultyCoordinator: e.target.value })}
              placeholder="e.g. Dr. Sarah Jenkins"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Faculty Head / Head (Optional)</label>
            <input
              type="text"
              value={assignData.studentCoordinator}
              onChange={(e) => setAssignData({ ...assignData, studentCoordinator: e.target.value })}
              placeholder="e.g. Alex Rivera (Optional)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setAssignModal(false)}
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
              {submitting ? 'Updating...' : 'Save Changes & Leadership'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Bulk Import Students (Excel / CSV) */}
      <Modal
        isOpen={importModal}
        onClose={() => setImportModal(false)}
        title={importCommunity ? `Bulk Import Students - ${importCommunity.name}` : 'Bulk Import Students'}
      >
        <div className="space-y-5 text-xs">
          {/* Header Capacity Metric Strip */}
          <div className="p-4 rounded-2xl bg-white/5 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-600/60 uppercase">Target Community</div>
              <div className="font-bold text-slate-900 text-sm">{importCommunity?.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-600/60 uppercase">Enrolled / Capacity</div>
              <div className="font-bold font-mono text-[#7c3aed] text-sm">
                {importCommunity?.memberCount || 0} / {importCommunity?.maxSize || 100} Max
              </div>
            </div>
          </div>

          {/* Sample CSV Template Download Widget */}
          <div className="p-4 rounded-2xl bg-[#8b5cf6] text-white/10 border border-[#8b5cf6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#7c3aed]" /> Standard Excel/CSV Template
              </div>
              <p className="text-[11px] text-slate-600">
                Flexible header mapping supports: <code>register number</code>, <code>name</code>, <code>mail id</code>, <code>department</code>, <code>year</code>.
              </p>
            </div>
            <button
              onClick={handleDownloadCsvTemplate}
              className="px-3.5 py-2 rounded-xl bg-[#8b5cf6] text-white text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#e0b840] transition shrink-0 self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-black" /> Get CSV Template
            </button>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleBulkImportSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Select Spreadsheet File (.xlsx, .xls, .csv) *</label>
              <input
                type="file"
                required
                accept=".xlsx, .xls, .csv"
                onChange={(e) => setImportFile(e.target.files[0] || null)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-slate-200 text-white text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#8b5cf6] text-white file:text-black hover:file:bg-[#e0b840] cursor-pointer font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setImportModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={importing || !importFile}
                className="px-5 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition shadow-sm text-black font-extrabold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-black" />
                {importing ? 'Processing & Enrolling...' : 'Start Bulk Import'}
              </button>
            </div>
          </form>

          {/* Importing Spinner */}
          {importing && <LoadingSpinner label="Parsing spreadsheet, auto-registering students & checking community capacity..." />}

          {/* Import Result JSON Summary Report */}
          {importResult && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className={`p-4 rounded-2xl border ${importResult.success ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/40 border-rose-500/30'}`}>
                <div className="font-bold text-slate-900 text-sm mb-2">{importResult.message}</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <div className="text-[10px] uppercase text-emerald-400">Imported</div>
                    <div className="text-lg font-bold">{importResult.importedCount}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-600/20 text-slate-800 border border-purple-600/30">
                    <div className="text-[10px] uppercase text-[#7c3aed]">Already Members</div>
                    <div className="text-lg font-bold">{importResult.alreadyMemberCount}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <div className="text-[10px] uppercase text-rose-400">Capacity Skipped</div>
                    <div className="text-lg font-bold">{importResult.skippedCapacityCount}</div>
                  </div>
                </div>
              </div>

              {/* Warnings & Log Box */}
              {importResult.warnings && importResult.warnings.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[#7c3aed] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#7c3aed]" /> Execution Warnings & Skipped Log ({importResult.warnings.length})
                  </div>
                  <div className="p-3 rounded-xl bg-white text-slate-900/60 border border-slate-200 text-[11px] font-mono max-h-40 overflow-y-auto space-y-1 text-slate-600/90">
                    {importResult.warnings.map((w, idx) => (
                      <div key={idx} className="border-b border-white/5 pb-1 leading-snug">
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AllCommunitiesView;
