import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Edit2, Trash2, Link, FileText, Download, Building2, BookOpen, AlertCircle, X, Film, PlusCircle, Trash } from 'lucide-react';

const FacultyResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  // General Form State
  const [title, setTitle] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Rich Roadmap Mode Form State
  const [isRichRoadmap, setIsRichRoadmap] = useState(true);
  const [subtitle, setSubtitle] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [linkMaterials, setLinkMaterials] = useState([
    { title: 'W3Schools JavaScript Tutorial', type: 'link', url: 'https://www.w3schools.com/js/' }
  ]);

  // Legacy Mode Form State
  const [legacyDescription, setLegacyDescription] = useState('');
  const [legacyLink, setLegacyLink] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const commRes = await api.get('/communities');
      setCommunities(commRes.data || []);
      
      const allResources = [];
      for (const c of commRes.data || []) {
        const res = await api.get(`/resources/community/${c.id}`);
        allResources.push(...(res.data || []));
      }
      setResources(allResources);
    } catch (err) {
      console.error('Error fetching resources data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingResource(null);
    setTitle('');
    setIsRichRoadmap(true);
    setSubtitle('');
    setSyllabus('Introduction to the Skill\n\n*What you will learn topic 1\n*What you will learn topic 2');
    setLinkMaterials([{ title: '', type: 'link', url: '' }]);
    setLegacyDescription('');
    setLegacyLink('');
    setSelectedCommunityId(communities[0]?.id || '');
    setSelectedFiles([]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (res) => {
    setEditingResource(res);
    setTitle(res.title);
    setSelectedCommunityId(res.communityId);
    setSelectedFiles([]);

    // Check if description is a serialized rich roadmap
    try {
      const parsed = JSON.parse(res.description);
      if (parsed && parsed.isRichRoadmap) {
        setIsRichRoadmap(true);
        setSubtitle(parsed.subtitle || '');
        setSyllabus(parsed.syllabus || '');
        setLinkMaterials(parsed.materials || []);
        setLegacyDescription('');
        setLegacyLink('');
      } else {
        throw new Error('Not rich roadmap');
      }
    } catch (e) {
      setIsRichRoadmap(false);
      setLegacyDescription(res.description || '');
      setLegacyLink(res.link || '');
      setSubtitle('');
      setSyllabus('');
      setLinkMaterials([]);
    }

    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleAddMaterialRow = () => {
    setLinkMaterials([...linkMaterials, { title: '', type: 'link', url: '' }]);
  };

  const handleRemoveMaterialRow = (index) => {
    setLinkMaterials(linkMaterials.filter((_, idx) => idx !== index));
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...linkMaterials];
    updated[index][field] = value;
    setLinkMaterials(updated);
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Are you sure you want to permanently delete this roadmap step?')) return;
    try {
      setLoading(true);
      await api.delete(`/resources/${resourceId}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting resource:', err);
      alert('Failed to delete resource.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !selectedCommunityId) {
      alert('Title and Target Community are required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('communityId', selectedCommunityId);

    if (isRichRoadmap) {
      const richDescription = JSON.stringify({
        isRichRoadmap: true,
        subtitle: subtitle,
        syllabus: syllabus,
        materials: linkMaterials.filter(m => m.title && m.url)
      });
      formData.append('description', richDescription);
      formData.append('link', ''); // link field is kept empty since links are in JSON list
    } else {
      formData.append('description', legacyDescription);
      formData.append('link', legacyLink);
    }
    
    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
    }

    try {
      setLoading(true);
      if (editingResource) {
        await api.put(`/resources/${editingResource.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/resources', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving resource:', err);
      alert('Failed to save resource.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#7c3aed]" /> Roadmap Architect
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Curated Roadmaps & Resources
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium">
            Publish visual learning paths, multi-step roadmaps, study resources, and documents for community students.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-6 py-3 rounded-xl bg-[#8b5cf6] text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:bg-[#7c3aed] transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Publish Roadmap Step
        </button>
      </div>

      {loading && resources.length === 0 ? (
        <LoadingSpinner label="Loading roadmap repository..." />
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => {
            let parsed = null;
            try {
              const data = JSON.parse(res.description);
              if (data && data.isRichRoadmap) parsed = data;
            } catch (e) {}

            return (
              <div
                key={res.id}
                className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7c3aed] border border-purple-200 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {res.communityName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      ID: #{res.id}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                      {res.title}
                    </h3>
                    {parsed ? (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-3">
                          {parsed.subtitle || 'No subtitle provided.'}
                        </p>
                        <div className="text-[10px] bg-slate-50 border border-slate-100 p-2.5 rounded-xl space-y-1">
                          <span className="font-extrabold text-slate-600 block">Syllabus Overview:</span>
                          <p className="text-slate-500 truncate">{parsed.syllabus}</p>
                        </div>
                        <div className="flex gap-2 text-[10px] font-bold text-slate-400">
                          <span>✓ {parsed.materials?.length || 0} Links/Videos</span>
                          <span>• {res.documentNames?.length || 0} PDF Documents</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-5">
                        {res.description || 'No description provided.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(res)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-16 text-center space-y-4 shadow-xl">
          <BookOpen className="w-16 h-16 text-[#7c3aed]/50 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">No Roadmaps Published Yet</h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Create and publish resources for specific student communities to kickstart their learning.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] text-white text-xs font-bold hover:bg-[#7c3aed] transition active:scale-95 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create First Roadmap Step
          </button>
        </div>
      )}

      {/* Create / Edit Resource Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">
                {editingResource ? 'Edit Roadmap Step' : 'Publish Roadmap Step'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-slate-800">
              <div className="flex items-center gap-4 bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                <input
                  type="checkbox"
                  id="rich_roadmap"
                  checked={isRichRoadmap}
                  onChange={(e) => setIsRichRoadmap(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8b5cf6] focus:ring-[#8b5cf6] border-slate-350 cursor-pointer"
                />
                <label htmlFor="rich_roadmap" className="text-xs font-extrabold text-[#7c3aed] cursor-pointer">
                  Publish as Interactive Step-by-Step Roadmap (Timeline style)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Student Community</label>
                  <select
                    value={selectedCommunityId}
                    onChange={(e) => setSelectedCommunityId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#8b5cf6]"
                  >
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Step Title / Skill Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JAVASCRIPT"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
              </div>

              {isRichRoadmap ? (
                <>
                  {/* Rich Roadmap specific inputs */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Step Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. Learn how to build dynamic, interactive, and responsive web applications using JavaScript."
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#8b5cf6]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">What You Will Learn in This Skill (Syllabus, one per line)</label>
                    <textarea
                      placeholder="Introduction to JavaScript&#10;*What is JavaScript & where it runs&#10;*Setup: VS Code, Live Server, Browser Console"
                      rows={5}
                      value={syllabus}
                      onChange={(e) => setSyllabus(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#8b5cf6] font-mono"
                    />
                  </div>

                  {/* Study Materials Row management */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Step Study Materials (Links & Videos)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddMaterialRow}
                        className="text-xs text-[#7c3aed] font-bold hover:underline flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Material Item
                      </button>
                    </div>

                    <div className="space-y-2">
                      {linkMaterials.map((mat, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-50 border border-slate-150 p-3 rounded-2xl relative">
                          <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Material Title (e.g. Basics of JS in Tamil)"
                                required
                                value={mat.title}
                                onChange={(e) => handleMaterialChange(idx, 'title', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                              />
                              <select
                                value={mat.type}
                                onChange={(e) => handleMaterialChange(idx, 'type', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 text-xs font-bold"
                              >
                                <option value="link">🌐 Link / Webpage</option>
                                <option value="video">🎥 Video (YouTube / MP4)</option>
                              </select>
                            </div>
                            <input
                              type="url"
                              placeholder="URL Link (e.g. https://youtube.com/...)"
                              required
                              value={mat.url}
                              onChange={(e) => handleMaterialChange(idx, 'url', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 text-xs"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveMaterialRow(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition duration-150"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Legacy simple resource form */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <textarea
                      placeholder="Summarize the roadmap or instructions for the students..."
                      rows={4}
                      value={legacyDescription}
                      onChange={(e) => setLegacyDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#8b5cf6]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">External Resource URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="e.g. https://roadmap.sh/frontend"
                      value={legacyLink}
                      onChange={(e) => setLegacyLink(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#8b5cf6]"
                    />
                  </div>
                </>
              )}

              {/* Document upload is common to both */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  {isRichRoadmap ? 'Upload Study Documents / PDFs (Appended as Documents)' : 'Upload Resources / PDF / Docs (Multiple)'}
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#8b5cf6]"
                />
                {selectedFiles.length > 0 && (
                  <p className="text-[10px] text-[#8b5cf6] font-bold mt-1">
                    ✓ {selectedFiles.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-bold transition"
                >
                  {editingResource ? 'Save Step' : 'Publish Step'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyResourcesPage;
