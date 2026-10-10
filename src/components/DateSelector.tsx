import React, { useState, useRef, useEffect } from 'react';
import { formatDateKey, parseDateKey, getWeekdayName, formatDuration } from '../utils/storage';
import { CRMTask } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  tasks: CRMTask[];
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
  tasks,
}) => {
  const currentDate = parseDateKey(selectedDate);
  const todayKey = formatDateKey(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Month navigation for the custom popover
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth()); // 0-indexed

  // When selected date changes from outside, sync view month
  useEffect(() => {
    const d = parseDateKey(selectedDate);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [selectedDate]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  // 7-day strip centered around selected date
  const getDaysRange = () => {
    const days: { dateStr: string; dateObj: Date; isToday: boolean; isSelected: boolean }[] = [];
    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + offset);
      const key = formatDateKey(d);
      days.push({
        dateStr: key,
        dateObj: d,
        isToday: key === todayKey,
        isSelected: key === selectedDate,
      });
    }
    return days;
  };

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    onSelectDate(formatDateKey(prev));
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    onSelectDate(formatDateKey(next));
  };

  const handleToday = () => {
    onSelectDate(todayKey);
  };

  const daysRange = getDaysRange();

  const getDateDuration = (dateStr: string) => {
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    const totalMinutes = dayTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
    return {
      minutes: totalMinutes,
      count: dayTasks.length,
    };
  };

  // Generate calendar grid for full month popover
  const getCalendarMonthDays = () => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
    
    // Day of week: 0 is Sun, convert to 0 = Mon, 6 = Sun
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month filler
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, prevMonthLastDay - i);
      cells.push({
        dateStr: formatDateKey(d),
        dayNum: prevMonthLastDay - i,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      cells.push({
        dateStr: formatDateKey(d),
        dayNum: day,
        isCurrentMonth: true,
      });
    }

    // Next month filler to complete 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(viewYear, viewMonth + 1, i);
      cells.push({
        dateStr: formatDateKey(d),
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return cells;
  };

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4">
      {/* Top row of date selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Prev / Today / Next controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={handlePrevDay}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="Предыдущий день"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedDate === todayKey
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Сегодня
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="Следующий день"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Full Interactive Calendar Popover Trigger */}
          <div className="relative" ref={calendarRef}>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-xs ${
                isCalendarOpen
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-700'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Календарь</span>
            </button>

            {/* Custom Interactive Month Popover Dialog */}
            {isCalendarOpen && (
              <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3.5 animate-in fade-in zoom-in-95 duration-150">
                {/* Popover Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white capitalize">
                    {monthName}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (viewMonth === 0) {
                          setViewMonth(11);
                          setViewYear(viewYear - 1);
                        } else {
                          setViewMonth(viewMonth - 1);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (viewMonth === 11) {
                          setViewMonth(0);
                          setViewYear(viewYear + 1);
                        } else {
                          setViewMonth(viewMonth + 1);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsCalendarOpen(false)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-500 uppercase mb-1">
                  <span>Пн</span>
                  <span>Вт</span>
                  <span>Ср</span>
                  <span>Чт</span>
                  <span>Пт</span>
                  <span>Сб</span>
                  <span>Вс</span>
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                  {getCalendarMonthDays().map((cell) => {
                    const isSelected = cell.dateStr === selectedDate;
                    const isToday = cell.dateStr === todayKey;
                    const hasTasks = tasks.some((t) => t.date === cell.dateStr);

                    return (
                      <button
                        key={cell.dateStr}
                        onClick={() => {
                          onSelectDate(cell.dateStr);
                          setIsCalendarOpen(false);
                        }}
                        className={`relative py-1.5 text-xs font-medium rounded-md transition-colors text-center ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold'
                            : isToday
                            ? 'bg-slate-800 text-blue-400 border border-blue-500/30'
                            : cell.isCurrentMonth
                            ? 'text-slate-200 hover:bg-slate-800'
                            : 'text-slate-600 hover:bg-slate-800/40'
                        }`}
                      >
                        <span>{cell.dayNum}</span>
                        {hasTasks && !isSelected && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Date Full Title */}
        <div className="text-sm font-semibold text-white capitalize flex items-center gap-2">
          <span>
            {currentDate.toLocaleDateString('ru-RU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          {selectedDate === todayKey && (
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
              Сегодня
            </span>
          )}
        </div>
      </div>

      {/* 7-Day Fast Strip with load indicators in Dark Theme */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {daysRange.map((d) => {
          const { minutes, count } = getDateDuration(d.dateStr);
          const hasTasks = count > 0;

          return (
            <button
              key={d.dateStr}
              onClick={() => onSelectDate(d.dateStr)}
              className={`p-2 rounded-lg border text-center transition-all ${
                d.isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div
                className={`text-[11px] font-medium uppercase tracking-wider mb-0.5 ${
                  d.isSelected ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                {getWeekdayName(d.dateObj)}
              </div>
              <div
                className={`text-base font-bold tabular-nums mb-1 font-mono ${
                  d.isSelected ? 'text-white' : 'text-slate-200'
                }`}
              >
                {d.dateObj.getDate()}
              </div>

              {/* Workload badge */}
              <div
                className={`text-[10px] font-mono tabular-nums truncate ${
                  d.isSelected
                    ? 'text-blue-100 font-medium'
                    : hasTasks
                    ? 'text-blue-400 font-medium'
                    : 'text-slate-600'
                }`}
              >
                {hasTasks ? formatDuration(minutes) : '—'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
