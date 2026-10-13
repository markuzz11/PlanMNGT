import { CRMTask, CRMNote, CustomCategory } from '../types';

const TASKS_KEY = 'plancrm_tasks_v1';
const NOTES_KEY = 'plancrm_notes_v1';
const SCRATCHPAD_KEY = 'plancrm_scratchpad_v1';
const CATEGORIES_KEY = 'plancrm_categories_v1';

export const DEFAULT_CATEGORIES: CustomCategory[] = [
  {
    id: 'clients',
    label: 'Клиенты & Встречи',
    color: '#3b82f6',
  },
  {
    id: 'deepwork',
    label: 'Глубокая работа',
    color: '#10b981',
  },
  {
    id: 'operations',
    label: 'Операционка & Рутина',
    color: '#f59e0b',
  },
  {
    id: 'learning',
    label: 'Развитие & Обучение',
    color: '#8b5cf6',
  },
  {
    id: 'personal',
    label: 'Личные дела',
    color: '#64748b',
  },
];

export function loadCategories(): CustomCategory[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch (e) {
    console.error('Failed to load categories', e);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: CustomCategory[]): void {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export function getCategoryMeta(
  categoryId: string,
  categories: CustomCategory[]
): { label: string; color: string } {
  const found = categories.find((c) => c.id === categoryId);
  if (found) {
    return { label: found.label, color: found.color };
  }
  return { label: categoryId || 'Общее', color: '#64748b' };
}

// Helper to get formatted date string YYYY-MM-DD
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Format duration minutes into Russian display
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 мин';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} ч ${remainingMinutes} мин`;
  }
  if (hours > 0) {
    return `${hours} ч`;
  }
  return `${remainingMinutes} мин`;
}

// Format date into human readable title
export function formatReadableDate(dateStr: string): string {
  try {
    const date = parseDateKey(dateStr);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const date = parseDateKey(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
}

export function getWeekdayName(date: Date): string {
  return date.toLocaleDateString('ru-RU', { weekday: 'short' });
}

// Category meta
export const CATEGORY_CONFIG: Record<
  string, 
  { label: string; color: string; border: string; bg: string; text: string }
> = {
  clients: {
    label: 'Клиенты & Встречи',
    color: '#2563eb',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  deepwork: {
    label: 'Глубокая работа',
    color: '#059669',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  operations: {
    label: 'Операционка & Рутина',
    color: '#d97706',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  learning: {
    label: 'Развитие & Обучение',
    color: '#7c3aed',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
  personal: {
    label: 'Личные дела',
    color: '#475569',
    border: 'border-slate-200',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
  },
};

export const STAGE_CONFIG: Record<
  string, 
  { label: string; badgeBg: string; badgeText: string }
> = {
  planned: {
    label: 'Запланировано',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
  },
  in_progress: {
    label: 'В процессе',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
  },
  completed: {
    label: 'Завершено',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
  },
  deferred: {
    label: 'Отложено',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
  },
};

export const NOTE_TAG_CONFIG: Record<
  string, 
  { label: string; color: string }
> = {
  daily_log: { label: 'Итоги дня', color: 'text-blue-700' },
  meeting: { label: 'Созвон / Встреча', color: 'text-purple-700' },
  idea: { label: 'Идея & Гипотеза', color: 'text-amber-700' },
  todo: { label: 'Чек-лист', color: 'text-emerald-700' },
  general: { label: 'Заметка', color: 'text-slate-700' },
};

// Seed tasks
const INITIALIZED_KEY = 'planmngt_initialized_v2';

// Export seed getters so they can be re-applied on request
export function getInitialSeedTasks(): CRMTask[] {
  const today = formatDateKey(new Date());
  
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = formatDateKey(tomorrowDate);

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateKey(yesterdayDate);

  return [
    {
      id: 'task-1',
      title: 'Демо прототипа CRM для ключевого заказчика',
      date: today,
      time: '10:00',
      durationMinutes: 45,
      category: 'clients',
      stage: 'in_progress',
      priority: 'high',
      clientOrProject: 'ООO «ТехноСфера»',
      notes: 'Показать календарный интерфейс, учет длительности и заметки. Зафиксировать обратную связь по UX.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Фокус: разработка логики расчета загрузки дня',
      date: today,
      time: '11:30',
      durationMinutes: 90,
      category: 'deepwork',
      stage: 'planned',
      priority: 'high',
      clientOrProject: 'Core MVP',
      notes: 'Учесть суммарные минуты дел, процент выполнения от запланированного 8-часового рабочего дня.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Разбор входящей почты и подготовка КП',
      date: today,
      time: '14:30',
      durationMinutes: 45,
      category: 'operations',
      stage: 'planned',
      priority: 'normal',
      clientOrProject: 'Операционный блок',
      notes: 'Ответить на 3 запроса по интеграциям, составить предварительную смету.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Изучение лучших практик B2B планировщиков',
      date: today,
      time: '16:00',
      durationMinutes: 60,
      category: 'learning',
      stage: 'planned',
      priority: 'medium',
      clientOrProject: 'Исследования & Рост',
      notes: 'Анализ паттернов тайм-блокинга в Attio и Linear.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Сверка недельных показателей с партнерами',
      date: tomorrow,
      time: '11:00',
      durationMinutes: 60,
      category: 'clients',
      stage: 'planned',
      priority: 'high',
      clientOrProject: 'Альфа-Партнеры',
      notes: 'Обсудить конверсию лидов в воронке.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'Подготовка отчетности за прошлый спринт',
      date: yesterday,
      time: '15:00',
      durationMinutes: 60,
      category: 'operations',
      stage: 'completed',
      priority: 'normal',
      clientOrProject: 'Внутренний аудит',
      notes: 'Отчет готов и отправлен.',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
  ];
}

export function getInitialSeedNotes(): CRMNote[] {
  const today = formatDateKey(new Date());

  return [
    {
      id: 'note-1',
      title: 'Фокус дня и главные приоритеты',
      content: '1. Сдать чистый MVP планировщика с учетом длительности дел.\n2. Не перегружать интерфейс лишней сложностью.\n3. Сфокусироваться на удобстве ввода времени и связке с заметками.',
      date: today,
      tag: 'daily_log',
      isPinned: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'note-2',
      title: 'Инсайт по учету времени (Time-boxing)',
      content: 'Когда задача ограничена четкой длительностью (например, 45 или 90 минут), прокрастинация снижается на 60%. В CRM-стиле каждое дело воспринимается как обязательство с понятной ценностью.',
      tag: 'idea',
      isPinned: false,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'note-3',
      title: 'Вопросы для встречи с заказчиком',
      content: '• Какой горизонт планирования удобнее: день или неделя?\n• Нужна ли связка дел с суммой сделки?\n• Насколько важен экспорт данных в JSON/Excel?',
      tag: 'meeting',
      isPinned: false,
      updatedAt: new Date().toISOString(),
    },
  ];
}

// LocalStorage loaders
export function loadTasks(): CRMTask[] {
  try {
    const isInitialized = localStorage.getItem(INITIALIZED_KEY);
    const raw = localStorage.getItem(TASKS_KEY);

    if (isInitialized) {
      return raw ? JSON.parse(raw) : [];
    }

    if (!raw) {
      const initial = getInitialSeedTasks();
      saveTasks(initial);
      localStorage.setItem(INITIALIZED_KEY, 'true');
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e);
    return [];
  }
}

export function saveTasks(tasks: CRMTask[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function loadNotes(): CRMNote[] {
  try {
    const isInitialized = localStorage.getItem(INITIALIZED_KEY);
    const raw = localStorage.getItem(NOTES_KEY);

    if (isInitialized) {
      return raw ? JSON.parse(raw) : [];
    }

    if (!raw) {
      const initial = getInitialSeedNotes();
      saveNotes(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load notes from localStorage', e);
    return [];
  }
}

export function saveNotes(notes: CRMNote[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage', e);
  }
}

export function loadScratchpad(): string {
  try {
    const isInitialized = localStorage.getItem(INITIALIZED_KEY);
    const raw = localStorage.getItem(SCRATCHPAD_KEY);
    if (isInitialized) {
      return raw ?? '';
    }
    return raw ?? 'Быстрые мысли, ссылки и заметки на лету...';
  } catch {
    return '';
  }
}

export function saveScratchpad(text: string): void {
  try {
    localStorage.setItem(SCRATCHPAD_KEY, text);
  } catch (e) {
    console.error('Failed to save scratchpad', e);
  }
}

// Clear all data completely (clean slate: 0 tasks, 0 notes)
export function clearAllStorage(): void {
  try {
    saveTasks([]);
    saveNotes([]);
    saveScratchpad('');
    localStorage.setItem(INITIALIZED_KEY, 'true');
  } catch (e) {
    console.error('Failed to clear storage', e);
  }
}

// Restore demo data on demand
export function restoreDemoData(): { tasks: CRMTask[]; notes: CRMNote[]; scratchpad: string } {
  const tasks = getInitialSeedTasks();
  const notes = getInitialSeedNotes();
  const scratchpad = 'Быстрые мысли, ссылки и заметки на лету...';
  saveTasks(tasks);
  saveNotes(notes);
  saveScratchpad(scratchpad);
  localStorage.setItem(INITIALIZED_KEY, 'true');
  return { tasks, notes, scratchpad };
}
