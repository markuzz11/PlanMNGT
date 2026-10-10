import React, { useState, useEffect } from 'react';
import { CRMNote, NoteTag } from '../types';
import { NOTE_TAG_CONFIG } from '../utils/storage';
import { FileText, Plus, Pin, Trash2, Edit3, Check, Copy, Tag, Calendar, X } from 'lucide-react';

interface NotesSectionProps {
  notes: CRMNote[];
  onSaveNote: (note: CRMNote) => void;
  onDeleteNote: (noteId: string) => void;
  scratchpad: string;
  onSaveScratchpad: (text: string) => void;
  selectedDate: string;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  scratchpad,
  onSaveScratchpad,
  selectedDate,
}) => {
  const [scratchpadText, setScratchpadText] = useState(scratchpad);
  const [activeFilter, setActiveFilter] = useState<'all' | 'date_only' | NoteTag>('all');
  
  // Note Modal / Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState<NoteTag>('general');
  const [linkToDate, setLinkToDate] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setScratchpadText(scratchpad);
  }, [scratchpad]);

  const handleScratchpadBlur = () => {
    onSaveScratchpad(scratchpadText);
  };

  const handleOpenNewNote = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTag('general');
    setLinkToDate(true);
    setIsEditing(true);
  };

  const handleOpenEditNote = (note: CRMNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTag(note.tag);
    setLinkToDate(Boolean(note.date));
    setIsEditing(true);
  };

  const handleSaveNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const newNote: CRMNote = {
      id: editingNoteId || `note-${Date.now()}`,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      tag: noteTag,
      date: linkToDate ? selectedDate : undefined,
      isPinned: false,
      updatedAt: new Date().toISOString(),
    };

    onSaveNote(newNote);
    setIsEditing(false);
  };

  const handleTogglePin = (note: CRMNote) => {
    onSaveNote({
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (activeFilter === 'date_only') {
      return n.date === selectedDate;
    }
    if (activeFilter === 'all') {
      return true;
    }
    return n.tag === activeFilter;
  });

  // Sort: pinned first, then by date/updatedAt
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-5">
      {/* Scratchpad with no templates (templates removed as requested) */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Быстрый блокнот (Scratchpad)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Автосохранение в реальном времени
          </span>
        </div>

        <textarea
          rows={3}
          value={scratchpadText}
          onChange={(e) => {
            setScratchpadText(e.target.value);
            onSaveScratchpad(e.target.value);
          }}
          onBlur={handleScratchpadBlur}
          placeholder="Любые мысли на лету, ссылки, телефонные номера или списки..."
          className="w-full text-xs font-mono p-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors leading-relaxed resize-y"
        />
      </div>

      {/* Structured Notes Header & Filters */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">
              База рабочих заметок ({notes.length})
            </h3>
            <p className="text-xs text-slate-400">
              Личные заметки, встречи и записи по выбранным датам
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewNote}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Новая заметка</span>
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Все заметки
          </button>
          <button
            onClick={() => setActiveFilter('date_only')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              activeFilter === 'date_only'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            К текущей дате ({selectedDate})
          </button>
          <button
            onClick={() => setActiveFilter('meeting')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              activeFilter === 'meeting'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Встречи
          </button>
          <button
            onClick={() => setActiveFilter('daily_log')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              activeFilter === 'daily_log'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Итоги дня
          </button>
          <button
            onClick={() => setActiveFilter('idea')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              activeFilter === 'idea'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Идеи
          </button>
        </div>

        {/* Notes Grid */}
        {sortedNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedNotes.map((note) => {
              const tagConfig = NOTE_TAG_CONFIG[note.tag] || NOTE_TAG_CONFIG.general;

              return (
                <div
                  key={note.id}
                  className={`group relative bg-slate-950 border rounded-xl p-4 transition-all hover:border-slate-700 flex flex-col justify-between ${
                    note.isPinned
                      ? 'border-amber-500/40 bg-amber-950/10 shadow-xs'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    {/* Note Card Header */}
                    <div className="flex items-center justify-between gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="font-semibold text-blue-400">
                          {tagConfig.label}
                        </span>
                        {note.date && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span className="font-mono tabular-nums text-slate-300">
                              {note.date}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(note)}
                          className={`p-1 rounded transition-colors ${
                            note.isPinned
                              ? 'text-amber-400 hover:text-amber-300'
                              : 'text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100'
                          }`}
                          title={note.isPinned ? 'Открепить' : 'Закрепить наверху'}
                        >
                          <Pin className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => handleOpenEditNote(note)}
                          className="p-1 text-slate-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Редактировать"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Note Title */}
                    <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                      {note.title}
                    </h4>

                    {/* Content Preview */}
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed mb-4 line-clamp-6">
                      {note.content}
                    </p>
                  </div>

                  {/* Note Footer */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono tabular-nums">
                      {new Date(note.updatedAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <button
                      onClick={() => handleCopy(note.id, `${note.title}\n\n${note.content}`)}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                      title="Скопировать текст"
                    >
                      {copiedId === note.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Копировать</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300 mb-1">
              Нет заметок
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Нажмите кнопку «Новая заметка», чтобы сохранить важную информацию
            </p>
            <button
              onClick={handleOpenNewNote}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Создать заметку
            </button>
          </div>
        )}
      </div>

      {/* Edit / Create Note Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">
                {editingNoteId ? 'Редактировать заметку' : 'Создать заметку'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNoteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Заголовок заметки
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: План звонка, Заметка по проекту..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Тег заметки
                  </label>
                  <select
                    value={noteTag}
                    onChange={(e) => setNoteTag(e.target.value as NoteTag)}
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors"
                  >
                    {Object.entries(NOTE_TAG_CONFIG).map(([k, cfg]) => (
                      <option key={k} value={k}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={linkToDate}
                      onChange={(e) => setLinkToDate(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Привязать к дате ({selectedDate})</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Текст заметки
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Содержимое заметки..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500 transition-colors font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 bg-slate-800 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
