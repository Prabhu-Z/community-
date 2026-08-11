import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, Inbox, Archive } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('unread'); // 'unread' or 'read'

  const unread = (notifications || []).filter((n) => !(n.isRead || n.read));
  const read = (notifications || []).filter((n) => (n.isRead || n.read));

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-[#8b5cf6]" /> Notifications
          </span>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900 mt-1">Notifications Hub</h1>
          <p className="text-xs text-slate-600 mt-1">Updates on memberships, events, certificates, and announcements.</p>
        </div>

        {unread.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] font-bold text-xs transition border border-purple-200 shadow-sm active:scale-95 shrink-0"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Premium Tab Selection */}
      <div className="flex items-center gap-2 bg-[#eef2f6] p-1 rounded-xl border border-slate-200 text-xs self-start w-fit">
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
            activeTab === 'unread'
              ? 'bg-[#8b5cf6] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#7c3aed]'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" /> Unread ({unread.length})
        </button>
        <button
          onClick={() => setActiveTab('read')}
          className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
            activeTab === 'read'
              ? 'bg-[#8b5cf6] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#7c3aed]'
          }`}
        >
          <Archive className="w-3.5 h-3.5" /> Read Archive ({read.length})
        </button>
      </div>

      {/* Notifications List Container */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4">
        {activeTab === 'unread' ? (
          unread.length > 0 ? (
            <div className="space-y-3">
              {unread.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className="p-4 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-500/5 to-transparent hover:border-[#8b5cf6]/40 transition cursor-pointer flex items-start justify-between gap-4"
                  title="Click to mark as read"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
                      <h4 className="font-sans font-extrabold text-[#7c3aed] text-sm">{n.title}</h4>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed pl-4">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono pl-4 block">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <button className="text-[10px] font-bold text-[#8b5cf6] hover:underline shrink-0 pl-2">
                    Mark Read
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Inbox className="w-8 h-8 text-[#7c3aed]/40 mx-auto mb-2" />
              All caught up! No unread notifications.
            </div>
          )
        ) : read.length > 0 ? (
          <div className="space-y-3">
            {read.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 transition flex flex-col justify-between gap-2"
              >
                <div>
                  <h4 className="font-sans font-bold text-slate-700 text-sm">{n.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No read notifications in your archive.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
