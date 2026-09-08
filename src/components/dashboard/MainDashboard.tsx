import React from 'react';
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Truck,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PeriodSelector } from './PeriodSelector';
import { KPICards } from './KPICards';
import { DashboardCharts } from './DashboardCharts';
import { formatRupiah } from '../../utils/formatters';

interface MainDashboardProps {
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onOpenAddModal,
  onOpenImportModal,
}) => {
  const {
    filteredCHRRecords,
    currentRole,
    setSelectedUnitForDetail,
    setActiveView,
    resetToInitialData,
  } = useApp();

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
              OPERATIONAL OVERVIEW
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Periode Agustus 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Maxalmina Fleet Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sistem pemantauan Customer History Report (CHR), perawatan armada gas, dan kepatuhan keselamatan
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {currentRole !== 'VIEWER' && (
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input CHR Baru</span>
            </button>
          )}

          {['ADMIN', 'HSE', 'DISPATCHER'].includes(currentRole) && (
            <button
              onClick={onOpenImportModal}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Import Excel</span>
            </button>
          )}

          <button
            onClick={() => setActiveView('reports')}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="Buka Halaman Laporan & Cetak PDF/Excel"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Laporan</span>
          </button>
        </div>
      </div>

      {/* Period Filter Bar (Requirement 19) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <PeriodSelector />
        <div className="text-xs text-slate-400">
          Menampilkan <strong className="text-slate-800 dark:text-slate-200">{filteredCHRRecords.length}</strong> record CHR
        </div>
      </div>

      {/* KPI Cards (Requirement 4 & 36) */}
      <KPICards />

      {/* Interactive Analytics Charts (Requirement 5) */}
      <DashboardCharts />

      {/* Recent Records Quick Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Laporan CHR Terkini</h2>
            <p className="text-xs text-slate-500">Daftar laporan keluhan dan maintenance yang baru diperbarui</p>
          </div>
          <button
            onClick={() => setActiveView('chr-data')}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Lihat Semua ({filteredCHRRecords.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Tanggal Lapor</th>
                <th className="p-3">Unit Kendaraan</th>
                <th className="p-3">Driver / Pelapor</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Keluhan / Uraian</th>
                <th className="p-3">Mekanik</th>
                <th className="p-3">Biaya</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCHRRecords.slice(0, 6).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3 whitespace-nowrap text-slate-500">{r.tanggalLapor}</td>
                  <td className="p-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                    <button
                      onClick={() => setSelectedUnitForDetail(r.unit)}
                      className="hover:text-sky-600 hover:underline"
                    >
                      {r.unit}
                    </button>
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.driver}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      {r.kategori}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs text-slate-700 dark:text-slate-300 truncate">
                    {r.uraian}
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{r.mekanik}</td>
                  <td className="p-3 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(r.nominal)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : r.status === 'IN PROGRESS'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : r.status === 'WAITING PART'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
