import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, Inbox, Archive } from 'lucide-react';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('unread'); // 'unread' or 'read'
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const unread = (notifications || []).filter((n) => !(n.isRead || n.read));
  const read = (notifications || []).filter((n) => (n.isRead || n.read));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
        title="View Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 shadow-2xl rounded-3xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Dropdown Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <h4 className="font-sans text-sm font-bold text-[#7c3aed] flex items-center gap-1.5">
                <Bell className="w-4 h-4" /> Notifications
              </h4>
              {unread.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-[#8b5cf6] hover:underline flex items-center gap-1 font-bold"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* Dropdown Sub-Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs mb-3">
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-center transition flex items-center justify-center gap-1 ${
                  activeTab === 'unread'
                    ? 'bg-[#8b5cf6] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#7c3aed]'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" /> Unread ({unread.length})
              </button>
              <button
                onClick={() => setActiveTab('read')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-center transition flex items-center justify-center gap-1 ${
                  activeTab === 'read'
                    ? 'bg-[#8b5cf6] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#7c3aed]'
                }`}
              >
                <Archive className="w-3.5 h-3.5" /> Read ({read.length})
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {activeTab === 'unread' ? (
                unread.length > 0 ? (
                  unread.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className="p-3 rounded-xl border border-purple-100 bg-gradient-to-r from-purple-500/5 to-transparent hover:border-[#8b5cf6]/40 transition cursor-pointer text-xs space-y-1"
                      title="Click to mark as read"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-sans font-bold text-[#7c3aed] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] shrink-0" />
                          {n.title}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono shrink-0">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-2.5">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 font-medium">
                    No unread notifications.
                  </div>
                )
              ) : read.length > 0 ? (
                read.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-sans font-semibold text-slate-700">{n.title}</span>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">{n.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  No read notifications.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
