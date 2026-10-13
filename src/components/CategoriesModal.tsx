import React, { useState } from 'react';
import { CustomCategory } from '../types';
import { X, Plus, Trash2, Tag, Check } from 'lucide-react';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CustomCategory[];
  onSaveCategories: (categories: CustomCategory[]) => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#64748b', // slate
];

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setError(null);

    const id = `cat-${Date.now()}`;
    const updated = [
      ...categories,
      {
        id,
        label: newLabel.trim(),
        color: newColor,
      },
    ];
    onSaveCategories(updated);
    setNewLabel('');
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      setError('Нельзя удалить последнюю категорию');
      return;
    }
    setError(null);
    const updated = categories.filter((c) => c.id !== id);
    onSaveCategories(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              Управление категориями
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Add New Category Form */}
          <form onSubmit={handleAddCategory} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-3">
            {error && (
              <div className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800/50">
                {error}
              </div>
            )}
            <div className="text-xs font-semibold text-slate-300">
              Создать новую категорию:
            </div>
            <div>
              <input
                type="text"
                placeholder="Название (например: Продажи, Разработка, Контент...)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <div className="text-[11px] text-slate-400 mb-1.5">Выберите цвет:</div>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                      newColor === color ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                    }`}
                  >
                    {newColor === color && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newLabel.trim()}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить категорию</span>
            </button>
          </form>

          {/* Existing Categories List */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Текущие категории ({categories.length}):
            </div>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium text-slate-200">{cat.label}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="Удалить категорию"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
