import React, { useState } from 'react';
import { Edit2, Plus, Search, Trash2, UserCheck, Wrench, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Mechanic } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const MasterMechanicPage: React.FC = () => {
  const { mechanics, addMechanic, updateMechanic, deleteMechanic, currentRole, chrRecords } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<Mechanic | null>(null);
  const [mechanicToDelete, setMechanicToDelete] = useState<Mechanic | null>(null);

  const [formData, setFormData] = useState<Omit<Mechanic, 'id'>>({
    name: '',
    phone: '',
    specialization: 'Sistem Rem & Pneumatik',
    plant: 'Plant Cilegon',
    status: 'ACTIVE',
  });

  const canEdit = ['ADMIN', 'MAINTENANCE'].includes(currentRole);

  const filtered = mechanics.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.specialization.toLowerCase().includes(search.toLowerCase()) ||
      m.plant.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingMechanic(null);
    setFormData({
      name: '',
      phone: '',
      specialization: 'Sistem Rem & Pneumatik',
      plant: 'Plant Cilegon',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Mechanic) => {
    setEditingMechanic(m);
    setFormData(m);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingMechanic) {
      updateMechanic({ ...editingMechanic, ...formData });
    } else {
      addMechanic(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            TECHNICAL ROSTER
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Master Data Teknisi & Mekanik
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data teknisi bengkel resmi armada gas PT. MAXALMINA beserta bidang spesialisasi
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Mekanik</span>
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
            placeholder="Cari mekanik, spesialisasi rem, mesin, plant..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Nama Mekanik</th>
                <th className="p-3.5">Spesialisasi Teknis</th>
                <th className="p-3.5">Plant Pangkalan</th>
                <th className="p-3.5">Kontak</th>
                <th className="p-3.5">Beban Tugas (Kasus)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((m) => {
                const taskCount = chrRecords.filter((r) => r.mekanik === m.name && !r.isDeleted).length;
                return (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-500" />
                      <span>{m.name}</span>
                    </td>
                    <td className="p-3.5 text-indigo-600 dark:text-indigo-400 font-semibold">{m.specialization}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">{m.plant}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{m.phone || '-'}</td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{taskCount} pekerjaan</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {canEdit && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setMechanicToDelete(m)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingMechanic ? 'Edit Data Mekanik' : 'Tambah Mekanik Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Bidang Spesialisasi Teknis</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Plant Pangkalan</label>
                <input
                  type="text"
                  value={formData.plant}
                  onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Kontak Telepon</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
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
                  Simpan Mekanik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mechanicToDelete && (
        <ConfirmModal
          isOpen={true}
          isDanger={true}
          title="Hapus Mekanik?"
          message={`Hapus data teknisi ${mechanicToDelete.name}?`}
          onConfirm={() => deleteMechanic(mechanicToDelete.id)}
          onCancel={() => setMechanicToDelete(null)}
        />
      )}
    </div>
  );
};
