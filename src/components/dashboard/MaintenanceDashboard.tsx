import React from 'react';
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock,
  Package,
  Plus,
  Shield,
  Truck,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, isOverdue } from '../../utils/formatters';
import { PeriodSelector } from './PeriodSelector';

export const MaintenanceDashboard: React.FC = () => {
  const { filteredCHRRecords, kpis, mechanics, setSelectedUnitForDetail, setActiveView, quickUpdateStatus } = useApp();

  const records = filteredCHRRecords;

  // Extract top spareparts mentioned
  const sparepartsMap: { [part: string]: number } = {};
  records.forEach((r) => {
    if (r.sparepartTindakan && r.sparepartTindakan !== '-') {
      // Split by commas or extract key parts
      const parts = r.sparepartTindakan.split(/[,+]/);
      parts.forEach((p) => {
        const cleaned = p.trim();
        if (cleaned.length > 3) {
          sparepartsMap[cleaned] = (sparepartsMap[cleaned] || 0) + 1;
        }
      });
    }
  });
  const topSpareparts = Object.entries(sparepartsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Top Failures
  const failureMap: { [cat: string]: number } = {};
  records.forEach((r) => {
    failureMap[r.kategori] = (failureMap[r.kategori] || 0) + 1;
  });
  const topFailures = Object.entries(failureMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Top Units
  const unitMap: { [unit: string]: { count: number; cost: number } } = {};
  records.forEach((r) => {
    if (!unitMap[r.unit]) unitMap[r.unit] = { count: 0, cost: 0 };
    unitMap[r.unit].count++;
    unitMap[r.unit].cost += r.nominal || 0;
  });
  const topUnits = Object.entries(unitMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            MAINTENANCE & WORKSHOP
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Dashboard Maintenance & Work Order
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring pengerjaan mekanik, status suku cadang, dan antrian perbaikan unit armada
          </p>
        </div>
        <PeriodSelector />
      </div>

      {/* Primary Maintenance KPI Cards (Requirement 35) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Work Order Open */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Work Order Open</div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{kpis.openCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Antrian belum dikerjakan</div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">In Progress</div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{kpis.inProgressCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Sedang di workshop</div>
        </div>

        {/* Waiting Part */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Waiting Part</div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{kpis.waitingPartCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Indent komponen</div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Completed</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{kpis.completedCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Pekerjaan selesai</div>
        </div>

        {/* Overdue */}
        <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-rose-600">OVERDUE</div>
          <div className="text-3xl font-black text-rose-700 dark:text-rose-300 mt-1">{kpis.overdueCount}</div>
          <div className="text-[10px] text-rose-600/80 mt-0.5">Terlambat eksekusi</div>
        </div>

        {/* Total Cost */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Total Cost</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            {formatRupiah(kpis.totalCost)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Sparepart & Jasa</div>
        </div>

      </div>

      {/* Top Sparepart, Top Failure, Top Unit (Requirement 35) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Sparepart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            Top Sparepart Paling Banyak Digunakan
          </h3>
          <div className="space-y-3">
            {topSpareparts.map(([part, count], idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {part}
                  </span>
                </div>
                <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold text-slate-800 dark:text-slate-200">
                  {count}x dipakai
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Failure */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-rose-600" />
            Top Failure / Kategori Kerusakan
          </h3>
          <div className="space-y-3">
            {topFailures.map(([cat, count], idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cat}
                  </span>
                </div>
                <span className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded font-bold">
                  {count} insiden
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Unit */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-600" />
            Top Unit Masuk Workshop
          </h3>
          <div className="space-y-3">
            {topUnits.map(([unit, data], idx) => (
              <div
                key={idx}
                onClick={() => setSelectedUnitForDetail(unit)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 transition">
                      {unit}
                    </span>
                    <div className="text-[10px] text-slate-400">{formatRupiah(data.cost)}</div>
                  </div>
                </div>
                <span className="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded font-bold">
                  {data.count} Kasus →
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Active Work Orders Action Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Work Order Aktif Membutuhkan Tindakan (Open / In Progress / Waiting Part)
          </h3>
          <button
            onClick={() => setActiveView('maintenance-monitoring')}
            className="text-xs font-bold text-sky-600 hover:underline"
          >
            Lihat Semua Jadwal →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Unit</th>
                <th className="p-3">Keluhan & Masalah</th>
                <th className="p-3">Mekanik</th>
                <th className="p-3">Tgl Lapor / Eksekusi</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records
                .filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED')
                .slice(0, 5)
                .map((r) => {
                  const overdue = isOverdue(r);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <button
                          onClick={() => setSelectedUnitForDetail(r.unit)}
                          className="hover:text-sky-600 hover:underline"
                        >
                          {r.unit}
                        </button>
                        {overdue && (
                          <span className="block text-[10px] font-black text-rose-600 animate-pulse">
                            OVERDUE!
                          </span>
                        )}
                      </td>
                      <td className="p-3 max-w-xs text-slate-700 dark:text-slate-300 truncate">
                        {r.uraian}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {r.mekanik}
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {r.tanggalLapor}
                        {r.tanggalEksekusi ? ` → ${r.tanggalEksekusi}` : ''}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => quickUpdateStatus(r.id, 'COMPLETED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition"
                        >
                          Tandai Selesai ✓
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
