import React, { useState, useEffect } from 'react';
import { CRMTask, CustomCategory, TaskPriority, TaskStage } from '../types';
import { formatDuration } from '../utils/storage';
import { X, Clock, Plus, Check } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<CRMTask, 'id' | 'createdAt'> & { id?: string }) => void;
  initialTask?: CRMTask | null;
  defaultDate: string;
  presetTime?: string;
  categories: CustomCategory[];
  onAddCategory: (category: CustomCategory) => void;
}

const DURATION_PRESETS = [
  { label: '15 мин', value: 15 },
  { label: '30 мин', value: 30 },
  { label: '45 мин', value: 45 },
  { label: '1 час', value: 60 },
  { label: '1.5 ч', value: 90 },
  { label: '2 часа', value: 120 },
  { label: '3 часа', value: 180 },
  { label: '4 часа', value: 240 },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultDate,
  presetTime,
  categories,
  onAddCategory,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(''); // Default is EMPTY as requested!
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [category, setCategory] = useState<string>(categories[0]?.id || 'clients');
  const [stage, setStage] = useState<TaskStage>('planned');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [clientOrProject, setClientOrProject] = useState('');
  const [notes, setNotes] = useState('');

  // Inline custom category creation
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDate(initialTask.date);
      setTime(initialTask.time || '');
      setDurationMinutes(initialTask.durationMinutes || 60);
      setCategory(initialTask.category);
      setStage(initialTask.stage);
      setPriority(initialTask.priority);
      setClientOrProject(initialTask.clientOrProject || '');
      setNotes(initialTask.notes || '');
    } else {
      setTitle('');
      setDate(defaultDate);
      setTime(presetTime || ''); // By default NO TIME is set!
      setDurationMinutes(45);
      setCategory(categories[0]?.id || 'clients');
      setStage('planned');
      setPriority('normal');
      setClientOrProject('');
      setNotes('');
    }
    setIsCreatingCategory(false);
  }, [initialTask, defaultDate, presetTime, isOpen, categories]);

  if (!isOpen) return null;

  const handleCreateNewCategoryInline = () => {
    if (!newCatLabel.trim()) return;
    const newCat: CustomCategory = {
      id: `cat-${Date.now()}`,
      label: newCatLabel.trim(),
      color: newCatColor,
    };
    onAddCategory(newCat);
    setCategory(newCat.id);
    setNewCatLabel('');
    setIsCreatingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      date,
      time: time.trim() ? time.trim() : undefined,
      durationMinutes: Math.max(5, durationMinutes),
      category: category || categories[0]?.id || 'general',
      stage,
      priority,
      clientOrProject: clientOrProject.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">
              {initialTask ? 'Редактирование дела' : 'Новое дело в план'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Укажите дату, запланированную длительность и категорию
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Название дела или задачи <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Например: Созвон по условиям договора или Разработка фичи"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Date and Time Row (Default time is empty!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Дата выполнения
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Время начала (необязательно)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Не указано"
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* DURATION SELECTOR */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Длительность занятия этим делом
              </label>
              <span className="text-xs font-mono font-medium text-blue-400 tabular-nums">
                Итого: {formatDuration(durationMinutes)}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mb-2.5">
              {DURATION_PRESETS.map((preset) => {
                const isSelected = durationMinutes === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setDurationMinutes(preset.value)}
                    className={`py-1.5 px-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap text-center ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 font-bold'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Minutes Input Slider / Field */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="360"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="flex-1 accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min="5"
                  max="720"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs text-center font-mono font-medium border border-slate-700 rounded bg-slate-900 text-white tabular-nums"
                />
                <span className="text-xs text-slate-400">мин</span>
              </div>
            </div>
          </div>

          {/* Category selection & user-creation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Категория
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{isCreatingCategory ? 'Отмена' : '+ Своя категория'}</span>
              </button>
            </div>

            {isCreatingCategory ? (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 mb-2">
                <div className="text-xs font-medium text-slate-400">Новая категория:</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Название категории"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 text-white rounded"
                  />
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-slate-900 p-0.5"
                    title="Цвет"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewCategoryInline}
                    disabled={!newCatLabel.trim()}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50"
                  >
                    Добавить
                  </button>
                </div>
              </div>
            ) : null}

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Статус
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as TaskStage)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors"
              >
                <option value="planned">Запланировано</option>
                <option value="in_progress">В процессе</option>
                <option value="completed">Завершено</option>
                <option value="deferred">Отложено</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Приоритет
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors"
              >
                <option value="high">Высокий (Срочно)</option>
                <option value="medium">Средний приоритет</option>
                <option value="normal">Обычный приоритет</option>
              </select>
            </div>
          </div>

          {/* Client / Project */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Клиент / Проект / Контекст (необязательно)
            </label>
            <input
              type="text"
              placeholder="Например: ПАО Сбербанк или Проект Альфа"
              value={clientOrProject}
              onChange={(e) => setClientOrProject(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Заметки и детали
            </label>
            <textarea
              rows={3}
              placeholder="Ключевые пункты, ссылка на документы, результат встречи..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 bg-slate-800 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
            >
              {initialTask ? 'Сохранить изменения' : 'Запланировать дело'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
