import React, { useState } from 'react';
import { Flame, Zap, CheckCircle2, Calendar, Sparkles } from 'lucide-react';

const StudentHeatStreak = ({ studentId, tasks = [] }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('ALL');

  // Filter completed or submitted tasks
  const completedTasks = tasks.filter(
    (t) => t.submissionStatus === 'SUBMITTED' || t.submissionStatus === 'VERIFIED' || t.status === 'COMPLETED' || t.status === 'VERIFIED' || t.isSubmitted
  );

  // Group completed tasks by date (YYYY-MM-DD)
  const activityMap = {};
  completedTasks.forEach((t) => {
    const rawDate = t.submissionDate || t.submittedAt || t.completedAt || t.createdAt;
    if (rawDate) {
      const dateStr = new Date(rawDate).toISOString().split('T')[0];
      activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    }
  });

  // Full 1-Year (Jan to Dec) Month Split Engine
  const currentYear = new Date().getFullYear();
  const monthsList = [
    { name: 'Jan', index: 0, fullName: 'January' },
    { name: 'Feb', index: 1, fullName: 'February' },
    { name: 'Mar', index: 2, fullName: 'March' },
    { name: 'Apr', index: 3, fullName: 'April' },
    { name: 'May', index: 4, fullName: 'May' },
    { name: 'Jun', index: 5, fullName: 'June' },
    { name: 'Jul', index: 6, fullName: 'July' },
    { name: 'Aug', index: 7, fullName: 'August' },
    { name: 'Sep', index: 8, fullName: 'September' },
    { name: 'Oct', index: 9, fullName: 'October' },
    { name: 'Nov', index: 10, fullName: 'November' },
    { name: 'Dec', index: 11, fullName: 'December' },
  ];

  const yearMonths = monthsList.map((m) => {
    const totalDaysInMonth = new Date(currentYear, m.index + 1, 0).getDate();
    const days = [];
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const monthStr = String(m.index + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      const dObj = new Date(currentYear, m.index, day);
      days.push({
        dateStr,
        dateObj: dObj,
        count: activityMap[dateStr] || 0,
        dayNum: day,
        dayOfWeek: dObj.getDay(),
        monthName: m.name,
      });
    }

    // Group month days into 7-row week columns
    const weeks = [];
    let curWeek = [];
    const firstDayOfWeek = days[0].dayOfWeek;
    for (let i = 0; i < firstDayOfWeek; i++) {
      curWeek.push(null);
    }
    days.forEach((dayObj) => {
      curWeek.push(dayObj);
      if (curWeek.length === 7) {
        weeks.push(curWeek);
        curWeek = [];
      }
    });
    if (curWeek.length > 0) {
      while (curWeek.length < 7) curWeek.push(null);
      weeks.push(curWeek);
    }

    return {
      monthName: m.name,
      fullName: m.fullName,
      monthIndex: m.index,
      year: currentYear,
      days,
      weeks,
      totalTaskCount: days.reduce((sum, d) => sum + d.count, 0),
    };
  });

  // Calculate Streak Logic across the entire 365 days of the year
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Combine all days chronologically
  const allYearDays = [];
  yearMonths.forEach((m) => allYearDays.push(...m.days));

  // Current streak calculation
  let checkDate = new Date();
  let todayStr = checkDate.toISOString().split('T')[0];

  if (!activityMap[todayStr]) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (activityMap[dateStr] && activityMap[dateStr] > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak calculation
  allYearDays.forEach((day) => {
    if (day.count > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  });

  // Calculate Cell Background Colors matching LeetCode theme
  const getCellColor = (count) => {
    if (count === 0) return 'bg-slate-100 border-slate-200 hover:border-slate-300';
    if (count === 1) return 'bg-purple-300 border-purple-400 shadow-sm';
    if (count === 2) return 'bg-purple-500 border-purple-600 shadow-sm';
    return 'bg-[#8b5cf6] border-purple-700 shadow-md animate-pulse';
  };

  const filteredMonths = selectedMonthFilter === 'ALL'
    ? yearMonths
    : yearMonths.filter(m => m.monthName === selectedMonthFilter);

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 lg:p-8 space-y-6">
      {/* Header & Streak Counter Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#7c3aed] flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" /> LeetCode 1-Year Activity Heatstreak ({currentYear})
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Split Months Activity Heatmap</h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Jan to Dec full calendar year split into individual month blocks.
          </p>
        </div>

        {/* Streak Stats Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Current Streak */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-white fill-white animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-mono font-extrabold tracking-wider opacity-90">Current Streak</div>
              <div className="text-lg font-black leading-none font-mono">{currentStreak} Days 🔥</div>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="bg-purple-50 border border-purple-200 text-[#7c3aed] px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-[#8b5cf6] fill-purple-600" />
            <div>
              <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">Longest Streak</div>
              <div className="text-lg font-extrabold leading-none text-slate-900 font-mono">{longestStreak} Days ⚡</div>
            </div>
          </div>

          {/* Total Tasks Completed */}
          <div className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">Tasks Completed</div>
              <div className="text-lg font-extrabold leading-none text-slate-900 font-mono">{completedTasks.length} Tasks</div>
            </div>
          </div>
        </div>
      </div>

      {/* MONTH SELECTION FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedMonthFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedMonthFilter === 'ALL'
                ? 'bg-[#8b5cf6] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            All 12 Months (Jan - Dec)
          </button>

          {monthsList.map((m) => (
            <button
              key={m.name}
              onClick={() => setSelectedMonthFilter(m.name)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedMonthFilter === m.name
                  ? 'bg-[#8b5cf6] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 font-medium self-end sm:self-auto">
          <span>Less</span>
          <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 inline-block"></span>
          <span className="w-3.5 h-3.5 rounded bg-purple-300 border border-purple-400 inline-block"></span>
          <span className="w-3.5 h-3.5 rounded bg-purple-500 border border-purple-600 inline-block"></span>
          <span className="w-3.5 h-3.5 rounded bg-[#8b5cf6] border border-purple-700 inline-block"></span>
          <span>More</span>
        </div>
      </div>

      {/* SPLIT MONTHS GRID CONTAINER (Jan to Dec Horizontal Scroll / Grid) */}
      <div className="overflow-x-auto pb-3 pt-1">
        <div className="flex items-start gap-4 min-w-max">
          {/* Day Labels Column (Mon, Wed, Fri) */}
          <div className="flex flex-col justify-between text-[10px] font-mono font-extrabold text-slate-400 pt-7 pb-1 h-[138px] w-6 flex-shrink-0">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Render Each Month Block Separately */}
          {filteredMonths.map((m) => (
            <div
              key={m.monthName}
              className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3 space-y-2 flex-shrink-0 shadow-sm"
            >
              {/* Month Header Label */}
              <div className="flex items-center justify-between font-extrabold text-xs text-slate-800 border-b border-slate-200/60 pb-1.5">
                <span className="text-[#7c3aed]">{m.fullName} {m.year}</span>
                {m.totalTaskCount > 0 && (
                  <span className="text-[10px] font-mono bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-bold">
                    {m.totalTaskCount} {m.totalTaskCount === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </div>

              {/* Month 7-Row Grid Columns */}
              <div className="flex gap-1.5">
                {m.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1.5">
                    {week.map((day, dIdx) => {
                      if (!day) {
                        return (
                          <div
                            key={dIdx}
                            className="w-3.5 h-3.5 rounded-md bg-transparent border border-transparent opacity-0"
                          />
                        );
                      }

                      return (
                        <div
                          key={dIdx}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-3.5 h-3.5 rounded-md border transition-all duration-200 cursor-pointer hover:scale-125 ${getCellColor(
                            day.count
                          )}`}
                          title={`${day.monthName} ${day.dayNum}, ${m.year}: ${day.count} Task(s) Completed`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Hover Tooltip Box */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between min-h-[46px]">
        {hoveredDay ? (
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <Calendar className="w-4 h-4 text-[#8b5cf6]" />
            <span>
              <strong>{hoveredDay.monthName} {hoveredDay.dayNum}, {currentYear}</strong>: {' '}
              <span className="text-[#7c3aed] font-extrabold">
                {hoveredDay.count === 0 ? 'No tasks completed' : `${hoveredDay.count} Task(s) Completed 🎉`}
              </span>
            </span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px] italic">
            💡 Hover over any box in the split month blocks to inspect daily & community task completions for that date.
          </span>
        )}

        <div className="text-[10px] font-mono text-slate-500 font-bold uppercase flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> LeetCode 1-Year Matrix
        </div>
      </div>
    </div>
  );
};

export default StudentHeatStreak;
