/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CRMTask, CRMNote, CustomCategory, TaskStage } from './types';
import {
  loadTasks,
  saveTasks,
  loadNotes,
  saveNotes,
  loadScratchpad,
  saveScratchpad,
  loadCategories,
  saveCategories,
  formatDateKey,
} from './utils/storage';
import { Header, ActiveTab } from './components/Header';
import { DateSelector } from './components/DateSelector';
import { TimeBudgetCard } from './components/TimeBudgetCard';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskRegistry } from './components/TaskRegistry';
import { NotesSection } from './components/NotesSection';
import { TaskModal } from './components/TaskModal';
import { CategoriesModal } from './components/CategoriesModal';
import { Plus, Check, Download, RotateCcw } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [notes, setNotes] = useState<CRMNote[]>([]);
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [scratchpad, setScratchpad] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey(new Date()));
  const [activeTab, setActiveTab] = useState<ActiveTab>('pipeline');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CRMTask | null>(null);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  // Status feedback toast
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2800);
  };

  // Initial Load from LocalStorage
  useEffect(() => {
    const initialTasks = loadTasks();
    const initialNotes = loadNotes();
    const initialCategories = loadCategories();
    const initialScratchpad = loadScratchpad();

    setTasks(initialTasks);
    setNotes(initialNotes);
    setCategories(initialCategories);
    setScratchpad(initialScratchpad);
  }, []);

  // Sync tasks when updated
  const updateTasksState = (newTasks: CRMTask[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  // Sync notes when updated
  const updateNotesState = (newNotes: CRMNote[]) => {
    setNotes(newNotes);
    saveNotes(newNotes);
  };

  // Sync categories when updated
  const updateCategoriesState = (newCategories: CustomCategory[]) => {
    setCategories(newCategories);
    saveCategories(newCategories);
  };

  // Handler: Save Task (Create or Update)
  const handleSaveTask = (taskData: Omit<CRMTask, 'id' | 'createdAt'> & { id?: string }) => {
    if (taskData.id) {
      // Edit existing
      const updated = tasks.map((t) =>
        t.id === taskData.id
          ? {
              ...t,
              ...taskData,
              completedAt: taskData.stage === 'completed' ? (t.completedAt || new Date().toISOString()) : undefined,
            }
          : t
      );
      updateTasksState(updated);
      showToast('Дело обновлено');
    } else {
      // Create new
      const newTask: CRMTask = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        completedAt: taskData.stage === 'completed' ? new Date().toISOString() : undefined,
      };
      updateTasksState([newTask, ...tasks]);
      showToast('Дело успешно добавлено в план');
    }
  };

  // Handler: Delete Task
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    updateTasksState(updated);
    showToast('Дело удалено');
  };

  // Handler: Change Stage
  const handleStageChange = (taskId: string, newStage: TaskStage) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          stage: newStage,
          completedAt: newStage === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    updateTasksState(updated);
    showToast(newStage === 'completed' ? 'Дело выполнено!' : 'Статус обновлен');
  };

  // Handler: Add Category directly
  const handleAddCategory = (newCat: CustomCategory) => {
    const updated = [...categories, newCat];
    updateCategoriesState(updated);
    showToast(`Категория «${newCat.label}» создана`);
  };

  // Handler: Save Note
  const handleSaveNote = (noteToSave: CRMNote) => {
    const exists = notes.some((n) => n.id === noteToSave.id);
    let updated: CRMNote[];
    if (exists) {
      updated = notes.map((n) => (n.id === noteToSave.id ? noteToSave : n));
    } else {
      updated = [noteToSave, ...notes];
    }
    updateNotesState(updated);
    showToast('Заметка сохранена');
  };

  // Handler: Delete Note
  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    updateNotesState(updated);
    showToast('Заметка удалена');
  };

  // Handler: Save Scratchpad
  const handleSaveScratchpad = (text: string) => {
    setScratchpad(text);
    saveScratchpad(text);
  };

  // Quick Open Modal
  const handleOpenNewTask = (stage: TaskStage = 'planned') => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: CRMTask) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Export Data to JSON
  const handleExportData = () => {
    const data = {
      tasks,
      notes,
      categories,
      scratchpad,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planmngt-backup-${formatDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Резервная копия сохранена в файл');
  };

  // Reset to default seed
  const handleResetData = () => {
    if (confirm('Сбросить данные к начальному демо-набору? Текущие данные будут заменены.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Tasks for the currently selected date
  const dayTasks = tasks.filter((t) => t.date === selectedDate);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Header (dark CRM theme, no timeline tab) */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewTaskModal={() => handleOpenNewTask('planned')}
        onOpenCategoriesModal={() => setIsCategoriesModalOpen(true)}
        onExportData={handleExportData}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-16">
        {/* Pipeline Tab (Primary Day View) */}
        {activeTab === 'pipeline' && (
          <div>
            <DateSelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              tasks={tasks}
            />

            <div className="px-4 sm:px-6 pt-5">
              <TimeBudgetCard tasks={dayTasks} categories={categories} />
            </div>

            {/* Quick Action Sub-bar */}
            <div className="px-4 sm:px-6 pt-5 pb-2 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Пайплайн задач дня ({dayTasks.length})
              </div>

              <button
                onClick={() => handleOpenNewTask('planned')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Добавить дело на этот день</span>
              </button>
            </div>

            {/* Day Kanban Board */}
            <div className="px-4 sm:px-6 pt-3">
              <KanbanBoard
                tasks={dayTasks}
                categories={categories}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onStageChange={handleStageChange}
                onAddNewTask={(stage) => handleOpenNewTask(stage)}
              />
            </div>
          </div>
        )}

        {/* All Tasks Tab (Registry) */}
        {activeTab === 'all_tasks' && (
          <div className="px-4 sm:px-6 pt-6">
            <TaskRegistry
              tasks={tasks}
              categories={categories}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStageChange={handleStageChange}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setActiveTab('pipeline');
              }}
            />
          </div>
        )}

        {/* Notes Tab (Clean scratchpad + notes list without templates) */}
        {activeTab === 'notes' && (
          <div className="px-4 sm:px-6 pt-6">
            <NotesSection
              notes={notes}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              scratchpad={scratchpad}
              onSaveScratchpad={handleSaveScratchpad}
              selectedDate={selectedDate}
            />
          </div>
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultDate={selectedDate}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      {/* Categories Manager Modal */}
      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        onSaveCategories={updateCategoriesState}
      />

      {/* Toast feedback */}
      {feedbackToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg shadow-2xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Sub-Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-auto py-3 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span>PlanMNGT · Темная тема · Локальное хранилище</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono tabular-nums">{tasks.length} дел</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono tabular-nums">{categories.length} категорий</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono tabular-nums">{notes.length} заметок</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              title="Скачать резервную копию JSON"
            >
              <Download className="w-3 h-3" />
              <span>Экспорт JSON</span>
            </button>
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors"
              title="Сбросить демо-данные"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сброс данных</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
