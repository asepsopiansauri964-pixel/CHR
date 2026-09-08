import React, { useState } from 'react';
import { Edit2, Plus, Search, Trash2, User, Users, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Driver } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const MasterDriverPage: React.FC = () => {
  const { drivers, addDriver, updateDriver, deleteDriver, currentRole } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  const [formData, setFormData] = useState<Omit<Driver, 'id'>>({
    name: '',
    phone: '',
    simType: 'SIM B2 Umum',
    plant: 'Plant Cilegon',
    status: 'ACTIVE',
  });

  const canEdit = ['ADMIN', 'HSE', 'DISPATCHER'].includes(currentRole);

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone?.toLowerCase().includes(search.toLowerCase()) ||
      d.plant?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      phone: '',
      simType: 'SIM B2 Umum',
      plant: 'Plant Cilegon',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData(driver);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingDriver) {
      updateDriver({ ...editingDriver, ...formData });
    } else {
      addDriver(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
            DRIVER ROSTER
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Master Data Driver Armada
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data pengemudi trailer gas PT. MAXALMINA dengan sertifikasi SIM B2 Umum & Gas B3
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Driver</span>
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
            placeholder="Cari nama pengemudi, nomor kontak, plant..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Nama Driver</th>
                <th className="p-3.5">Nomor Telepon</th>
                <th className="p-3.5">Lisensi / SIM</th>
                <th className="p-3.5">Plant Pangkalan</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{d.name}</span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{d.phone || '-'}</td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">{d.simType}</td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300">{d.plant}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    {canEdit && (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDriverToDelete(d)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingDriver ? 'Edit Driver' : 'Tambah Driver Baru'}
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
                <label className="block font-semibold mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Jenis SIM & Sertifikasi</label>
                <input
                  type="text"
                  value={formData.simType}
                  onChange={(e) => setFormData({ ...formData, simType: e.target.value })}
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
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600"
                >
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 bg-sky-600 text-white rounded-lg font-bold">
                  Simpan Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {driverToDelete && (
        <ConfirmModal
          isOpen={true}
          isDanger={true}
          title="Hapus Driver?"
          message={`Hapus data driver ${driverToDelete.name}?`}
          onConfirm={() => deleteDriver(driverToDelete.id)}
          onCancel={() => setDriverToDelete(null)}
        />
      )}
    </div>
  );
};
