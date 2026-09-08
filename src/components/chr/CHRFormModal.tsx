import React, { useState, useEffect } from 'react';
import { AlertTriangle, Banknote, Calendar, Check, Clock, Truck, User, Wrench, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CHRRecord, CHRStatus, PriorityLevel } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface CHRFormModalProps {
  isOpen: boolean;
  initialRecord?: CHRRecord | null;
  onClose: () => void;
}

export const CHRFormModal: React.FC<CHRFormModalProps> = ({
  isOpen,
  initialRecord,
  onClose,
}) => {
  const { units, drivers, mechanics, categories, addCHRRecord, updateCHRRecord } = useApp();

  const isEditing = Boolean(initialRecord);

  // Form State
  const [formData, setFormData] = useState<Partial<CHRRecord>>({
    tanggalLapor: new Date().toISOString().split('T')[0],
    unit: '',
    plantPelapor: 'Plant Cilegon',
    driver: '',
    kategori: 'Sistem Rem',
    prioritas: 'MEDIUM' as PriorityLevel,
    uraian: '',
    tindakan: '',
    sparepartTindakan: '',
    mekanik: '',
    tanggalEksekusi: '',
    tanggalSelesai: '',
    nominal: 0,
    status: 'OPEN' as CHRStatus,
  });

  const [displayNominal, setDisplayNominal] = useState('0');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialRecord) {
      setFormData(initialRecord);
      setDisplayNominal(initialRecord.nominal ? initialRecord.nominal.toString() : '0');
    } else {
      setFormData({
        tanggalLapor: new Date().toISOString().split('T')[0],
        unit: units.length > 0 ? units[0].nomorPolisi : '',
        plantPelapor: 'Plant Cilegon',
        driver: drivers.length > 0 ? drivers[0].name : '',
        kategori: categories.length > 0 ? categories[0].name : 'Sistem Rem',
        prioritas: 'MEDIUM',
        uraian: '',
        tindakan: '',
        sparepartTindakan: '',
        mekanik: mechanics.length > 0 ? mechanics[0].name : '',
        tanggalEksekusi: '',
        tanggalSelesai: '',
        nominal: 0,
        status: 'OPEN',
      });
      setDisplayNominal('0');
    }
    setErrors({});
  }, [initialRecord, isOpen, units, drivers, mechanics, categories]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.unit) errs.unit = 'Nomor Unit wajib dipilih';
    if (!formData.tanggalLapor) errs.tanggalLapor = 'Tanggal Lapor wajib diisi';
    if (!formData.uraian?.trim()) errs.uraian = 'Uraian keluhan / kerusakan wajib diisi';
    if (!formData.driver?.trim()) errs.driver = 'Nama driver / pelapor wajib diisi';
    if (!formData.mekanik?.trim()) errs.mekanik = 'Nama teknisi / mekanik wajib dipilih';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanNum = e.target.value.replace(/[^0-9]/g, '');
    const num = Number(cleanNum) || 0;
    setDisplayNominal(cleanNum);
    setFormData((prev) => ({ ...prev, nominal: num }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && initialRecord) {
      updateCHRRecord({
        ...initialRecord,
        ...(formData as CHRRecord),
      });
    } else {
      addCHRRecord(formData as Omit<CHRRecord, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 my-8 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isEditing ? `Edit Laporan CHR #${initialRecord?.id.substring(0, 8)}` : 'Tambah Laporan CHR Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Formulir pencatatan riwayat kerusakan, perbaikan, dan biaya armada gas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Row 1: Tanggal Lapor & Unit Kendaraan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Lapor <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.tanggalLapor}
                onChange={(e) => setFormData({ ...formData, tanggalLapor: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
              />
              {errors.tanggalLapor && (
                <p className="text-[10px] text-rose-500 mt-0.5">{errors.tanggalLapor}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Unit Kendaraan <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
              >
                <option value="">-- Pilih Unit --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.nomorPolisi}>
                    {u.nomorPolisi} ({u.jenisKendaraan} - {u.plant})
                  </option>
                ))}
              </select>
              {errors.unit && <p className="text-[10px] text-rose-500 mt-0.5">{errors.unit}</p>}
            </div>
          </div>

          {/* Row 2: Plant Pelapor & Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Plant / Lokasi Pelapor
              </label>
              <select
                value={formData.plantPelapor}
                onChange={(e) => setFormData({ ...formData, plantPelapor: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
              >
                <option value="Plant Cilegon">Plant Cilegon</option>
                <option value="Plant Marunda">Plant Marunda</option>
                <option value="Plant Balongan">Plant Balongan</option>
                <option value="Plant Gresik">Plant Gresik</option>
                <option value="Plant Palembang">Plant Palembang</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Driver / Pelapor <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="driver-suggestions"
                value={formData.driver}
                onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                placeholder="Ketik atau pilih driver..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
              />
              <datalist id="driver-suggestions">
                {drivers.map((d) => (
                  <option key={d.id} value={d.name} />
                ))}
              </datalist>
              {errors.driver && <p className="text-[10px] text-rose-500 mt-0.5">{errors.driver}</p>}
            </div>
          </div>

          {/* Row 3: Kategori Kerusakan & Prioritas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Kerusakan / Sistem
              </label>
              <select
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tingkat Prioritas
              </label>
              <select
                value={formData.prioritas}
                onChange={(e) => setFormData({ ...formData, prioritas: e.target.value as PriorityLevel })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 font-semibold"
              >
                <option value="LOW">LOW (Rendah / Estetika)</option>
                <option value="MEDIUM">MEDIUM (Sedang / Terjadwal)</option>
                <option value="HIGH">HIGH (Tinggi / Kinerja Menurun)</option>
                <option value="CRITICAL">CRITICAL (Kritis / Bahaya Keselamatan / Rem / Gas)</option>
              </select>
            </div>
          </div>

          {/* Uraian Keluhan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Uraian Keluhan / Masalah Kendaraan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.uraian}
              onChange={(e) => setFormData({ ...formData, uraian: e.target.value })}
              placeholder="Jelaskan secara rinci kendala yang dialami driver atau plant..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
            />
            {errors.uraian && <p className="text-[10px] text-rose-500 mt-0.5">{errors.uraian}</p>}
          </div>

          {/* Tindakan Perbaikan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tindakan Perbaikan / Catatan Teknis
            </label>
            <textarea
              rows={2}
              value={formData.tindakan}
              onChange={(e) => setFormData({ ...formData, tindakan: e.target.value })}
              placeholder="Uraikan perbaikan yang telah atau sedang dilakukan mekanik..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Sparepart yang Digunakan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sparepart yang Digunakan (Pisahkan dengan koma jika lebih dari satu)
            </label>
            <input
              type="text"
              value={formData.sparepartTindakan}
              onChange={(e) => setFormData({ ...formData, sparepartTindakan: e.target.value })}
              placeholder="Contoh: Brake Chamber Type 24, Oli Mesin 15W-40, Seal PRV Valve"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Row 4: Mekanik & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mekanik yang Menangani <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.mekanik}
                onChange={(e) => setFormData({ ...formData, mekanik: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
              >
                <option value="">-- Pilih Mekanik --</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.specialization} - {m.plant})
                  </option>
                ))}
              </select>
              {errors.mekanik && <p className="text-[10px] text-rose-500 mt-0.5">{errors.mekanik}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status Pekerjaan
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CHRStatus })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 font-bold"
              >
                <option value="OPEN">OPEN (Menunggu Penugasan)</option>
                <option value="IN PROGRESS">IN PROGRESS (Sedang Dikerjakan)</option>
                <option value="WAITING PART">WAITING PART (Menunggu Suku Cadang)</option>
                <option value="COMPLETED">COMPLETED (Selesai & Lulus Uji)</option>
                <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
              </select>
            </div>
          </div>

          {/* Row 5: Tanggal Eksekusi, Tanggal Selesai & Nominal Biaya */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Eksekusi
              </label>
              <input
                type="date"
                value={formData.tanggalEksekusi || ''}
                onChange={(e) => setFormData({ ...formData, tanggalEksekusi: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={formData.tanggalSelesai || ''}
                onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nominal Biaya (Rp)
              </label>
              <input
                type="text"
                value={displayNominal}
                onChange={handleNominalChange}
                placeholder="0"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 font-bold text-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {formatRupiah(formData.nominal || 0)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Tambah CHR'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
