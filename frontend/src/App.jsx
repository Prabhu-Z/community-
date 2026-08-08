import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Public Pages
import Landing3DPage from './pages/Landing3DPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentProfilePage from './pages/student/StudentProfilePage';
import MyCommunitiesPage from './pages/student/MyCommunitiesPage';
import StudentTasksPage from './pages/student/StudentTasksPage';
import StudentActivityRequestsPage from './pages/student/StudentActivityRequestsPage';
import StudentLeaderboardPage from './pages/student/StudentLeaderboardPage';
import CommunitiesPage from './pages/student/CommunitiesPage';
import EventsPage from './pages/student/EventsPage';
import AttendancePage from './pages/student/AttendancePage';
import ActivityTimelinePage from './pages/student/ActivityTimelinePage';
import VolunteerHoursPage from './pages/student/VolunteerHoursPage';
import AchievementsPage from './pages/student/AchievementsPage';
import CertificatesPage from './pages/student/CertificatesPage';
import NotificationsPage from './pages/student/NotificationsPage';
import MyLeaderGroupPage from './pages/student/MyLeaderGroupPage';
import GroupOpeningsPage from './pages/student/GroupOpeningsPage';

// Coordinator Pages
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import CommunityManagePage from './pages/coordinator/CommunityManagePage';
import CoordinatorTasksPage from './pages/coordinator/CoordinatorTasksPage';
import CoordinatorActivityRequestsPage from './pages/coordinator/CoordinatorActivityRequestsPage';
import CoordinatorLeaderboardPage from './pages/coordinator/CoordinatorLeaderboardPage';
import CoordinatorStudentSearchPage from './pages/coordinator/CoordinatorStudentSearchPage';
import MembershipRequestsPage from './pages/coordinator/MembershipRequestsPage';
import EventManagePage from './pages/coordinator/EventManagePage';
import AttendanceManagePage from './pages/coordinator/AttendanceManagePage';
import ActivityManagePage from './pages/coordinator/ActivityManagePage';
import VolunteerManagePage from './pages/coordinator/VolunteerManagePage';
import AnnouncementsPage from './pages/coordinator/AnnouncementsPage';
import CoordinatorReportsPage from './pages/coordinator/CoordinatorReportsPage';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyLeaderboardPage from './pages/faculty/FacultyLeaderboardPage';
import AllCommunitiesView from './pages/faculty/AllCommunitiesView';
import FacultyCommunityDetailPage from './pages/faculty/FacultyCommunityDetailPage';
import CoordinatorSearchPage from './pages/faculty/CoordinatorSearchPage';
import StudentSearchPage from './pages/faculty/StudentSearchPage';
import StudentDetailPortfolio from './pages/faculty/StudentDetailPortfolio';
import AnalyticsView from './pages/faculty/AnalyticsView';
import FacultyReportsPage from './pages/faculty/FacultyReportsPage';

// Flexible Protected Route Guard Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole) {
    const userRole = String(user.role || '').toUpperCase();
    const targetRole = String(allowedRole).toUpperCase();
    const rawRole = targetRole.replace('ROLE_', '');
    if (userRole !== targetRole && userRole !== rawRole) {
      return <Navigate to="/" replace />;
    }
  }
  return children;
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex flex-col bg-[#eef2f6] text-slate-800 overflow-hidden font-sans">
      {/* Sticky Top LMS Navbar */}
      <div className="h-16 flex-shrink-0 z-30">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Main Content Body Area - Light Periwinkle Canvas */}
      <div className="flex-1 flex overflow-hidden relative p-2 sm:p-4 gap-4 bg-[#eef2f6]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Pure White Main Viewport Canvas matching LMS screenshot */}
        <main className="flex-1 overflow-y-auto rounded-2xl sm:rounded-3xl bg-[#eef2f6] relative text-slate-800">
          <div className="max-w-7xl mx-auto w-full p-2 sm:p-4 lg:p-6 space-y-6 pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing3DPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student Protected Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><StudentProfilePage /></ProtectedRoute>} />
        <Route path="/student/profile" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/student/my-communities" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><MyCommunitiesPage /></ProtectedRoute>} />
        <Route path="/student/tasks" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><StudentTasksPage /></ProtectedRoute>} />
        <Route path="/student/activity-requests" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><StudentActivityRequestsPage /></ProtectedRoute>} />
        <Route path="/student/leaderboard" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><StudentLeaderboardPage /></ProtectedRoute>} />
        <Route path="/student/communities" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><CommunitiesPage /></ProtectedRoute>} />
        <Route path="/student/events" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><EventsPage /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><AttendancePage /></ProtectedRoute>} />
        <Route path="/student/timeline" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><ActivityTimelinePage /></ProtectedRoute>} />
        <Route path="/student/volunteer-hours" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><VolunteerHoursPage /></ProtectedRoute>} />
        <Route path="/student/achievements" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><AchievementsPage /></ProtectedRoute>} />
        <Route path="/student/certificates" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><CertificatesPage /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><NotificationsPage /></ProtectedRoute>} />
        <Route path="/student/group-openings" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><GroupOpeningsPage /></ProtectedRoute>} />
        <Route path="/student/my-leader-group" element={<ProtectedRoute allowedRole="ROLE_STUDENT"><MyLeaderGroupPage /></ProtectedRoute>} />

        {/* Coordinator Protected Routes */}
        <Route path="/coordinator/dashboard" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><CoordinatorDashboard /></ProtectedRoute>} />
        <Route path="/coordinator/community" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><CommunityManagePage /></ProtectedRoute>} />
        <Route path="/coordinator/tasks" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><CoordinatorTasksPage /></ProtectedRoute>} />
        <Route path="/coordinator/activity-requests" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><CoordinatorActivityRequestsPage /></ProtectedRoute>} />
        <Route path="/coordinator/leaderboard" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><CoordinatorLeaderboardPage /></ProtectedRoute>} />
        <Route path="/coordinator/student-search" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><CoordinatorStudentSearchPage /></ProtectedRoute>} />
        <Route path="/coordinator/membership-requests" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><MembershipRequestsPage /></ProtectedRoute>} />
        <Route path="/coordinator/events" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><EventManagePage /></ProtectedRoute>} />
        <Route path="/coordinator/attendance" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><AttendanceManagePage /></ProtectedRoute>} />
        <Route path="/coordinator/activities" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><ActivityManagePage /></ProtectedRoute>} />
        <Route path="/coordinator/volunteer-hours" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><VolunteerManagePage /></ProtectedRoute>} />
        <Route path="/coordinator/announcements" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><AnnouncementsPage /></ProtectedRoute>} />
        <Route path="/coordinator/reports" element={<ProtectedRoute allowedRole="ROLE_COMMUNITY_COORDINATOR"><CoordinatorReportsPage /></ProtectedRoute>} />

        {/* Faculty Protected Routes */}
        <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRole="ROLE_FACULTY"><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/leaderboards" element={<ProtectedRoute allowedRole="ROLE_FACULTY"><FacultyLeaderboardPage /></ProtectedRoute>} />
        <Route path="/faculty/communities" element={<ProtectedRoute allowedRole="ROLE_FACULTY"><AllCommunitiesView /></ProtectedRoute>} />
        <Route path="/faculty/communities/:id" element={<ProtectedRoute allowedRole="ROLE_FACULTY"><FacultyCommunityDetailPage /></ProtectedRoute>} />
        <Route path="/faculty/coordinator-search" element={<ProtectedRoute allowedRole="ROLE_FACULTY"><CoordinatorSearchPage /></ProtectedRoute>} />
        <Route path="/faculty/student-search" element={<ProtectedRoute allowedRole="ROLE_FACULTY"><StudentSearchPage /></ProtectedRoute>} />
        <Route path="/faculty/students/:id" element={<ProtectedRoute allowedRole="ROLE_FACULTY"><StudentDetailPortfolio /></ProtectedRoute>} />
        <Route path="/faculty/analytics" element={<ProtectedRoute allowedRole="ROLE_FACULTY"><AnalyticsView /></ProtectedRoute>} />
        <Route path="/faculty/reports" element={<ProtectedRoute allowedRole="ROLE_FACULTY"><FacultyReportsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
