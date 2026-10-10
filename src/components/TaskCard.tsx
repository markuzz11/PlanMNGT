import React from 'react';
import { CRMTask, CustomCategory } from '../types';
import { formatDuration, getCategoryMeta, STAGE_CONFIG } from '../utils/storage';
import { Clock, CheckCircle2, PlayCircle, Briefcase, Trash2, Edit3 } from 'lucide-react';

interface TaskCardProps {
  task: CRMTask;
  categories: CustomCategory[];
  onEdit: (task: CRMTask) => void;
  onDelete: (taskId: string) => void;
  onStageChange: (taskId: string, newStage: CRMTask['stage']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  categories,
  onEdit,
  onDelete,
  onStageChange,
}) => {
  const categoryMeta = getCategoryMeta(task.category, categories);
  const isCompleted = task.stage === 'completed';
  const isInProgress = task.stage === 'in_progress';

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-150 p-3.5 ${
        isCompleted
          ? 'border-slate-800/80 bg-slate-950/50 opacity-70'
          : isInProgress
          ? 'border-blue-500/40 bg-blue-950/20 shadow-xs'
          : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:shadow-md'
      }`}
    >
      {/* Top row: Category, Priority, and Quick Actions */}
      <div className="flex items-center justify-between gap-2 text-xs mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: categoryMeta.color }}
          />
          <span className="font-semibold text-slate-300 truncate">
            {categoryMeta.label}
          </span>
          {task.priority === 'high' && (
            <>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-rose-400 font-medium shrink-0">Срочно</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            title="Редактировать"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            title="Удалить дело"
            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h4
        onClick={() => onEdit(task)}
        className={`text-sm font-semibold text-white cursor-pointer hover:text-blue-400 leading-snug mb-2 ${
          isCompleted ? 'line-through text-slate-500' : ''
        }`}
      >
        {task.title}
      </h4>

      {/* Client / Project info if available */}
      {task.clientOrProject && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{task.clientOrProject}</span>
        </div>
      )}

      {/* Notes preview if any */}
      {task.notes && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 font-normal leading-relaxed">
          {task.notes}
        </p>
      )}

      {/* Bottom Meta Row: Time & Duration + Stage Quick Action */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300 tabular-nums font-mono">
          {task.time ? (
            <span className="font-semibold text-slate-200">
              {task.time}
            </span>
          ) : (
            <span className="text-slate-500 font-sans text-[11px]">
              без времени
            </span>
          )}
          <span className="text-slate-700 font-sans" aria-hidden="true">/</span>
          <div className="flex items-center gap-1 text-blue-400 font-medium">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{formatDuration(task.durationMinutes)}</span>
          </div>
        </div>

        {/* Stage quick toggles */}
        <div className="flex items-center gap-1">
          {task.stage !== 'in_progress' && !isCompleted && (
            <button
              onClick={() => onStageChange(task.id, 'in_progress')}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-400 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/50 rounded transition-colors whitespace-nowrap"
              title="Перевести в работу"
            >
              <PlayCircle className="w-3 h-3" />
              <span>В работу</span>
            </button>
          )}

          {!isCompleted && (
            <button
              onClick={() => onStageChange(task.id, 'completed')}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/50 rounded transition-colors whitespace-nowrap"
              title="Отметить выполненным"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Готово</span>
            </button>
          )}

          {isCompleted && (
            <button
              onClick={() => onStageChange(task.id, 'planned')}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-slate-400 bg-slate-800 hover:text-white rounded transition-colors whitespace-nowrap"
              title="Вернуть в план"
            >
              <span>Вернуть в план</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
