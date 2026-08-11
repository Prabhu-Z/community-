import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BookOpen, Link, FileText, Download, Building2, HelpCircle, CheckCircle2, Lock, Tv, ExternalLink } from 'lucide-react';

const StudentResourcesPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [loading, setLoading] = useState(true);

  // Roadmap Interaction State
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [viewedMaterials, setViewedMaterials] = useState({});

  useEffect(() => {
    if (user?.id) {
      fetchStudentCommunityResources();
    }
  }, [user]);

  // Load viewed materials from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('scts_viewed_materials');
    if (saved) {
      try {
        setViewedMaterials(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const fetchStudentCommunityResources = async () => {
    try {
      // 1. Fetch student info
      const studentRes = await api.get(`/students/user/${user.id}`);
      const studentId = studentRes.data?.id;
      
      if (!studentId) {
        setLoading(false);
        return;
      }

      // 2. Fetch memberships for this student
      const membershipsRes = await api.get(`/memberships/student/${studentId}`);
      const approvedMemberships = (membershipsRes.data || []).filter(
        (m) => m.status === 'APPROVED' || m.status === 'ACTIVE'
      );
      setCommunities(approvedMemberships);
      if (approvedMemberships.length > 0) {
        setSelectedCommunityId(approvedMemberships[0].communityId.toString());
      }

      // 3. For each approved community, fetch resources
      const communityResources = [];
      for (const mem of approvedMemberships) {
        const resRes = await api.get(`/resources/community/${mem.communityId}`);
        communityResources.push(...(resRes.data || []));
      }

      setResources(communityResources);
    } catch (err) {
      console.error('Error fetching student resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const markMaterialViewed = (resourceId, materialKey) => {
    const updated = { ...viewedMaterials, [`${resourceId}_${materialKey}`]: true };
    setViewedMaterials(updated);
    localStorage.setItem('scts_viewed_materials', JSON.stringify(updated));
  };

  const getMaterialsForResource = (res) => {
    let materialsList = [];
    
    // Parse description JSON for rich roadmap materials
    try {
      const parsed = JSON.parse(res.description);
      if (parsed && parsed.isRichRoadmap && parsed.materials) {
        materialsList = [...parsed.materials];
      }
    } catch (e) {}

    // Add uploaded files as type document
    if (res.documentNames && res.documentUrls) {
      res.documentNames.forEach((name, idx) => {
        materialsList.push({
          title: name,
          type: 'document',
          url: res.documentUrls[idx]
        });
      });
    }

    // Fallback if materials list is empty but we have link
    if (materialsList.length === 0 && res.link) {
      materialsList.push({
        title: 'Primary Reference Link',
        type: 'link',
        url: res.link
      });
    }

    return materialsList;
  };

  const getSyllabusForResource = (res) => {
    try {
      const parsed = JSON.parse(res.description);
      if (parsed && parsed.isRichRoadmap && parsed.syllabus) {
        return parsed.syllabus;
      }
    } catch (e) {}
    return '';
  };

  const getSubtitleForResource = (res) => {
    try {
      const parsed = JSON.parse(res.description);
      if (parsed && parsed.isRichRoadmap && parsed.subtitle) {
        return parsed.subtitle;
      }
    } catch (e) {}
    return res.description || 'Learn how to master this module step-by-step.';
  };

  // Filter resources of selected community
  const communitySteps = resources
    .filter(res => res.communityId.toString() === selectedCommunityId.toString())
    .sort((a, b) => a.id - b.id);

  // Reset active step when community changes
  useEffect(() => {
    setActiveStepIndex(0);
  }, [selectedCommunityId]);

  // Calculate status of each step:
  // Step is COMPLETED if all its materials are viewed
  // Step is UNLOCKED if stepIndex === 0 or previous step is COMPLETED
  const getStepStatus = (index) => {
    if (index === 0) {
      // First step is always unlocked
      return isStepCompleted(0) ? 'COMPLETED' : 'IN_PROGRESS';
    }

    // Check if all previous steps are completed
    let allPrevCompleted = true;
    for (let i = 0; i < index; i++) {
      if (!isStepCompleted(i)) {
        allPrevCompleted = false;
        break;
      }
    }

    if (!allPrevCompleted) return 'LOCKED';
    return isStepCompleted(index) ? 'COMPLETED' : 'IN_PROGRESS';
  };

  const isStepCompleted = (index) => {
    const step = communitySteps[index];
    if (!step) return false;
    const mats = getMaterialsForResource(step);
    if (mats.length === 0) return true; // complete by default if no materials

    return mats.every((m, idx) => viewedMaterials[`${step.id}_${m.title || idx}`]);
  };

  const getStepCompletedCount = (index) => {
    const step = communitySteps[index];
    if (!step) return 0;
    const mats = getMaterialsForResource(step);
    return mats.filter((m, idx) => viewedMaterials[`${step.id}_${m.title || idx}`]).length;
  };

  if (loading) return <LoadingSpinner label="Loading your interactive roadmaps..." />;

  // Selected Step Resources
  const activeStep = communitySteps[activeStepIndex];
  const activeMaterials = activeStep ? getMaterialsForResource(activeStep) : [];
  const activeSyllabus = activeStep ? getSyllabusForResource(activeStep) : '';
  const activeSubtitle = activeStep ? getSubtitleForResource(activeStep) : '';
  
  const viewedCount = activeStep ? getStepCompletedCount(activeStepIndex) : 0;
  const totalMatsCount = activeMaterials.length;
  const progressPercent = totalMatsCount > 0 ? Math.round((viewedCount / totalMatsCount) * 100) : 0;

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header & Community Switcher */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#7c3aed]" /> Learning Journey
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Interactive Community Roadmaps
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Learn step-by-step, view curated materials, and unlock successive journey milestones.
          </p>
        </div>

        {communities.length > 0 && (
          <div className="relative shrink-0">
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="w-full md:w-64 pl-4 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-extrabold focus:outline-none focus:border-[#8b5cf6] cursor-pointer appearance-none shadow-sm"
            >
              {communities.map((c) => (
                <option key={c.communityId} value={c.communityId.toString()}>
                  {c.communityName}
                </option>
              ))}
            </select>
            <Building2 className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {communities.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-16 text-center space-y-4">
          <HelpCircle className="w-16 h-16 text-[#7c3aed]/50 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">Not Enrolled in Any Communities</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Join active campus communities to access their curated roadmaps and learning timelines.
            </p>
          </div>
        </div>
      ) : communitySteps.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-16 text-center space-y-4">
          <HelpCircle className="w-16 h-16 text-[#7c3aed]/50 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">Roadmap Coming Soon!</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your Faculty Coordinator has not published roadmap steps for this community yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: JOURNEY TIMELINE */}
          <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-extrabold text-[#7c3aed] uppercase tracking-wider">
              Journey Timeline
            </h3>

            <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-6">
              {communitySteps.map((step, idx) => {
                const status = getStepStatus(idx);
                const isActive = activeStepIndex === idx;

                let iconComponent = (
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-400 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                );

                if (status === 'COMPLETED') {
                  iconComponent = (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 border border-emerald-500 text-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    </div>
                  );
                } else if (status === 'LOCKED') {
                  iconComponent = (
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  );
                } else if (isActive) {
                  iconComponent = (
                    <div className="w-6 h-6 rounded-full bg-[#8b5cf6] border border-[#8b5cf6] text-white flex items-center justify-center font-bold text-xs shadow-md">
                      {idx + 1}
                    </div>
                  );
                }

                const handleStepClick = () => {
                  if (status !== 'LOCKED') {
                    setActiveStepIndex(idx);
                  }
                };

                return (
                  <div
                    key={step.id}
                    onClick={handleStepClick}
                    className={`relative cursor-pointer transition select-none ${
                      status === 'LOCKED' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {/* Floating Timeline Icon */}
                    <div className="absolute -left-[37px] top-0.5">
                      {iconComponent}
                    </div>

                    <div className={`p-4 rounded-2xl border transition ${
                      isActive 
                        ? 'bg-purple-50/70 border-[#8b5cf6]/40 shadow-sm' 
                        : 'bg-white border-transparent hover:bg-slate-50'
                    }`}>
                      <span className={`text-[10px] font-bold ${
                        status === 'COMPLETED' ? 'text-emerald-500' : 'text-[#7c3aed]'
                      } uppercase`}>
                        {status === 'COMPLETED' 
                          ? 'Completed' 
                          : status === 'LOCKED' 
                            ? 'Locked' 
                            : 'In Progress'}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{step.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        {status === 'LOCKED' 
                          ? 'Complete previous step to unlock'
                          : status === 'COMPLETED'
                            ? 'All resources viewed'
                            : `${getStepCompletedCount(idx)} / ${getMaterialsForResource(step).length} resources done`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: SELECTED STEP DETAILS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step Header info */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    Current Skill • Level {activeStepIndex + 1} / {communitySteps.length}
                  </span>
                </div>
                
                {/* Node progress bar */}
                <div className="flex items-center gap-3 w-full sm:w-48">
                  <span className="text-xs font-extrabold font-mono text-slate-800 shrink-0">
                    {progressPercent}%
                  </span>
                  <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
                    Node Progress
                  </span>
                </div>
              </div>

              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                {activeStep.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                {activeSubtitle}
              </p>
            </div>

            {/* Split Grid: Study Materials vs Syllabus */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Columns 1: Study Materials */}
              <div className="md:col-span-7 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-extrabold text-[#7c3aed] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Study materials
                </h3>

                {activeMaterials.length > 0 ? (
                  <div className="space-y-3">
                    {activeMaterials.map((mat, idx) => {
                      const matKey = mat.title || idx;
                      const isViewed = viewedMaterials[`${activeStep.id}_${matKey}`];

                      const handleOpenUrl = () => {
                        markMaterialViewed(activeStep.id, matKey);
                        let finalUrl = mat.url || '#';
                        // Fix for uploads path prefix matching
                        if (mat.type === 'document' && !finalUrl.startsWith('http') && api.defaults.baseURL) {
                          finalUrl = api.defaults.baseURL.replace('/api', '') + finalUrl;
                        }
                        window.open(finalUrl, '_blank');
                      };

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 text-xs ${
                            isViewed 
                              ? 'bg-slate-50/50 border-slate-200' 
                              : 'bg-white border-slate-200 shadow-sm hover:border-[#8b5cf6]/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7c3aed] flex items-center justify-center shrink-0 border border-purple-100">
                              {mat.type === 'video' ? <Tv className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </div>
                            <div className="overflow-hidden">
                              <div className="font-extrabold text-slate-900 truncate">
                                {mat.title}
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium capitalize">
                                {mat.type || 'link'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={handleOpenUrl}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                              isViewed
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200 hover:bg-emerald-500/20'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                            }`}
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-4 text-center">
                    No learning materials posted for this milestone yet.
                  </div>
                )}
              </div>

              {/* Columns 2: What you will learn */}
              <div className="md:col-span-5 bg-slate-50/60 border border-slate-150 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  What you will learn in this skill
                </h3>

                {activeSyllabus ? (
                  <div className="space-y-2">
                    {activeSyllabus.split('\n').map((line, sIdx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      
                      const isHeader = !trimmed.startsWith('*') && !trimmed.startsWith('-') && sIdx === 0;

                      return (
                        <p
                          key={sIdx}
                          className={`text-xs leading-relaxed ${
                            isHeader 
                              ? 'font-extrabold text-slate-900 text-[13px] border-b border-slate-200 pb-1.5 mb-2' 
                              : 'font-semibold text-slate-700 flex items-start gap-2 pl-1'
                          }`}
                        >
                          {!isHeader && <span className="text-[#8b5cf6] font-bold">•</span>}
                          {trimmed.startsWith('*') || trimmed.startsWith('-') ? trimmed.substring(1).trim() : trimmed}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-medium leading-relaxed">
                    Study the links and references in materials to learn the fundamentals.
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default StudentResourcesPage;
