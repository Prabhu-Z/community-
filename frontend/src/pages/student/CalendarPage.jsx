import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  PlusCircle, 
  Info,
  Building2
} from 'lucide-react';

const CalendarPage = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  
  // Data States
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal & Selection States
  const [selectedDayActivities, setSelectedDayActivities] = useState([]);
  const [selectedDayStr, setSelectedDayStr] = useState('');
  const [dayDetailsModal, setDayDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetailModal, setEventDetailModal] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudentAndData();
    }
  }, [user]);

  const fetchStudentAndData = async () => {
    try {
      setLoading(true);
      const studentRes = await api.get(`/students/user/${user.id}`).catch(() => null);
      const studentData = studentRes?.data || null;
      setStudent(studentData);

      if (studentData?.id) {
        // Fetch approved events, student tasks, and student joined communities' resources
        const [eventsRes, tasksRes, membershipsRes] = await Promise.all([
          api.get('/events').catch(() => ({ data: [] })),
          api.get(`/tasks/student/${studentData.id}`).catch(() => ({ data: [] })),
          api.get(`/memberships/student/${studentData.id}`).catch(() => ({ data: [] }))
        ]);

        const activeMems = (membershipsRes.data || []).filter(m => m.status === 'APPROVED');
        
        // Fetch resources for each approved community
        let allResources = [];
        if (activeMems.length > 0) {
          const resourcePromises = activeMems.map(m => 
            api.get(`/resources/community/${m.communityId}`).catch(() => ({ data: [] }))
          );
          const resourcesResponses = await Promise.all(resourcePromises);
          resourcesResponses.forEach(res => {
            allResources = [...allResources, ...(res.data || [])];
          });
        }

        setEvents(eventsRes.data || []);
        setTasks(tasksRes.data || []);
        setResources(allResources);
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    if (!student?.id || registering) return;
    setRegistering(true);
    try {
      await api.post(`/events/${eventId}/register?studentId=${student.id}`);
      alert('🎉 Registered successfully for the event!');
      
      // Update local state to show registration
      setEvents(prev => prev.map(ev => {
        if (ev.id === eventId) {
          return { ...ev, isUserRegistered: true, currentRegistrations: (ev.currentRegistrations || 0) + 1 };
        }
        return ev;
      }));

      // Refresh selected event inside modal
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(prev => ({
          ...prev,
          isUserRegistered: true,
          currentRegistrations: (prev.currentRegistrations || 0) + 1
        }));
      }

      fetchStudentAndData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register for the event.');
    } finally {
      setRegistering(false);
    }
  };

  // Helper Calendar Math
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Activity Matching by Date
  const getActivitiesForDate = (dayNum) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    const dayEvents = events.filter(e => e.eventDate === cellDateStr && e.status !== 'PENDING');
    const dayTasks = tasks.filter(t => t.deadline && t.deadline.startsWith(cellDateStr));
    const dayMilestones = resources.filter(r => r.createdAt && r.createdAt.startsWith(cellDateStr));

    return {
      events: dayEvents,
      tasks: dayTasks,
      milestones: dayMilestones,
      totalCount: dayEvents.length + dayTasks.length + dayMilestones.length
    };
  };

  const handleDayClick = (dayNum) => {
    const data = getActivitiesForDate(dayNum);
    if (data.totalCount === 0) return;

    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum).toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const flattened = [
      ...data.events.map(e => ({ ...e, calendarType: 'EVENT' })),
      ...data.tasks.map(t => ({ ...t, calendarType: 'TASK' })),
      ...data.milestones.map(m => ({ ...m, calendarType: 'MILESTONE' }))
    ];

    setSelectedDayActivities(flattened);
    setSelectedDayStr(dateStr);
    setDayDetailsModal(true);
  };

  if (loading) return <LoadingSpinner label="Assembling interactive campus calendar..." />;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  
  // Generate Days Array
  const calendarCells = [];
  // Empty spaces for previous month's alignment
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(i);
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6 p-2 lg:p-4 text-xs text-slate-800">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-widest flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-[#8b5cf6]" /> Interactive Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Campus Calendar</h1>
          <p className="text-xs text-slate-600 mt-1">
            Aggregated calendar overview tracking approved events, task deadlines, and roadmap milestone launches.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-[10px] font-bold bg-[#eef2f6] p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Events</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600">Tasks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600">Roadmaps</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Box */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 space-y-6">
        {/* Navigation Month Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-950">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            {/* Quick selectors for Month & Year */}
            <div className="flex items-center gap-1">
              <select
                value={currentDate.getMonth()}
                onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                className="px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs text-slate-800 focus:border-[#8b5cf6] cursor-pointer"
              >
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={currentDate.getFullYear()}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                className="px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs text-slate-800 focus:border-[#8b5cf6] cursor-pointer"
              >
                {Array.from({ length: 16 }, (_, i) => 2020 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-slate-600 shadow-sm"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold transition text-slate-600 shadow-sm"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-slate-600 shadow-sm"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Roster Table Grid */}
        <div className="grid grid-cols-7 text-center gap-1 text-[11px] font-bold text-[#8b5cf6] uppercase tracking-wider font-mono py-2 bg-slate-50 border border-slate-200 rounded-t-xl">
          {weekdays.map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Month cells */}
        <div className="calendar-grid">
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[120px]" />;
            }

            const data = getActivitiesForDate(day);
            const isToday = 
              new Date().getDate() === day && 
              new Date().getMonth() === currentDate.getMonth() && 
              new Date().getFullYear() === currentDate.getFullYear();

            // Flatten all activities on this day
            const dayPills = [
              ...data.events.map(e => ({ id: `ev-${e.id}`, title: e.title, type: 'EVENT' })),
              ...data.tasks.map(t => ({ id: `tk-${t.id}`, title: t.taskTitle, type: 'TASK' })),
              ...data.milestones.map(m => ({ id: `ms-${m.id}`, title: m.title, type: 'MILESTONE' }))
            ];

            const displayPills = dayPills.slice(0, 2);
            const remainingCount = dayPills.length - displayPills.length;

            return (
              <div
                key={`day-${day}`}
                onClick={() => handleDayClick(day)}
                className={`calendar-day ${isToday ? 'selected-day' : ''}`}
              >
                {/* Date Number top-right */}
                <div className="flex justify-between items-center mb-1">
                  <span className={isToday ? 'day-number current-day text-xs' : 'text-[13px] font-medium text-slate-600 p-1'}>
                    {day}
                  </span>
                </div>

                {/* Event Pills */}
                <div className="space-y-1 overflow-hidden flex-1 flex flex-col justify-end">
                  {displayPills.map(p => {
                    let pillClass = '';
                    if (p.type === 'EVENT') {
                      pillClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    } else if (p.type === 'TASK') {
                      pillClass = 'bg-rose-50 text-rose-700 border-rose-100';
                    } else {
                      pillClass = 'bg-amber-50 text-amber-700 border-amber-100';
                    }
                    return (
                      <div 
                        key={p.id} 
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border truncate ${pillClass}`}
                        title={p.title}
                      >
                        {p.title}
                      </div>
                    );
                  })}
                  {remainingCount > 0 && (
                    <div className="text-[10px] font-mono text-[#7c3aed] font-bold pl-1">
                      + {remainingCount} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DAY DETAILS DIALOG MODAL */}
      <Modal isOpen={dayDetailsModal} onClose={() => setDayDetailsModal(false)} title={`Activities on ${selectedDayStr}`}>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {selectedDayActivities.map((a) => {
            const isEvent = a.calendarType === 'EVENT';
            const isTask = a.calendarType === 'TASK';
            const isMilestone = a.calendarType === 'MILESTONE';

            return (
              <div 
                key={`${a.calendarType}-${a.id}`} 
                onClick={() => {
                  if (isEvent) {
                    setSelectedEvent(a);
                    setEventDetailModal(true);
                  }
                }}
                className={`p-3.5 rounded-2xl border transition ${
                  isEvent ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-400 cursor-pointer' :
                  isTask ? 'border-rose-100 bg-rose-50/15' : 'border-amber-100 bg-amber-50/10'
                } flex flex-col justify-between gap-3`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                      isEvent ? 'bg-emerald-100 text-emerald-800' :
                      isTask ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {a.calendarType}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{a.communityName}</span>
                  </div>
                  
                  <h4 className="font-bold text-slate-900 text-sm">
                    {isEvent ? a.title : isTask ? a.taskTitle : a.title}
                  </h4>
                  
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {isEvent ? a.description : isTask ? a.taskDescription : a.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  {isEvent ? (
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {a.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {a.venue}</span>
                    </div>
                  ) : isTask ? (
                    <div className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Deadline: {a.deadline ? new Date(a.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600">
                      <BookOpen className="w-3.5 h-3.5" /> Roadmap Milestone Launched
                    </div>
                  )}

                  {isEvent && (
                    <span className="text-[#8b5cf6] font-bold">
                      Click to Register
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* EVENT DETAIL & INSTANT REGISTRATION MODAL */}
      {selectedEvent && (
        <Modal 
          isOpen={eventDetailModal} 
          onClose={() => {
            setEventDetailModal(false);
            setSelectedEvent(null);
          }} 
          title="Campus Event Information"
        >
          <div className="space-y-6 text-xs text-slate-800">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {selectedEvent.eventScope === 'GLOBAL_EVENT' ? '🌐 Global Campus Event' : '🏛️ Community Event'}
              </span>
              <h3 className="font-extrabold text-slate-900 text-lg mt-2">{selectedEvent.title}</h3>
              <p className="text-slate-500 font-mono text-[10px] mt-0.5">Organized by {selectedEvent.communityName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-slate-500">Event Details</span>
              <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-medium">
                {selectedEvent.description || 'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-[11px] pt-2 border-t border-slate-150">
              <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block">DATE & TIME</span>
                <strong className="text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#8b5cf6]" /> {selectedEvent.eventDate} ({selectedEvent.time})
                </strong>
              </div>
              <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block">VENUE</span>
                <strong className="text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#8b5cf6]" /> {selectedEvent.venue}
                </strong>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-150 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-600 block">Current Capacity:</span>
                <strong className="text-slate-900 text-sm">
                  {selectedEvent.currentRegistrations} / {selectedEvent.maxParticipants || 100} Registered
                </strong>
              </div>

              {selectedEvent.isUserRegistered ? (
                <button
                  type="button"
                  disabled
                  className="px-5 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Registered
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRegisterEvent(selectedEvent.id)}
                  disabled={registering || (selectedEvent.maxParticipants && selectedEvent.currentRegistrations >= selectedEvent.maxParticipants)}
                  className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-extrabold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4 text-slate-900" />
                  {registering ? 'Registering...' : 'Register Instantly'}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CalendarPage;
