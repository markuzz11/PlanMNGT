import React from 'react';
import { CRMTask, CustomCategory, TaskStage } from '../types';
import { TaskCard } from './TaskCard';
import { formatDuration } from '../utils/storage';
import { Plus, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

interface KanbanBoardProps {
  tasks: CRMTask[];
  categories: CustomCategory[];
  onEditTask: (task: CRMTask) => void;
  onDeleteTask: (taskId: string) => void;
  onStageChange: (taskId: string, stage: TaskStage) => void;
  onAddNewTask: (stage?: TaskStage) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  categories,
  onEditTask,
  onDeleteTask,
  onStageChange,
  onAddNewTask,
}) => {
  const columns: { stage: TaskStage; title: string; icon: React.ReactNode; accent: string }[] = [
    {
      stage: 'planned',
      title: 'К выполнению',
      icon: <Clock className="w-4 h-4 text-slate-400" />,
      accent: 'border-slate-700',
    },
    {
      stage: 'in_progress',
      title: 'В процессе',
      icon: <PlayCircle className="w-4 h-4 text-blue-400" />,
      accent: 'border-blue-500/50',
    },
    {
      stage: 'completed',
      title: 'Завершено',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      accent: 'border-emerald-500/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.stage === col.stage);
        const colMinutes = colTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);

        return (
          <div
            key={col.stage}
            className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex flex-col min-h-[460px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between gap-2 px-1 mb-3">
              <div className="flex items-center gap-2">
                {col.icon}
                <h3 className="text-xs font-bold text-slate-200 tracking-wide">
                  {col.title}
                </h3>
                <span className="text-xs font-mono tabular-nums text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  {colTasks.length}
                </span>
              </div>

              <div className="text-xs font-mono tabular-nums text-slate-400">
                {formatDuration(colMinutes)}
              </div>
            </div>

            {/* Quick Add Button inside column */}
            {col.stage === 'planned' && (
              <button
                onClick={() => onAddNewTask('planned')}
                className="mb-3 w-full py-2 px-3 border border-dashed border-slate-700 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-800/50 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Добавить дело в этот день</span>
              </button>
            )}

            {/* Task list in column */}
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {colTasks.length > 0 ? (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    categories={categories}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStageChange={onStageChange}
                  />
                ))
              ) : (
                <div className="h-28 flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-lg p-4 text-center">
                  <span>Нет дел в этой колонке</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
