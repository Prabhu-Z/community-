import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Clock,
  Award,
  FileCheck,
  Megaphone,
  BarChart3,
  Search,
  FileText,
  Bell,
  CheckCircle2,
  FolderKanban,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Trophy,
  Crown,
  BookOpen
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isStudentLeader, setIsStudentLeader] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ROLE_STUDENT') return;
    const checkLeaderStatus = async () => {
      try {
        const studentRes = await api.get(`/students/user/${user.id}`).catch(() => null);
        if (studentRes?.data?.id) {
          const studentId = studentRes.data.id;
          const memRes = await api.get(`/memberships/student/${studentId}`).catch(() => ({ data: [] }));
          const activeMems = (memRes.data || []).filter(m => m.status === 'APPROVED');
          
          const leaderRoles = [
            'STUDENT_COORDINATOR',
            'COMMUNITY_COORDINATOR',
            'EVENT_ORGANIZER',
            'TEAM_LEAD',
            'SECRETARY',
            'JOINT_SECRETARY',
            'PRESIDENT',
            'LEADER',
            'COORDINATOR'
          ];

          const hasLeaderRoleInMem = activeMems.some(m =>
            m.role && leaderRoles.includes(m.role.toUpperCase())
          );

          const groupsRes = await api.get(`/community-groups/student/${studentId}`).catch(() => ({ data: [] }));
          const ledGroups = (groupsRes.data || []).filter(g => g.leaderStudentId === studentId);

          const rawUserRole = (user.role || '').toUpperCase();
          const isUserLeaderRole = rawUserRole.includes('COORDINATOR') || rawUserRole.includes('ORGANIZER') || rawUserRole.includes('LEAD');

          setIsStudentLeader(hasLeaderRoleInMem || isUserLeaderRole || ledGroups.length > 0);
        }
      } catch (e) {
        console.error('Error checking sidebar leader status:', e);
      }
    };
    checkLeaderStatus();
  }, [user]);

  if (!user) return null;

  const role = user.role;

  const baseStudentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/my-communities', icon: FolderKanban, label: 'My Joined Communities' },
    { to: '/student/group-openings', icon: Users, label: 'Group Openings' },
  ];

  if (isStudentLeader) {
    baseStudentLinks.push({ to: '/student/my-leader-group', icon: Crown, label: 'My Leader Group' });
  }

  baseStudentLinks.push(
    { to: '/student/tasks', icon: CheckSquare, label: 'Tasks & Proofs' },
    { to: '/student/activity-requests', icon: Sparkles, label: 'Activity Requests' },
    { to: '/student/leaderboard', icon: Trophy, label: 'Community Leaderboard' },
    { to: '/student/communities', icon: Users, label: 'Explore Communities' },
    { to: '/student/events', icon: Calendar, label: 'Events & Registration' },
    { to: '/student/calendar', icon: Calendar, label: 'Campus Calendar' },
    { to: '/student/attendance', icon: CheckSquare, label: 'My Attendance' },
    { to: '/student/timeline', icon: Clock, label: 'Activity Timeline' },
    { to: '/student/volunteer-hours', icon: CheckCircle2, label: 'Volunteer Hours' },
    { to: '/student/achievements', icon: Award, label: 'Achievements' },
    { to: '/student/certificates', icon: FileCheck, label: 'Certificates' },
    { to: '/student/resources', icon: BookOpen, label: 'Community Roadmaps' },
    { to: '/student/notifications', icon: Bell, label: 'Notifications' }
  );

  const studentLinks = baseStudentLinks;

  const coordinatorLinks = [
    { to: '/coordinator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/coordinator/community', icon: FolderKanban, label: 'Community Info' },
    { to: '/coordinator/tasks', icon: CheckSquare, label: 'Task Assignments' },
    { to: '/coordinator/activity-requests', icon: Sparkles, label: 'Activity Requests' },
    { to: '/coordinator/leaderboard', icon: Trophy, label: 'Member Leaderboard' },
    { to: '/coordinator/student-search', icon: Search, label: 'Member Student Search' },
    { to: '/coordinator/membership-requests', icon: Users, label: 'Pending Requests' },
    { to: '/coordinator/events', icon: Calendar, label: 'Event Management' },
    { to: '/coordinator/attendance', icon: CheckSquare, label: 'Record Attendance' },
    { to: '/coordinator/activities', icon: Clock, label: 'Activity Logging' },
    { to: '/coordinator/volunteer-hours', icon: CheckCircle2, label: 'Verify Hours' },
    { to: '/coordinator/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/coordinator/reports', icon: FileText, label: 'Community Reports' },
    { to: '/faculty/analytics', icon: BarChart3, label: 'Participation Analytics' },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/faculty/tasks', icon: CheckSquare, label: 'Task Assignments' },
    { to: '/faculty/leaderboards', icon: Trophy, label: 'Campus Leaderboards' },
    { to: '/faculty/communities', icon: Users, label: 'All 30+ Communities' },
    {to: '/faculty/membership-requests', icon: Users, label: 'Join Requests'},
    { to: '/faculty/coordinator-search', icon: UserCheck, label: 'Faculty Search' },
    { to: '/faculty/student-search', icon: Search, label: 'Student Search' },
    { to: '/faculty/analytics', icon: BarChart3, label: 'Participation Analytics' },
    { to: '/faculty/reports', icon: FileText, label: 'College Reports' },
    { to: '/faculty/resources', icon: BookOpen, label: 'Resources & Roadmaps' },
  ];

  let links = [];
  if (role === 'ROLE_STUDENT') links = studentLinks;
  else if (role === 'ROLE_COMMUNITY_COORDINATOR') links = coordinatorLinks;
  else if (role === 'ROLE_FACULTY') links = facultyLinks;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-white text-slate-900/80 backdrop-blur-md lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 lg:z-20 h-full lg:h-[calc(100vh-4rem)] w-64 bg-white flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-200 flex-shrink-0 text-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {role === 'ROLE_STUDENT' && <GraduationCap className="w-5 h-5 text-[#8b5cf6]" />}
            {role === 'ROLE_COMMUNITY_COORDINATOR' && <ShieldCheck className="w-5 h-5 text-[#8b5cf6]" />}
            {role === 'ROLE_FACULTY' && <Sparkles className="w-5 h-5 text-[#8b5cf6]" />}
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              {role === 'ROLE_STUDENT' && 'Student Workspace'}
              {role === 'ROLE_COMMUNITY_COORDINATOR' && 'Faculty Workspace'}
              {role === 'ROLE_FACULTY' && 'Admin Workspace'}
            </h2>
          </div>
          <p className="text-[10px] text-[#8b5cf6] font-semibold mt-1 font-mono uppercase tracking-wider">SCTS Campus Platform</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3.5 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-[#8b5cf6] text-white font-extrabold shadow-lg shadow-purple-500/25 translate-x-1'
                      : 'text-slate-600 hover:text-[#7c3aed] hover:bg-slate-100 hover:translate-x-1'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white font-black' : 'text-[#8b5cf6] group-hover:scale-110 transition-transform'}`} />
                      <span>{link.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100">
          {role === 'ROLE_STUDENT' ? (
            <Link
              to="/student/profile-links"
              onClick={onClose}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-sm hover:border-[#8b5cf6]/60 cursor-pointer transition block group"
            >
              <div className="w-8 h-8 rounded-full bg-[#8b5cf6] group-hover:bg-[#7c3aed] flex items-center justify-center text-white font-bold text-xs shadow-md transition">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-bold text-slate-800 truncate group-hover:text-[#7c3aed] transition">{user.name || 'User'}</div>
                <div className="text-[10px] text-slate-500 truncate font-mono">{user.email}</div>
              </div>
            </Link>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-sm hover:border-[#8b5cf6]/40 transition">
              <div className="w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-xs shadow-md">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-800 truncate">{user.name || 'User'}</div>
                <div className="text-[10px] text-slate-500 truncate font-mono">{user.email}</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
