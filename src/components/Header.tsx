import React from 'react';
import { Plus, Tag, Download, RotateCcw } from 'lucide-react';

export type ActiveTab = 'pipeline' | 'all_tasks' | 'notes';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewTaskModal: () => void;
  onOpenCategoriesModal: () => void;
  onExportData: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTaskModal,
  onOpenCategoriesModal,
  onExportData,
  onResetData,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            P
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            PlanMNGT
          </span>
        </div>

        {/* Zone 2: Concise single-line nav links (NO timeline tab as requested) */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
          <button
            onClick={() => onTabChange('pipeline')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'pipeline'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Пайплайн дня
          </button>
          <button
            onClick={() => onTabChange('all_tasks')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'all_tasks'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Реестр задач
          </button>
          <button
            onClick={() => onTabChange('notes')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'notes'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Рабочие заметки
          </button>
        </nav>

        {/* Zone 3: Categories Manager & Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenCategoriesModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/80 transition-colors whitespace-nowrap"
            title="Управление категориями"
          >
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Категории</span>
          </button>

          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Запланировать дело</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-1.5 border-t border-slate-800 bg-slate-950 text-xs font-medium">
        <button
          onClick={() => onTabChange('pipeline')}
          className={`py-1.5 px-3 rounded-md ${activeTab === 'pipeline' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
        >
          Пайплайн
        </button>
        <button
          onClick={() => onTabChange('all_tasks')}
          className={`py-1.5 px-3 rounded-md ${activeTab === 'all_tasks' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
        >
          Реестр
        </button>
        <button
          onClick={() => onTabChange('notes')}
          className={`py-1.5 px-3 rounded-md ${activeTab === 'notes' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
        >
          Заметки
        </button>
      </div>
    </header>
  );
};
