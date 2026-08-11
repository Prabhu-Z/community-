import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Timeline from '../../components/common/Timeline';
import Badge from '../../components/common/Badge';
import PrintReportModal from '../../components/reports/PrintReportModal';
import StudentHeatStreak from '../../components/common/StudentHeatStreak';

import { User, Mail, Phone, BookOpen, Award, CheckCircle2, FileCheck, Printer, CheckSquare, Sparkles, Github, Linkedin, Globe, Link2 } from 'lucide-react';

const StudentProfilePage = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStudentData = async () => {
      try {
        const studentRes = await api.get(`/students/user/${user.id}`).catch(() => null);
        const s = studentRes?.data || null;
        setStudent(s);

        const studentIdParam = s?.id || user?.studentId || user?.id;

        if (studentIdParam) {
          const [commRes, actRes, achRes, certRes, taskRes, lbRes] = await Promise.all([
            api.get(`/students/${studentIdParam}/communities`).catch(() => ({ data: [] })),
            api.get(`/students/${studentIdParam}/activities`).catch(() => ({ data: [] })),
            api.get(`/students/${studentIdParam}/achievements`).catch(() => ({ data: [] })),
            api.get(`/students/${studentIdParam}/certificates`).catch(() => ({ data: [] })),
            api.get(`/tasks/student/${studentIdParam}`).catch(() => ({ data: [] })),
            api.get('/leaderboard/all').catch(() => ({ data: [] })),
          ]);

          const myLbEntry = (lbRes.data || []).find(e => e.studentId === studentIdParam);
          if (s) {
            s.points = myLbEntry ? myLbEntry.points : (s.points || 0);
          }

          setCommunities(commRes.data || []);
          setActivities(actRes.data || []);
          setAchievements(achRes.data || []);
          setCertificates(certRes.data || []);
          setTasks(taskRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [user]);

  const handlePrintPortfolio = async () => {
    const sId = student?.id || user?.studentId || user?.id;
    if (!sId) return;
    try {
      const res = await api.get(`/reports/student/${sId}`);
      setReportData(res.data);
      setReportModal(true);
    } catch (err) {
      console.error('Error generating report:', err);
    }
  };

  if (loading) return <LoadingSpinner label="Loading student portfolio & heatstreak dashboard..." />;

  const activeStudent = student || {
    id: user?.id || 1,
    name: user?.name || 'Student User',
    studentCode: 'STU' + (10000 + (user?.id || 1)),
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    year: 2,
    semester: 4,
    email: user?.email || 'student@scts.edu',
    contact: '+91 9876543210',
    attendancePercentage: 92.0,
    totalVolunteerHours: 0,
    totalAchievements: 0,
    totalCertificates: 0,
  };

  let parsedCustomLinks = [];
  if (activeStudent.customLinks) {
    try {
      parsedCustomLinks = JSON.parse(activeStudent.customLinks);
    } catch (e) {
      console.error('Error parsing custom links:', e);
    }
  }

  const hasLinks = activeStudent.github || activeStudent.linkedin || activeStudent.leetcode || activeStudent.hackerrank || activeStudent.codechef || (parsedCustomLinks && parsedCustomLinks.length > 0);

  return (
    <div className="space-y-8 p-2 lg:p-4">
      {/* Portfolio Header Card */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#8b5cf6] flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/25">
            {activeStudent.name ? activeStudent.name[0] : 'S'}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{activeStudent.name}</h1>
            <p className="text-xs text-[#7c3aed] font-semibold font-mono mt-0.5">Register Code: {activeStudent.studentCode}</p>
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-[#8b5cf6]" /> {activeStudent.department}</span>
              <span>• {activeStudent.degree} (Year {activeStudent.year}, Sem {activeStudent.semester})</span>
            </div>

            {/* Social/Coding Profile Links */}
            {hasLinks && (
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {activeStudent.github && (
                  <a
                    href={activeStudent.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold transition shadow-sm"
                  >
                    <Github className="w-3.5 h-3.5 text-black" /> GitHub
                  </a>
                )}
                {activeStudent.linkedin && (
                  <a
                    href={activeStudent.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold transition shadow-sm"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn
                  </a>
                )}
                {activeStudent.leetcode && (
                  <a
                    href={activeStudent.leetcode}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold transition shadow-sm"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-500" /> LeetCode
                  </a>
                )}
                {activeStudent.hackerrank && (
                  <a
                    href={activeStudent.hackerrank}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold transition shadow-sm"
                  >
                    <Link2 className="w-3.5 h-3.5 text-emerald-600" /> HackerRank
                  </a>
                )}
                {activeStudent.codechef && (
                  <a
                    href={activeStudent.codechef}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold transition shadow-sm"
                  >
                    <Link2 className="w-3.5 h-3.5 text-orange-600" /> CodeChef
                  </a>
                )}
                {Array.isArray(parsedCustomLinks) && parsedCustomLinks.map((lnk, idx) => (
                  <a
                    key={idx}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#7c3aed] border border-[#7c3aed]/25 text-[11px] font-bold transition shadow-sm"
                  >
                    <Link2 className="w-3.5 h-3.5 text-[#7c3aed]" /> {lnk.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handlePrintPortfolio}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs transition shadow-md shadow-purple-500/20 active:scale-95"
        >
          <Printer className="w-4 h-4" /> Download Official Portfolio PDF
        </button>
      </div>

      {/* Gamification & Community Leaderboard Points Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Activity Points</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">0</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">
            🏃‍♂️
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Reward Points</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">0</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl shrink-0">
            🎁
          </div>
        </div>

        <div className="bg-gradient-to-tr from-[#7c3aed] to-[#8b5cf6] p-6 rounded-3xl border border-[#7c3aed]/30 shadow-lg shadow-purple-500/10 flex items-center justify-between gap-4 text-white">
          <div>
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest font-mono">Community Points (Leaderboard)</span>
            <div className="text-3xl font-extrabold mt-1 font-mono">{activeStudent.points || 0}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/10 flex items-center justify-center text-xl shrink-0">
            👑
          </div>
        </div>
      </div>

      {/* LEETCODE-STYLE HEATSTREAK MATRIX COMPONENT */}
      <StudentHeatStreak studentId={activeStudent.id} tasks={tasks} />

      {/* Portfolio Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info & Performance Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-lg font-extrabold text-[#7c3aed] border-b border-slate-100 pb-2">Academic & Contact</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <span className="font-mono text-slate-800 font-bold">{activeStudent.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Contact Phone:</span>
                <span className="text-slate-800 font-semibold">{activeStudent.contact || '+91 9876543210'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Department:</span>
                <span className="text-slate-800 font-semibold">{activeStudent.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Academic Year:</span>
                <span className="text-slate-800 font-semibold">Year {activeStudent.year} (Sem {activeStudent.semester})</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2">Participation Metrics</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-2xl font-extrabold text-[#7c3aed] font-mono">{activeStudent.attendancePercentage || 92}%</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Attendance</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-2xl font-extrabold text-[#7c3aed] font-mono">{activeStudent.totalVolunteerHours || 0} hrs</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Volunteer Hours</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-2xl font-extrabold text-slate-900 font-mono">{communities.length}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Joined Clubs</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-2xl font-extrabold text-slate-900 font-mono">{achievements.length}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Achievements</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Joined Communities */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
            <span>Enrolled Communities</span>
            <span className="text-xs font-mono text-[#7c3aed] bg-purple-100 px-2 py-0.5 rounded-full font-bold">{communities.length}</span>
          </h3>

          {communities.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {communities.map((c) => (
                <div key={c.id || c.communityId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">{c.name || c.communityName}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Category: {c.category || 'Technical'}</div>
                  </div>
                  <Badge status={c.status || 'APPROVED'}>{c.status || 'APPROVED'}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              No joined communities found yet. Browse "Explore Communities" to join.
            </div>
          )}
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2">Verified Activity Timeline</h3>
          {activities.length > 0 ? (
            <Timeline activities={activities} />
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              No verified activity logs recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Official Portfolio PDF Modal */}
      <PrintReportModal
        isOpen={reportModal}
        onClose={() => setReportModal(false)}
        reportData={reportData}
      />
    </div>
  );
};

export default StudentProfilePage;
