import React, { useState } from 'react';
import { CRMTask, CustomCategory, TaskStage } from '../types';
import { formatDuration, getCategoryMeta, STAGE_CONFIG } from '../utils/storage';
import { Search, Filter, Clock, Edit3, Trash2, CheckCircle2, ArrowUpDown } from 'lucide-react';

interface TaskRegistryProps {
  tasks: CRMTask[];
  categories: CustomCategory[];
  onEditTask: (task: CRMTask) => void;
  onDeleteTask: (taskId: string) => void;
  onStageChange: (taskId: string, stage: TaskStage) => void;
  onSelectDate: (date: string) => void;
}

export const TaskRegistry: React.FC<TaskRegistryProps> = ({
  tasks,
  categories,
  onEditTask,
  onDeleteTask,
  onStageChange,
  onSelectDate,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'duration' | 'title'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter tasks
  const filtered = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.clientOrProject && t.clientOrProject.toLowerCase().includes(search.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesStage = stageFilter === 'all' || t.stage === stageFilter;

    return matchesSearch && matchesCategory && matchesStage;
  });

  // Sort tasks
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
      const comp = a.date.localeCompare(b.date);
      return sortAsc ? comp : -comp;
    }
    if (sortField === 'duration') {
      const comp = (a.durationMinutes || 0) - (b.durationMinutes || 0);
      return sortAsc ? comp : -comp;
    }
    const comp = a.title.localeCompare(b.title);
    return sortAsc ? comp : -comp;
  });

  const toggleSort = (field: 'date' | 'duration' | 'title') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const totalFilteredMinutes = sorted.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
      {/* Header and Filters Bar */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Реестр всех задач и дел ({filtered.length})
            </h3>
            <p className="text-xs text-slate-400">
              Суммарно: <span className="font-mono tabular-nums font-semibold text-blue-400">{formatDuration(totalFilteredMinutes)}</span> запланированного времени
            </p>
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск по названию, клиенту..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Фильтры:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">Все статусы</option>
            <option value="planned">Запланировано</option>
            <option value="in_progress">В процессе</option>
            <option value="completed">Завершено</option>
            <option value="deferred">Отложено</option>
          </select>

          {(categoryFilter !== 'all' || stageFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setStageFilter('all');
                setSearch('');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium ml-2"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      {/* CRM High Density Table in Dark Theme */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
              <th
                onClick={() => toggleSort('date')}
                className="py-2.5 px-4 cursor-pointer hover:text-white whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Дата и время</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('title')}
                className="py-2.5 px-4 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Дело / Задача</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-4 whitespace-nowrap">Клиент / Проект</th>
              <th className="py-2.5 px-4 whitespace-nowrap">Категория</th>
              <th
                onClick={() => toggleSort('duration')}
                className="py-2.5 px-4 cursor-pointer hover:text-white text-right whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Длительность</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-4 whitespace-nowrap">Стадия</th>
              <th className="py-2.5 px-4 text-right whitespace-nowrap">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {sorted.length > 0 ? (
              sorted.map((task) => {
                const catMeta = getCategoryMeta(task.category, categories);
                const stage = STAGE_CONFIG[task.stage] || STAGE_CONFIG.planned;
                const isDone = task.stage === 'completed';

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-800/40 transition-colors group h-11"
                  >
                    {/* Date & Time */}
                    <td className="py-2.5 px-4 whitespace-nowrap font-mono tabular-nums">
                      <button
                        onClick={() => onSelectDate(task.date)}
                        className="text-slate-200 hover:text-blue-400 font-medium hover:underline"
                        title="Перейти к этому дню"
                      >
                        {task.date}
                      </button>
                      {task.time ? (
                        <span className="text-slate-400 ml-1.5">
                          {task.time}
                        </span>
                      ) : (
                        <span className="text-slate-600 ml-1.5 text-[10px]">
                          (без времени)
                        </span>
                      )}
                    </td>

                    {/* Title */}
                    <td className="py-2.5 px-4">
                      <div
                        className="font-semibold text-white group-hover:text-blue-400 cursor-pointer"
                        onClick={() => onEditTask(task)}
                      >
                        <span className={isDone ? 'line-through text-slate-500' : ''}>
                          {task.title}
                        </span>
                      </div>
                      {task.notes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5 font-normal">
                          {task.notes}
                        </div>
                      )}
                    </td>

                    {/* Client / Project */}
                    <td className="py-2.5 px-4 whitespace-nowrap text-slate-400">
                      {task.clientOrProject || '—'}
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: catMeta.color }} />
                        <span>{catMeta.label}</span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-200 whitespace-nowrap">
                      {formatDuration(task.durationMinutes)}
                    </td>

                    {/* Stage */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        task.stage === 'completed'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : task.stage === 'in_progress'
                          ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {stage.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onStageChange(task.id, isDone ? 'planned' : 'completed')}
                          className={`p-1 rounded ${
                            isDone ? 'text-emerald-400 hover:text-slate-400' : 'text-slate-400 hover:text-emerald-400'
                          }`}
                          title={isDone ? 'Вернуть' : 'Завершить'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1 text-slate-400 hover:text-white rounded"
                          title="Редактировать"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                  Нет задач по заданным критериям фильтрации
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
