import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Github, Linkedin, Link2, ShieldCheck, ArrowLeft, Save, Globe, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentProfileLinksPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    leetcode: '',
    github: '',
    hackerrank: '',
    linkedin: '',
    codechef: '',
  });

  const [customLinks, setCustomLinks] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchStudentProfile();
  }, [user]);

  const fetchStudentProfile = async () => {
    try {
      const studentRes = await api.get(`/students/user/${user.id}`);
      const sData = studentRes.data;
      setStudent(sData);
      setForm({
        leetcode: sData.leetcode || '',
        github: sData.github || '',
        hackerrank: sData.hackerrank || '',
        linkedin: sData.linkedin || '',
        codechef: sData.codechef || '',
      });

      let list = [];
      if (sData.customLinks) {
        try {
          list = JSON.parse(sData.customLinks);
        } catch (e) {
          console.error(e);
        }
      }
      setCustomLinks(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomLink = () => {
    setCustomLinks([...customLinks, { name: '', url: '' }]);
  };

  const handleCustomLinkChange = (index, key, val) => {
    const updated = [...customLinks];
    updated[index][key] = val;
    setCustomLinks(updated);
  };

  const handleRemoveCustomLink = (index) => {
    setCustomLinks(customLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) return;

    // Filter out empty custom links before saving
    const cleanCustomLinks = customLinks.filter(lnk => lnk.name.trim() && lnk.url.trim());

    setSubmitting(true);
    try {
      const payload = {
        ...student,
        leetcode: form.leetcode.trim(),
        github: form.github.trim(),
        hackerrank: form.hackerrank.trim(),
        linkedin: form.linkedin.trim(),
        codechef: form.codechef.trim(),
        customLinks: JSON.stringify(cleanCustomLinks),
      };

      await api.put(`/students/${student.id}`, payload);
      alert('🎉 Profile links updated successfully!');
      navigate('/student/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile links.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading profile link settings..." />;

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#7c3aed] transition hover:shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-sans font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7c3aed]" /> Personal Identity Settings
          </span>
          <h1 className="font-sans text-2xl font-extrabold text-slate-900 mt-0.5">Manage Profile Links</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Add your professional & coding portfolio links to show on your student dashboard.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 lg:p-8 space-y-6 text-xs text-slate-800">
        <div className="space-y-6">
          <h2 className="text-sm font-extrabold text-[#7c3aed] border-b border-slate-100 pb-2 uppercase tracking-wide">Standard Links</h2>

          <div className="space-y-5">
            {/* GitHub */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <Github className="w-4 h-4 text-[#7c3aed]" /> GitHub Profile URL
              </label>
              <input
                type="url"
                value={form.github}
                onChange={(e) => setForm((prev) => ({ ...prev, github: e.target.value }))}
                placeholder="https://github.com/yourusername"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8b5cf6] font-medium"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-[#7c3aed]" /> LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={form.linkedin}
                onChange={(e) => setForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/in/yourusername"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8b5cf6] font-medium"
              />
            </div>

            {/* LeetCode */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#7c3aed]" /> LeetCode Profile URL
              </label>
              <input
                type="url"
                value={form.leetcode}
                onChange={(e) => setForm((prev) => ({ ...prev, leetcode: e.target.value }))}
                placeholder="https://leetcode.com/u/yourusername/"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8b5cf6] font-medium"
              />
            </div>

            {/* HackerRank */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#7c3aed]" /> HackerRank Profile URL
              </label>
              <input
                type="url"
                value={form.hackerrank}
                onChange={(e) => setForm((prev) => ({ ...prev, hackerrank: e.target.value }))}
                placeholder="https://hackerrank.com/profile/yourusername"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8b5cf6] font-medium"
              />
            </div>

            {/* CodeChef */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#7c3aed]" /> CodeChef Profile URL
              </label>
              <input
                type="url"
                value={form.codechef}
                onChange={(e) => setForm((prev) => ({ ...prev, codechef: e.target.value }))}
                placeholder="https://codechef.com/users/yourusername"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8b5cf6] font-medium"
              />
            </div>
          </div>

          {/* Dynamic Custom Links Section */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#7c3aed] uppercase tracking-wide">Custom Website Links</h2>
              <button
                type="button"
                onClick={handleAddCustomLink}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] border border-purple-100 text-[10px] font-bold transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Custom Link
              </button>
            </div>

            {customLinks.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No custom links added yet. Click "Add Custom Link" to include items like personal websites or other portfolios.</p>
            ) : (
              <div className="space-y-4">
                {customLinks.map((link, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-end sm:items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-full sm:w-1/3">
                      <label className="block font-bold text-slate-600 mb-1">Link Name</label>
                      <input
                        type="text"
                        required
                        value={link.name}
                        onChange={(e) => handleCustomLinkChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Portfolio, Behance"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8b5cf6] font-medium"
                      />
                    </div>
                    <div className="w-full sm:flex-1">
                      <label className="block font-bold text-slate-600 mb-1">Website URL</label>
                      <input
                        type="url"
                        required
                        value={link.url}
                        onChange={(e) => handleCustomLinkChange(idx, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#8b5cf6] font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomLink(idx)}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition shadow-sm self-end sm:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-extrabold shadow-lg hover:scale-[1.02] transition disabled:opacity-50 flex items-center gap-1.5 animate-pulse-subtle"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfileLinksPage;
