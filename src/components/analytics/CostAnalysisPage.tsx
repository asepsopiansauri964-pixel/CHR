import React from 'react';
import {
  Banknote,
  Calendar,
  Download,
  FileSpreadsheet,
  Layers,
  PieChart,
  Tag,
  TrendingUp,
  Truck,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { exportCHRToExcel } from '../../utils/excelExportImport';

export const CostAnalysisPage: React.FC = () => {
  const { filteredCHRRecords, kpis, setSelectedUnitForDetail } = useApp();
  const records = filteredCHRRecords;

  // 1. Cost per unit
  const unitCostMap: { [unit: string]: { count: number; cost: number } } = {};
  records.forEach((r) => {
    if (!unitCostMap[r.unit]) unitCostMap[r.unit] = { count: 0, cost: 0 };
    unitCostMap[r.unit].count++;
    unitCostMap[r.unit].cost += r.nominal || 0;
  });
  const sortedUnitCosts = Object.entries(unitCostMap).sort((a, b) => b[1].cost - a[1].cost);
  const highestCostUnit = sortedUnitCosts.length > 0 ? sortedUnitCosts[0] : null;

  // 2. Cost per category
  const catCostMap: { [cat: string]: { count: number; cost: number } } = {};
  records.forEach((r) => {
    const cat = r.kategori || 'Lainnya';
    if (!catCostMap[cat]) catCostMap[cat] = { count: 0, cost: 0 };
    catCostMap[cat].count++;
    catCostMap[cat].cost += r.nominal || 0;
  });
  const sortedCatCosts = Object.entries(catCostMap).sort((a, b) => b[1].cost - a[1].cost);
  const highestCostCategory = sortedCatCosts.length > 0 ? sortedCatCosts[0] : null;

  // 3. Cost per plant
  const plantCostMap: { [plant: string]: number } = {};
  records.forEach((r) => {
    const p = r.plantPelapor.split('/')[0].trim() || 'Plant Pusat';
    plantCostMap[p] = (plantCostMap[p] || 0) + (r.nominal || 0);
  });
  const sortedPlantCosts = Object.entries(plantCostMap).sort((a, b) => b[1] - a[1]);

  // 4. Cost per mechanic
  const mechanicCostMap: { [mek: string]: number } = {};
  records.forEach((r) => {
    const m = r.mekanik || 'Unassigned';
    mechanicCostMap[m] = (mechanicCostMap[m] || 0) + (r.nominal || 0);
  });
  const sortedMechanicCosts = Object.entries(mechanicCostMap).sort((a, b) => b[1] - a[1]);

  const avgCostPerRepair = records.length > 0 ? kpis.totalCost / records.length : 0;
  const maxUnitCost = Math.max(...sortedUnitCosts.map((u) => u[1].cost), 1);
  const maxCatCost = Math.max(...sortedCatCosts.map((c) => c[1].cost), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            FINANCIAL INTELLIGENCE
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Analisis Biaya Perawatan & Suku Cadang
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit komprehensif pengeluaran operasional armada truk gas PT. MAXALMINA
          </p>
        </div>

        <button
          onClick={() => exportCHRToExcel(records, 'Analisa_Biaya_Maintenance')}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Analisa Biaya (Excel)</span>
        </button>
      </div>

      {/* Top Cost KPI Cards (Requirement 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Cost */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Total Biaya Perawatan</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            {formatRupiah(kpis.totalCost)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Seluruh armada gas</div>
        </div>

        {/* Avg per repair */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-rata per Kasus</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
            {formatRupiah(avgCostPerRepair)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Per laporan pekerjaan</div>
        </div>

        {/* Highest Cost Unit */}
        <div
          onClick={() => highestCostUnit && setSelectedUnitForDetail(highestCostUnit[0])}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-500 transition cursor-pointer"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Biaya Tertinggi</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
            {highestCostUnit ? highestCostUnit[0] : '-'}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
            {highestCostUnit ? formatRupiah(highestCostUnit[1].cost) : '-'}
          </div>
        </div>

        {/* Highest Cost Category */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kategori Biaya Tertinggi</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 truncate">
            {highestCostCategory ? highestCostCategory[0] : '-'}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
            {highestCostCategory ? formatRupiah(highestCostCategory[1].cost) : '-'}
          </div>
        </div>
      </div>

      {/* Grid: Unit Cost & Category Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Biaya per Unit */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-600" />
            Biaya Maintenance per Unit Kendaraan
          </h3>
          <div className="space-y-3">
            {sortedUnitCosts.map(([unit, data]) => {
              const percent = Math.round((data.cost / maxUnitCost) * 100);
              return (
                <div
                  key={unit}
                  onClick={() => setSelectedUnitForDetail(unit)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-sky-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-slate-900 dark:text-white font-extrabold">{unit}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-normal">{data.count} Kasus</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{formatRupiah(data.cost)}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div style={{ width: `${percent}%` }} className="h-full rounded-full bg-emerald-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biaya per Kategori */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-indigo-600" />
            Biaya Maintenance per Kategori Kerusakan
          </h3>
          <div className="space-y-3">
            {sortedCatCosts.map(([cat, data]) => {
              const percent = Math.round((data.cost / maxCatCost) * 100);
              return (
                <div key={cat} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-slate-900 dark:text-white font-extrabold">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-normal">{data.count} Kasus</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{formatRupiah(data.cost)}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div style={{ width: `${percent}%` }} className="h-full rounded-full bg-indigo-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid: Biaya per Plant & Biaya per Mekanik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Biaya per Plant */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            Alokasi Biaya Berdasarkan Plant Operasional
          </h3>
          <div className="space-y-3">
            {sortedPlantCosts.map(([plant, cost]) => (
              <div key={plant} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">{plant}</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(cost)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Biaya per Mekanik */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-sky-600" />
            Alokasi Biaya Berdasarkan Teknisi / Mekanik
          </h3>
          <div className="space-y-3">
            {sortedMechanicCosts.map(([mekanik, cost]) => (
              <div key={mekanik} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">{mekanik}</span>
                <span className="font-black text-sky-600 dark:text-sky-400">{formatRupiah(cost)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
