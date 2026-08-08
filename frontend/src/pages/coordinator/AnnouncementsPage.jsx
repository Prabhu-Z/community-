import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { Megaphone, Plus, Trash2, Building2 } from 'lucide-react';

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    communityId: 1,
    title: '',
    content: '',
    createdBy: 'Faculty Coordinator',
  });

  useEffect(() => {
    fetchCommunityAndAnnouncements();
  }, [user]);

  const fetchCommunityAndAnnouncements = async () => {
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
        setFormData(prev => ({ ...prev, communityId: myCommunity.id }));

        const res = await api.get('/announcements');
        setAnnouncements((res.data || []).filter(a => a.communityId === myCommunity.id || !a.communityId));
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', formData);
      setModalOpen(false);
      fetchCommunityAndAnnouncements();
    } catch (err) {
      alert('Failed to publish announcement.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      fetchCommunityAndAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading community announcements..." />;

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

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900">Community Announcements</h1>
          <p className="text-xs text-slate-600 mt-1">Publish updates, broadcast circulars, and notify members instantly.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-chestnut-700 to-purple-600 text-slate-900 font-bold text-xs shadow-lg"
        >
          <Plus className="w-4 h-4" /> Publish Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 rounded-2xl border border-slate-100 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-sans text-lg font-bold text-slate-900">{a.title}</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-600/20 text-[#7c3aed]">
                  {a.communityName}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{a.content}</p>
              <div className="text-[10px] text-slate-500 font-mono">
                Published by: {a.createdBy} • {a.publishedDate ? new Date(a.publishedDate).toLocaleString() : ''}
              </div>
            </div>

            <button
              onClick={() => handleDelete(a.id)}
              className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
              title="Delete Announcement"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Publish Community Announcement">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Hackathon Registration Extended!"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Announcement Body</label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Provide complete announcement circular details..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-chestnut-700 to-purple-600 text-slate-900 font-bold text-xs shadow-lg"
          >
            Broadcast Announcement
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
