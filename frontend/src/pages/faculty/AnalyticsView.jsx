import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import ChartCard from '../../components/common/ChartCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Building2, Calendar, CheckSquare, Search, Sparkles, Activity, Download, Info } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const AnalyticsView = () => {
  const [allCommunities, setAllCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Community Participation State
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const res = await api.get('/communities');
      const list = res.data || [];
      setAllCommunities(list);

      if (list.length > 0) {
        handleSelectCommunity(list[0].id);
      }
    } catch (err) {
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommunity = async (communityId) => {
    setSelectedCommunityId(communityId);
    setLoadingAnalytics(true);
    try {
      const res = await api.get(`/dashboards/community-analytics/${communityId}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error loading community analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleExportCSV = () => {
    if (!analytics) return;
    const headers = ["Metric", "Value"];
    const rows = [
      ["Community Name", analytics.communityName],
      ["Category", analytics.category],
      ["Total Members", analytics.totalMembers],
      ["Tasks Assigned", analytics.totalTasksAssigned],
      ["Total Submissions", analytics.totalSubmissions],
      ["Verified Submissions", analytics.verifiedSubmissions],
      ["Participation Percentage", `${analytics.participationPercentage}%`],
      ["Total Events", analytics.totalEvents],
      ["Total Event Registrations", analytics.totalEventRegistrations],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${analytics.communityName.replace(/\s+/g, "_")}_Participation_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner label="Loading all 30+ communities & participation analytics..." />;

  const COLORS = ['#8b5cf6', '#38bdf8', '#34d399', '#f59e0b', '#f43f5e'];
  const PARTICIPATION_COLORS = ['#8b5cf6', '#cbd5e1'];

  const filteredCommunities = allCommunities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const prepareChartData = (data, fallbackLabel) => {
    if (!data || data.length === 0) {
      return [{ name: fallbackLabel, value: 1, isFallback: true }];
    }
    const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    if (total === 0) {
      return [{ name: fallbackLabel, value: 1, isFallback: true }];
    }
    return data.filter((item) => Number(item.value) > 0);
  };

  const taskStatusData = analytics ? prepareChartData(analytics.taskStatusChartData, 'No Submissions Yet') : [];
  const participationRateData = analytics ? prepareChartData(analytics.participationRateChartData, 'No Member Activity Yet') : [];
  const taskTypeData = analytics ? prepareChartData(analytics.taskTypeChartData, 'No Tasks Created Yet') : [];

  return (
    <div className="space-y-8 p-2 lg:p-4">
      {/* Apple Glass Header */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#8b5cf6]" /> College Extracurricular Data Hub
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Participation Analysis
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Select any community below to view real-time data charts for task completion, proof verifications, and active student participation.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search 30+ campus communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#8b5cf6]"
          />
        </div>
      </div>

      {/* ALL COMMUNITIES CLICKABLE LIST */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#7c3aed] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#8b5cf6]" /> All Campus Communities ({allCommunities.length} Total)
          </h3>
          <span className="text-[11px] font-mono text-slate-500 font-semibold">Click any community button to load real charts</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pr-1 scrollbar-thin">
          {filteredCommunities.map((comm) => {
            const isSelected = selectedCommunityId === comm.id;
            return (
              <button
                key={comm.id}
                onClick={() => handleSelectCommunity(comm.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-sm font-extrabold scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-[#8b5cf6]/50 hover:text-[#7c3aed] hover:bg-purple-50'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#8b5cf6]'}`} />
                <span>{comm.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* REAL DATA CHARTS FOR SELECTED COMMUNITY */}
      {loadingAnalytics ? (
        <div className="p-12 text-center text-xs text-slate-600">
          <LoadingSpinner label="Calculating real community participation data & generating graphs..." />
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          {/* COMMUNITY BANNER STATS */}
          <div className="bg-gradient-to-r from-purple-100 via-purple-50 to-white border border-purple-200 shadow-sm rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono text-[#7c3aed] font-extrabold uppercase tracking-widest">
                Selected Community Data Summary
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {analytics.communityName}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Category: <strong className="text-slate-800">{analytics.category}</strong> • Faculty Head: <strong className="text-slate-800">{analytics.studentCoordinator || 'Assigned'}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center self-stretch md:self-auto">
                <div className="p-3 rounded-2xl bg-white border border-purple-100 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Enrolled Members</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">{analytics.totalMembers}</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-purple-100 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Tasks Assigned</div>
                  <div className="text-xl font-extrabold text-[#7c3aed] mt-0.5">{analytics.totalTasksAssigned}</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-purple-100 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Verified Submissions</div>
                  <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{analytics.verifiedSubmissions}</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-purple-100 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Participation Rate</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">{analytics.participationPercentage}%</div>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-4 py-3 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition shadow-sm text-xs flex items-center gap-2 shrink-0 active:scale-95"
              >
                <Download className="w-4 h-4" /> Download CSV Report
              </button>
            </div>
          </div>

          {/* REAL DATA CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CHART 1: Real Task Submissions & Verification Breakdown (PieChart) */}
            <ChartCard title="Task Deliverables & Verification Breakdown" subtitle="Real database counts of verified, pending, & rejected proofs">
              {taskStatusData[0]?.isFallback ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500 space-y-2 font-medium">
                  <Info className="w-8 h-8 text-[#8b5cf6]" />
                  <div>No task proof submissions submitted yet for this community.</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={65}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      itemStyle={{ color: '#1e293b', fontWeight: 'bold', fontSize: '12px' }}
                      labelStyle={{ color: '#7c3aed', fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* CHART 2: Active Member Participation Rate (PieChart) */}
            <ChartCard title="Active Member Participation Rate" subtitle="Active participating members vs inactive community members">
              {participationRateData[0]?.isFallback ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500 space-y-2 font-medium">
                  <Info className="w-8 h-8 text-[#8b5cf6]" />
                  <div>No member activity recorded yet.</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={participationRateData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={40}
                      outerRadius={65}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {participationRateData.map((entry, index) => (
                        <Cell key={`cell-part-${index}`} fill={PARTICIPATION_COLORS[index % PARTICIPATION_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      itemStyle={{ color: '#1e293b', fontWeight: 'bold', fontSize: '12px' }}
                      labelStyle={{ color: '#7c3aed', fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* CHART 3: Task Type Breakdown (BarChart) */}
            <ChartCard title="Community Task Types Overview" subtitle="Faculty Community Tasks vs Coordinator Daily Tasks">
              {taskTypeData[0]?.isFallback ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500 space-y-2 font-medium">
                  <Info className="w-8 h-8 text-[#8b5cf6]" />
                  <div>No tasks created yet for this community.</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={taskTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      itemStyle={{ color: '#1e293b', fontWeight: 'bold', fontSize: '12px' }}
                      labelStyle={{ color: '#7c3aed', fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* QUICK STAT SUMMARY BOX */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#8b5cf6]" /> Community Key Metrics Summary
                </h4>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Real database totals calculated live for <strong>{analytics.communityName}</strong>.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600 font-semibold">Total Hosted Events:</span>
                  <strong className="text-slate-900">{analytics.totalEvents} Events</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600 font-semibold">Total Event Registrations:</span>
                  <strong className="text-[#7c3aed] font-extrabold">{analytics.totalEventRegistrations} Registrations</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600 font-semibold">Total Task Submissions:</span>
                  <strong className="text-slate-900 font-extrabold">{analytics.totalSubmissions} Submissions</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600 font-semibold">Verified Task Proofs (+Pts):</span>
                  <strong className="text-emerald-700 font-extrabold">{analytics.verifiedSubmissions} Verified</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AnalyticsView;
