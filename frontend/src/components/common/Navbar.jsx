import React from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { LogOut, Sparkles, GraduationCap, ShieldCheck, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_STUDENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#8b5cf6]/15 text-[#7c3aed] border border-[#8b5cf6]/30 flex items-center gap-1 shadow-sm">
            <GraduationCap className="w-3 h-3 text-[#7c3aed]" /> STUDENT
          </span>
        );
      case 'ROLE_COMMUNITY_COORDINATOR':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#7c3aed]/20 text-[#6d28d9] border border-[#7c3aed]/40 flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-[#6d28d9]" />ADMIN</span>
        );
      case 'ROLE_FACULTY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3 text-purple-600" /> ADMIN OVERSIGHT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 w-full bg-[#eef2f6] px-4 lg:px-8 flex items-center justify-between border-b border-slate-200 shadow-sm relative z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-200/60 border border-slate-300 active:scale-95 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* LMS CONTROL BUTTONS & SEGMENTED TABS - EXACTLY MATCHING USER IMAGE */}
        <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            title="Expand Menu"
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition active:scale-95 flex items-center justify-center"
          >
            <ChevronDown className="w-4 h-4 text-slate-600" />
          </button>

          {/* Active Segmented Tab Pill matching image */}
          <div className="flex items-center gap-1">
            <button className="px-3.5 py-1.5 rounded-xl bg-[#8b5cf6] text-white text-xs font-extrabold shadow-md shadow-purple-500/25 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>SCTS Platform</span>
            </button>
            <button className="hidden sm:block px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition">
              Practice
            </button>
          </div>

          {/* Back & Forward Controls */}
          <div className="hidden sm:flex items-center gap-1 pl-1">
            <button
              onClick={() => navigate(-1)}
              title="Go Back"
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(1)}
              title="Go Forward"
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Link to="/" className="hidden md:flex items-center gap-2.5 group pl-2">
          <div className="w-8 h-8 bg-[#8b5cf6]/10 rounded-lg flex items-center justify-center border border-[#8b5cf6]/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <span className="material-symbols-outlined text-[#7c3aed] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-800 group-hover:text-[#7c3aed] transition-colors leading-none block">
              SCTS
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {user ? (
          <>
            <NotificationDropdown />

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-extrabold text-slate-800 tracking-wide">{user.name || user.email}</div>
                <div className="mt-0.5 flex justify-end">{getRoleBadge(user.role)}</div>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-[#8b5cf6] border border-slate-300 hover:border-[#8b5cf6] active:scale-95 transition-all duration-200 flex items-center gap-1.5 text-xs font-bold shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5 text-[#7c3aed] group-hover:text-slate-900" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition hover:bg-white/5 border border-transparent hover:border-slate-200"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4.5 py-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold transition shadow-sm text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
