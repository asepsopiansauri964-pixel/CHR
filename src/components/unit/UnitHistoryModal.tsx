import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Shield,
  Truck,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo, formatRupiah, getPriorityBadgeClass, getStatusBadgeClass } from '../../utils/formatters';
import { exportUnitHistoryPDF } from '../../utils/pdfExport';
import { exportCHRToExcel } from '../../utils/excelExportImport';

export const UnitHistoryModal: React.FC = () => {
  const { selectedUnitForDetail, setSelectedUnitForDetail, units, chrRecords } = useApp();

  if (!selectedUnitForDetail) return null;

  const unitPlate = selectedUnitForDetail;
  const unitInfo = units.find((u) => u.nomorPolisi.toUpperCase() === unitPlate.toUpperCase()) || {
    id: 'unknown',
    nomorPolisi: unitPlate,
    jenisKendaraan: 'Trailer Gas Transport',
    merk: 'Mitsubishi Fuso / Hino',
    tahun: 2021,
    plant: 'Plant Cilegon',
    driverUtama: 'Driver Operasional',
    status: 'ACTIVE',
  };

  const unitRecords = chrRecords
    .filter((r) => r.unit.toUpperCase() === unitPlate.toUpperCase() && !r.isDeleted)
    .sort((a, b) => new Date(b.tanggalLapor).getTime() - new Date(a.tanggalLapor).getTime());

  // Statistics for this unit
  const totalCHR = unitRecords.length;
  const completedCount = unitRecords.filter((r) => r.status === 'COMPLETED').length;
  const openCount = unitRecords.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
  const criticalCount = unitRecords.filter((r) => r.prioritas === 'CRITICAL').length;
  const totalCost = unitRecords.reduce((sum, r) => sum + (r.nominal || 0), 0);

  // Failure categories for this unit
  const catCounts: { [cat: string]: number } = {};
  unitRecords.forEach((r) => {
    catCounts[r.kategori] = (catCounts[r.kategori] || 0) + 1;
  });
  const mostFrequentCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

  // Repeat Failure Detection for this unit
  const hasRepeatFailure = Object.values(catCounts).some((cnt) => cnt >= 2);

  // Status Indicator
  const isHighRisk = criticalCount > 0 || hasRepeatFailure || totalCHR >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full p-6 my-8 animate-scale-up">
        
        {/* Header with Print & Close */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                  DETAIL RIWAYAT KENDARAAN (UNIT HISTORY)
                </span>
                {isHighRisk && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 animate-pulse">
                    ⚠️ FREKUENSI KERUSAKAN TINGGI
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {unitInfo.nomorPolisi}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportUnitHistoryPDF(unitInfo, unitRecords)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
              title="Unduh Lembar Riwayat PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cetak PDF</span>
            </button>
            <button
              onClick={() => exportCHRToExcel(unitRecords, `Histori_${unitInfo.nomorPolisi}`)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
              title="Ekspor ke Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              onClick={() => setSelectedUnitForDetail(null)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-6 pt-4 text-xs">
          
          {/* Unit Specifications Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Jenis Kendaraan</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{unitInfo.jenisKendaraan}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Merk / Tahun</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{unitInfo.merk} ({unitInfo.tahun})</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Plant Home Base</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{unitInfo.plant}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Driver Utama</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{unitInfo.driverUtama || '-'}</p>
            </div>
          </div>

          {/* Unit Performance KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Kasus CHR</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalCHR}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Selesai (Completed)</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{completedCount}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-blue-600 uppercase">Belum Selesai (Open)</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{openCount}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-rose-600 uppercase">Kasus Kritis</span>
              <div className="text-2xl font-black text-rose-600 mt-0.5">{criticalCount}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Total Biaya Unit</span>
              <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                {formatRupiah(totalCost)}
              </div>
            </div>
          </div>

          {/* Repeat Failure Alert Banner */}
          {hasRepeatFailure && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Terdeteksi Kerusakan Berulang (Repeat Failure)!
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                  Komponen <strong>{mostFrequentCategory ? mostFrequentCategory[0] : 'Sistem Kendaraan'}</strong> mengalami kerusakan lebih dari 1 kali ({mostFrequentCategory ? mostFrequentCategory[1] : 2}x kasus). Disarankan inspeksi overhaul mekanik menyeluruh sebelum penugasan jarak jauh.
                </p>
              </div>
            </div>
          )}

          {/* Chronological History Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Kronologi Riwayat Keluhan & Perbaikan ({unitRecords.length} Catatan)
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] uppercase font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Tanggal Lapor</th>
                    <th className="p-2.5">Kategori</th>
                    <th className="p-2.5">Uraian Masalah</th>
                    <th className="p-2.5">Tindakan & Sparepart</th>
                    <th className="p-2.5">Mekanik</th>
                    <th className="p-2.5">Biaya</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {unitRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Belum ada riwayat keluhan atau maintenance tercatat untuk unit ini.
                      </td>
                    </tr>
                  ) : (
                    unitRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 whitespace-nowrap text-slate-500 font-medium">{r.tanggalLapor}</td>
                        <td className="p-2.5 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                          {r.kategori}
                        </td>
                        <td className="p-2.5 max-w-xs text-slate-700 dark:text-slate-300">
                          {r.uraian}
                        </td>
                        <td className="p-2.5 max-w-xs text-slate-600 dark:text-slate-400">
                          <div>{r.tindakan}</div>
                          {r.sparepartTindakan && r.sparepartTindakan !== '-' && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block">
                              Part: {r.sparepartTindakan}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.mekanik}</td>
                        <td className="p-2.5 whitespace-nowrap font-bold text-emerald-600">{formatRupiah(r.nominal)}</td>
                        <td className="p-2.5 whitespace-nowrap">
                          <span className={getStatusBadgeClass(r.status)}>{r.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setSelectedUnitForDetail(null)}
            className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            Tutup Riwayat
          </button>
        </div>

      </div>
    </div>
  );
};
