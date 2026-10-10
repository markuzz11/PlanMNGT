import React from 'react';
import { CRMTask, CustomCategory } from '../types';
import { formatDuration, getCategoryMeta } from '../utils/storage';

interface TimeBudgetCardProps {
  tasks: CRMTask[];
  categories: CustomCategory[];
  targetWorkHours?: number; // default 8h
}

export const TimeBudgetCard: React.FC<TimeBudgetCardProps> = ({
  tasks,
  categories,
  targetWorkHours = 8,
}) => {
  const targetMinutes = targetWorkHours * 60;

  const totalMinutes = tasks.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
  const completedMinutes = tasks
    .filter((t) => t.stage === 'completed')
    .reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
  const inProgressMinutes = tasks
    .filter((t) => t.stage === 'in_progress')
    .reduce((acc, t) => acc + (t.durationMinutes || 0), 0);

  const percentCompleted = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;
  const remainingFreeMinutes = Math.max(0, targetMinutes - totalMinutes);

  // Group by category
  const categoryStats: Record<string, number> = {};
  tasks.forEach((t) => {
    categoryStats[t.category] = (categoryStats[t.category] || 0) + (t.durationMinutes || 0);
  });

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm">
      {/* Top summary row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Баланс времени дня
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-white font-mono tabular-nums">
              {formatDuration(totalMinutes)}
            </span>
            <span className="text-xs text-slate-400">
              запланировано из <span className="font-mono tabular-nums font-semibold text-slate-200">{targetWorkHours} ч</span> бюджета
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
          <div className="text-right">
            <div className="text-slate-400 font-sans text-[11px]">Выполнено</div>
            <div className="font-semibold text-emerald-400">
              {formatDuration(completedMinutes)} ({percentCompleted}%)
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-right">
            <div className="text-slate-400 font-sans text-[11px]">Свободно</div>
            <div className="font-semibold text-slate-300">
              {formatDuration(remainingFreeMinutes)}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Capacity Bar */}
      <div className="mb-3">
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${totalMinutes > 0 ? (completedMinutes / targetMinutes) * 100 : 0}%` }}
            title={`Выполнено: ${formatDuration(completedMinutes)}`}
          />
          <div
            className="bg-blue-500 transition-all duration-300"
            style={{ width: `${totalMinutes > 0 ? (inProgressMinutes / targetMinutes) * 100 : 0}%` }}
            title={`В процессе: ${formatDuration(inProgressMinutes)}`}
          />
          <div
            className="bg-slate-700 transition-all duration-300"
            style={{
              width: `${
                totalMinutes > 0
                  ? ((totalMinutes - completedMinutes - inProgressMinutes) / targetMinutes) * 100
                  : 0
              }%`,
            }}
            title={`В плане: ${formatDuration(totalMinutes - completedMinutes - inProgressMinutes)}`}
          />
        </div>
      </div>

      {/* Category distribution badges */}
      {Object.keys(categoryStats).length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Распределение:</span>
          {Object.entries(categoryStats).map(([catKey, minutes]) => {
            const meta = getCategoryMeta(catKey, categories);
            return (
              <div
                key={catKey}
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <span>{meta.label}</span>
                <span className="font-mono tabular-nums font-semibold text-white ml-0.5">
                  {formatDuration(minutes)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-slate-500 italic pt-1">
          Нет запланированных дел на эту дату. Нажмите «+ Запланировать дело».
        </div>
      )}
    </div>
  );
};
