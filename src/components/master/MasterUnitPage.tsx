import React, { useState } from 'react';
import { Edit2, History, Plus, Search, Trash2, Truck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Unit } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

export const MasterUnitPage: React.FC = () => {
  const { units, addUnit, updateUnit, deleteUnit, currentRole, setSelectedUnitForDetail } = useApp();

  const [search, setSearch] = useState('');
  const [plantFilter, setPlantFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState<Omit<Unit, 'id'>>({
    nomorPolisi: '',
    jenisKendaraan: 'Trailer Gas Transport',
    merk: 'Mitsubishi Fuso',
    tahun: 2022,
    plant: 'Plant Cilegon',
    driverUtama: '',
    status: 'ACTIVE',
  });
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  const canEdit = ['ADMIN', 'HSE', 'MAINTENANCE'].includes(currentRole);

  const filtered = units.filter((u) => {
    const matchSearch =
      u.nomorPolisi.toLowerCase().includes(search.toLowerCase()) ||
      u.jenisKendaraan.toLowerCase().includes(search.toLowerCase()) ||
      u.driverUtama?.toLowerCase().includes(search.toLowerCase()) ||
      u.merk.toLowerCase().includes(search.toLowerCase());
    const matchPlant = plantFilter === 'ALL' || u.plant === plantFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchSearch && matchPlant && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingUnit(null);
    setFormData({
      nomorPolisi: '',
      jenisKendaraan: 'Trailer Gas Transport',
      merk: 'Mitsubishi Fuso',
      tahun: 2022,
      plant: 'Plant Cilegon',
      driverUtama: '',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData(unit);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomorPolisi.trim()) return;

    if (editingUnit) {
      updateUnit({ ...editingUnit, ...formData });
    } else {
      addUnit(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
            FLEET MANAGEMENT
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Master Data Unit Kendaraan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh unit armada truk trailer tangki gas PT. MAXALMINA ({units.length} Unit Terdaftar)
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Unit Baru</span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor polisi, jenis kendaraan, merk, driver..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={plantFilter}
            onChange={(e) => setPlantFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          >
            <option value="ALL">Semua Plant</option>
            <option value="Plant Cilegon">Plant Cilegon</option>
            <option value="Plant Marunda">Plant Marunda</option>
            <option value="Plant Balongan">Plant Balongan</option>
            <option value="Plant Gresik">Plant Gresik</option>
            <option value="Plant Palembang">Plant Palembang</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="OUT OF SERVICE">OUT OF SERVICE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Nomor Polisi</th>
                <th className="p-3.5">Jenis Kendaraan</th>
                <th className="p-3.5">Merk / Spesifikasi</th>
                <th className="p-3.5">Tahun</th>
                <th className="p-3.5">Plant Home Base</th>
                <th className="p-3.5">Driver Utama</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-black text-slate-900 dark:text-white">
                    <button
                      onClick={() => setSelectedUnitForDetail(u.nomorPolisi)}
                      className="hover:text-sky-600 hover:underline flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4 text-slate-400" />
                      <span>{u.nomorPolisi}</span>
                    </button>
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{u.jenisKendaraan}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{u.merk}</td>
                  <td className="p-3.5 text-slate-500">{u.tahun}</td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">{u.plant}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{u.driverUtama || '-'}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : u.status === 'MAINTENANCE'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedUnitForDetail(u.nomorPolisi)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Lihat Histori Unit"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Unit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setUnitToDelete(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Hapus Unit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Unit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingUnit ? 'Edit Unit Kendaraan' : 'Tambah Unit Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nomor Polisi (Plat)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: B 9780 FYV"
                  value={formData.nomorPolisi}
                  onChange={(e) => setFormData({ ...formData, nomorPolisi: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Jenis Kendaraan</label>
                <input
                  type="text"
                  value={formData.jenisKendaraan}
                  onChange={(e) => setFormData({ ...formData, jenisKendaraan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Merk</label>
                  <input
                    type="text"
                    value={formData.merk}
                    onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tahun</label>
                  <input
                    type="number"
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Plant Home Base</label>
                <select
                  value={formData.plant}
                  onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="Plant Cilegon">Plant Cilegon</option>
                  <option value="Plant Marunda">Plant Marunda</option>
                  <option value="Plant Balongan">Plant Balongan</option>
                  <option value="Plant Gresik">Plant Gresik</option>
                  <option value="Plant Palembang">Plant Palembang</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Driver Utama</label>
                <input
                  type="text"
                  value={formData.driverUtama || ''}
                  onChange={(e) => setFormData({ ...formData, driverUtama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="ACTIVE">ACTIVE (Siap Operasi)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Perawatan Bengkel)</option>
                  <option value="OUT OF SERVICE">OUT OF SERVICE (Tidak Beroperasi)</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700"
                >
                  Simpan Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {unitToDelete && (
        <ConfirmModal
          isOpen={true}
          isDanger={true}
          title="Hapus Data Unit?"
          message={`Hapus unit ${unitToDelete.nomorPolisi}? Histori CHR yang sudah ada akan tetap tersimpan.`}
          onConfirm={() => deleteUnit(unitToDelete.id)}
          onCancel={() => setUnitToDelete(null)}
        />
      )}
    </div>
  );
};
