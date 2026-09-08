import React, { useState } from 'react';
import { Edit2, Plus, Search, Tag, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FailureCategory } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const MasterCategoryPage: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, currentRole, chrRecords } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FailureCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<FailureCategory | null>(null);

  const [formData, setFormData] = useState<Omit<FailureCategory, 'id'>>({
    name: '',
    description: '',
    defaultPriority: 'MEDIUM',
  });

  const canEdit = ['ADMIN', 'HSE', 'MAINTENANCE'].includes(currentRole);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', defaultPriority: 'MEDIUM' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: FailureCategory) => {
    setEditingCategory(cat);
    setFormData(cat);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCategory) {
      updateCategory({ ...editingCategory, ...formData });
    } else {
      addCategory(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
            SYSTEM TAXONOMY
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Kategori Kerusakan Kendaraan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standarisasi klasifikasi kerusakan sistem kendaraan armada truk gas PT. MAXALMINA
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kategori</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center">
        <div className="w-full max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kategori sistem rem, mesin, kelistrikan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const caseCount = chrRecords.filter((r) => r.kategori === c.name && !r.isDeleted).length;
          return (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600">
                      <Tag className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{c.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {caseCount} Kasus
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{c.description || 'Tidak ada deskripsi.'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Prioritas Default: <strong className="text-slate-700 dark:text-slate-300">{c.defaultPriority || 'MEDIUM'}</strong>
                </span>
                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(c)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingCategory ? 'Edit Kategori Kerusakan' : 'Tambah Kategori Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Deskripsi Sistem & Komponen Terkait</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Prioritas Default</label>
                <select
                  value={formData.defaultPriority}
                  onChange={(e) => setFormData({ ...formData, defaultPriority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-sky-600 text-white rounded-lg font-bold">
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categoryToDelete && (
        <ConfirmModal
          isOpen={true}
          isDanger={true}
          title="Hapus Kategori?"
          message={`Hapus kategori "${categoryToDelete.name}"?`}
          onConfirm={() => deleteCategory(categoryToDelete.id)}
          onCancel={() => setCategoryToDelete(null)}
        />
      )}
    </div>
  );
};
