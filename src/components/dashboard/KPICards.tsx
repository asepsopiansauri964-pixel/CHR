import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  HelpCircle,
  Percent,
  RefreshCcw,
  Truck,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';

export const KPICards: React.FC = () => {
  const { kpis, setActiveView } = useApp();

  return (
    <div className="space-y-4">
      {/* Primary KPI Cards Grid (Requirement 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* Total CHR */}
        <div
          onClick={() => setActiveView('chr-data')}
          className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-sky-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total CHR</span>
            <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-sky-600 group-hover:text-white transition">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {kpis.totalCHR}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Laporan Masuk</div>
        </div>

        {/* Open / Belum Selesai */}
        <div
          onClick={() => setActiveView('chr-data')}
          className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Open</span>
            <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
            {kpis.openCount}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Belum Dieksekusi</div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setActiveView('maintenance-monitoring')}
          className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">In Progress</span>
            <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            {kpis.inProgressCount}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Sedang Dikerjakan</div>
        </div>

        {/* Completed */}
        <div
          onClick={() => setActiveView('chr-data')}
          className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Completed</span>
            <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {kpis.completedCount}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Pekerjaan Selesai</div>
        </div>

        {/* Critical / Prioritas Tinggi (Prominent Red) */}
        <div
          onClick={() => setActiveView('chr-data')}
          className="bg-rose-50/70 dark:bg-rose-950/30 p-3.5 rounded-2xl border-2 border-rose-400/80 dark:border-rose-800 shadow-sm hover:scale-[1.02] transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider">Critical</span>
            <div className="p-1 rounded-lg bg-rose-200/70 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 tracking-tight">
            {kpis.criticalCount}
          </div>
          <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">Perhatian Utama HSE</div>
        </div>

        {/* Total Unit Bermasalah */}
        <div
          onClick={() => setActiveView('master-units')}
          className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Unit Rusak</span>
            <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {kpis.totalProblemUnits}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Unit Unik Bermasalah</div>
        </div>

        {/* Total Biaya Maintenance */}
        <div
          onClick={() => setActiveView('cost-analysis')}
          className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition cursor-pointer group col-span-2 sm:col-span-2"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Total Biaya Maintenance
            </span>
            <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight truncate">
            {formatRupiah(kpis.totalCost)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Rata-rata: {formatRupiah(kpis.costPerUnit)} / unit
          </div>
        </div>

      </div>

      {/* Secondary KPI Bar (Requirement 36: KPI Calculations) */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Completion Rate */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-500 dark:text-slate-400">Completion Rate:</span>
          <span className="font-extrabold text-slate-900 dark:text-white">{kpis.completionRate.toFixed(1)}%</span>
        </div>

        {/* Open Rate */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-slate-500 dark:text-slate-400">Open Rate:</span>
          <span className="font-extrabold text-slate-900 dark:text-white">{kpis.openRate.toFixed(1)}%</span>
        </div>

        {/* Critical Rate */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-slate-500 dark:text-slate-400">Critical Rate:</span>
          <span className="font-extrabold text-rose-600 dark:text-rose-400">{kpis.criticalRate.toFixed(1)}%</span>
        </div>

        {/* Average Repair Time */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-slate-500 dark:text-slate-400">Avg. Repair Time:</span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {kpis.avgRepairDays > 0 ? `${kpis.avgRepairDays.toFixed(1)} Hari` : '< 1 Hari'}
          </span>
        </div>

        {/* Repeat Failure Rate */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-slate-500 dark:text-slate-400">Repeat Failure Rate:</span>
          <span className="font-extrabold text-orange-600 dark:text-orange-400">{kpis.repeatFailureRate.toFixed(1)}%</span>
        </div>

        {/* Maintenance Overdue */}
        {kpis.overdueCount > 0 && (
          <div
            onClick={() => setActiveView('maintenance-monitoring')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-bold cursor-pointer hover:underline"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{kpis.overdueCount} Pekerjaan OVERDUE!</span>
          </div>
        )}

      </div>
    </div>
  );
};
