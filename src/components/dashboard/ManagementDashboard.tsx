import React from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
  Truck,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { PeriodSelector } from './PeriodSelector';

export const ManagementDashboard: React.FC = () => {
  const { kpis, filteredCHRRecords, units, setSelectedUnitForDetail, setActiveView } = useApp();

  // Calculate top problem unit
  const unitCounts: { [unit: string]: { count: number; cost: number } } = {};
  filteredCHRRecords.forEach((r) => {
    if (!unitCounts[r.unit]) unitCounts[r.unit] = { count: 0, cost: 0 };
    unitCounts[r.unit].count++;
    unitCounts[r.unit].cost += r.nominal || 0;
  });
  const sortedUnits = Object.entries(unitCounts).sort((a, b) => b[1].count - a[1].count);
  const topProblemUnit = sortedUnits.length > 0 ? sortedUnits[0] : null;

  // Calculate top failure category
  const catCounts: { [cat: string]: number } = {};
  filteredCHRRecords.forEach((r) => {
    catCounts[r.kategori] = (catCounts[r.kategori] || 0) + 1;
  });
  const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCats.length > 0 ? sortedCats[0] : null;

  return (
    <div className="space-y-6">
      {/* Header with Title & Period */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
            EXECUTIVE DASHBOARD
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Ringkasan Eksekutif & Manajemen Armada
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Laporan efisiensi operasional, pemeliharaan aset kendaraan gas, dan kontrol biaya PT. MAXALMINA
          </p>
        </div>
        <PeriodSelector />
      </div>

      {/* 8 Primary Executive Cards (Requirement 33) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL CHR */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">TOTAL CHR</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{kpis.totalCHR}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">100%</span> tercatat dalam sistem
          </div>
        </div>

        {/* TOTAL UNIT */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">TOTAL ARMADA UNIT</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{units.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-amber-600">{kpis.totalProblemUnits} unit</span> mengalami keluhan
          </div>
        </div>

        {/* TOTAL MAINTENANCE COST */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            TOTAL BIAYA MAINTENANCE
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            {formatRupiah(kpis.totalCost)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Rata-rata: {formatRupiah(kpis.costPerUnit)} / unit
          </div>
        </div>

        {/* COMPLETION RATE */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">COMPLETION RATE</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {kpis.completionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {kpis.completedCount} dari {kpis.totalCHR} pekerjaan tuntas
          </div>
        </div>

        {/* OPEN ISSUE */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            OPEN ISSUE
          </div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{kpis.openCount}</div>
          <div className="text-xs text-slate-500 mt-1">Menunggu penugasan mekanik</div>
        </div>

        {/* CRITICAL ISSUE */}
        <div className="bg-rose-50/80 dark:bg-rose-950/40 p-5 rounded-2xl border border-rose-300 dark:border-rose-800 shadow-xs">
          <div className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
            CRITICAL ISSUE
          </div>
          <div className="text-3xl font-black text-rose-700 dark:text-rose-400 mt-1">{kpis.criticalCount}</div>
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">Prioritas tinggi keselamatan</div>
        </div>

        {/* TOP PROBLEM UNIT */}
        <div
          onClick={() => topProblemUnit && setSelectedUnitForDetail(topProblemUnit[0])}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-500 transition cursor-pointer"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">TOP PROBLEM UNIT</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
            {topProblemUnit ? topProblemUnit[0] : '-'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {topProblemUnit ? `${topProblemUnit[1].count} kasus • ${formatRupiah(topProblemUnit[1].cost)}` : '-'}
          </div>
        </div>

        {/* TOP FAILURE CATEGORY */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">TOP FAILURE CATEGORY</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
            {topCategory ? topCategory[0] : '-'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {topCategory ? `${topCategory[1]} laporan (${((topCategory[1] / kpis.totalCHR) * 100).toFixed(0)}%)` : '-'}
          </div>
        </div>
      </div>

      {/* Strategic Trend & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            Distribusi Biaya Maintenance per Kategori
          </h3>
          <div className="space-y-3">
            {sortedCats.slice(0, 5).map(([cat, count]) => {
              const catCost = filteredCHRRecords
                .filter((r) => r.kategori === cat)
                .reduce((sum, r) => sum + (r.nominal || 0), 0);
              const pct = kpis.totalCost > 0 ? Math.round((catCost / kpis.totalCost) * 100) : 0;
              return (
                <div key={cat} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{cat}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{formatRupiah(catCost)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="h-full rounded-full bg-emerald-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Rekomendasi Manajemen & Efisiensi
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Prioritas Audit Rem & Gas Valve:</strong> Sistem Brake dan Hydraulic mencakup 40%+ dari pengeluaran maintenance dan memiliki risiko keselamatan B3 tertinggi.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Kontrak Pengadaan Sparepart Kopling & Ban:</strong> Perlu pembentukan buffer stock suku cadang Fuso & Bridgestone di workshop Cilegon untuk memangkas status WAITING PART.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                <span>
                  <strong>Evaluasi Unit B 9780 FYV:</strong> Diperlukan overhaul total sistem pengereman pneumatik sebelum unit diizinkan kembali ke rute distribusi jauh.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              onClick={() => setActiveView('reports')}
              className="px-4 py-2 text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-xl transition"
            >
              Cetak Laporan Lengkap →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
