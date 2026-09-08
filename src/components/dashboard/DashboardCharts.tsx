import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Truck, Wrench, Shield, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';

export const DashboardCharts: React.FC = () => {
  const { filteredCHRRecords, chrRecords, setSelectedUnitForDetail, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState<'unit' | 'category' | 'cost' | 'plant' | 'mechanic'>('unit');
  const [hoveredItem, setHoveredItem] = useState<{ label: string; value: string | number; sub?: string } | null>(null);

  const records = filteredCHRRecords;

  // A. CHR berdasarkan bulan
  const monthlyData: { [key: string]: { count: number; cost: number } } = {};
  chrRecords.filter((r) => !r.isDeleted).forEach((r) => {
    const month = r.tanggalLapor.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) monthlyData[month] = { count: 0, cost: 0 };
    monthlyData[month].count++;
    monthlyData[month].cost += r.nominal || 0;
  });

  // B & H. CHR berdasarkan unit & Top 10 Unit bermasalah
  const unitCounts: { [unit: string]: { count: number; cost: number; critical: number } } = {};
  records.forEach((r) => {
    if (!unitCounts[r.unit]) unitCounts[r.unit] = { count: 0, cost: 0, critical: 0 };
    unitCounts[r.unit].count++;
    unitCounts[r.unit].cost += r.nominal || 0;
    if (r.prioritas === 'CRITICAL') unitCounts[r.unit].critical++;
  });
  const top10Units = Object.entries(unitCounts)
    .map(([unit, val]) => ({ unit, ...val }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // C & I. CHR berdasarkan kategori kerusakan & Top 10 Kerusakan
  const categoryCounts: { [cat: string]: { count: number; cost: number } } = {};
  records.forEach((r) => {
    const cat = r.kategori || 'Other';
    if (!categoryCounts[cat]) categoryCounts[cat] = { count: 0, cost: 0 };
    categoryCounts[cat].count++;
    categoryCounts[cat].cost += r.nominal || 0;
  });
  const top10Categories = Object.entries(categoryCounts)
    .map(([category, val]) => ({ category, ...val }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // D. CHR berdasarkan status
  const statusCounts: { [st: string]: number } = {
    OPEN: 0,
    'IN PROGRESS': 0,
    'WAITING PART': 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  records.forEach((r) => {
    if (statusCounts[r.status] !== undefined) {
      statusCounts[r.status]++;
    }
  });

  // E. CHR berdasarkan plant
  const plantCounts: { [plant: string]: number } = {};
  records.forEach((r) => {
    const plantName = r.plantPelapor.split('/')[0].trim() || 'Plant Pusat';
    plantCounts[plantName] = (plantCounts[plantName] || 0) + 1;
  });
  const plantData = Object.entries(plantCounts).sort((a, b) => b[1] - a[1]);

  // F. CHR berdasarkan mekanik
  const mechanicCounts: { [mek: string]: number } = {};
  records.forEach((r) => {
    const mek = r.mekanik || 'Unassigned';
    mechanicCounts[mek] = (mechanicCounts[mek] || 0) + 1;
  });
  const mechanicData = Object.entries(mechanicCounts).sort((a, b) => b[1] - a[1]);

  const maxUnitCount = Math.max(...top10Units.map((u) => u.count), 1);
  const maxCatCount = Math.max(...top10Categories.map((c) => c.count), 1);
  const maxCost = Math.max(...top10Units.map((u) => u.cost), 1);

  return (
    <div className="space-y-6">
      
      {/* Chart Navigation Pills */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tampilan Grafik Analitik:</span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('unit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'unit'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Top 10 Unit</span>
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'category'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Kategori Kerusakan</span>
            </button>
            <button
              onClick={() => setActiveTab('cost')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'cost'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Biaya Maintenance</span>
            </button>
            <button
              onClick={() => setActiveTab('plant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'plant'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plant & Lokasi</span>
            </button>
            <button
              onClick={() => setActiveTab('mechanic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'mechanic'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Beban Mekanik</span>
            </button>
          </div>
        </div>

        {/* Hover info / Click guidance */}
        <div className="text-xs text-slate-500 dark:text-slate-400">
          💡 <span className="font-semibold text-slate-700 dark:text-slate-300">Tips:</span> Klik batang unit untuk langsung membuka <span className="text-sky-600 dark:text-sky-400 font-bold">Unit History</span>.
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Primary Bar / Line Chart based on activeTab */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          
          {/* TAB 1: Top 10 Unit dengan Masalah Terbanyak */}
          {activeTab === 'unit' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-sky-600" />
                    Top 10 Unit dengan Jumlah Masalah Terbanyak
                  </h3>
                  <p className="text-xs text-slate-500">Klik baris unit untuk melihat histori keluhan & tindakan lengkap</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                  {top10Units.length} Unit Aktif
                </span>
              </div>

              <div className="space-y-3.5 pt-2">
                {top10Units.map((u) => {
                  const percent = Math.round((u.count / maxUnitCount) * 100);
                  const isHighRisk = u.critical > 0;
                  return (
                    <div
                      key={u.unit}
                      onClick={() => setSelectedUnitForDetail(u.unit)}
                      className="group cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                      title={`Klik untuk buka Unit History ${u.unit}`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 transition">
                            {u.unit}
                          </span>
                          {isHighRisk && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                              {u.critical} Kritis
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 font-medium">{formatRupiah(u.cost)}</span>
                          <span className="font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {u.count} Kasus
                          </span>
                        </div>
                      </div>

                      {/* Bar container */}
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHighRisk
                              ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                              : 'bg-gradient-to-r from-sky-500 to-blue-600'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Top Kategori Kerusakan */}
          {activeTab === 'category' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-sky-600" />
                    Top 10 Jenis Kerusakan & Sistem Kendaraan
                  </h3>
                  <p className="text-xs text-slate-500">Frekuensi komparatif kerusakan berdasarkan kategori sistem</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                {top10Categories.map((c) => {
                  const percent = Math.round((c.count / maxCatCount) * 100);
                  return (
                    <div key={c.category} className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-800 dark:text-slate-200">{c.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 font-medium">{formatRupiah(c.cost)}</span>
                          <span className="font-extrabold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {c.count} Kasus
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Biaya Maintenance per Unit */}
          {activeTab === 'cost' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Top 10 Unit dengan Biaya Maintenance Tertinggi
                  </h3>
                  <p className="text-xs text-slate-500">Akumulasi nominal biaya suku cadang dan jasa perbaikan</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                {[...top10Units]
                  .sort((a, b) => b.cost - a.cost)
                  .map((u) => {
                    const percent = Math.round((u.cost / maxCost) * 100);
                    return (
                      <div
                        key={u.unit}
                        onClick={() => setSelectedUnitForDetail(u.unit)}
                        className="group cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                            {u.unit}
                          </span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(u.cost)}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: Plant & Lokasi */}
          {activeTab === 'plant' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-600" />
                    Distribusi CHR Berdasarkan Plant & Lokasi
                  </h3>
                  <p className="text-xs text-slate-500">Monitoring laporan masuk dari masing-masing plant operasional gas</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                {plantData.map(([plant, count]) => {
                  const percent = Math.round((count / records.length) * 100) || 0;
                  return (
                    <div key={plant} className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-800 dark:text-slate-200">{plant}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">{percent}%</span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold">
                            {count} Laporan
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full rounded-full bg-sky-500 transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: Beban Mekanik */}
          {activeTab === 'mechanic' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Distribusi Pekerjaan per Mekanik
                  </h3>
                  <p className="text-xs text-slate-500">Jumlah work order yang ditangani oleh masing-masing teknisi</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                {mechanicData.map(([mek, count]) => {
                  const percent = Math.round((count / records.length) * 100) || 0;
                  return (
                    <div key={mek} className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-800 dark:text-slate-200">{mek}</span>
                        <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md font-bold">
                          {count} Pekerjaan ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Column: Status Breakdown & High-Priority Alerts */}
        <div className="space-y-6">
          
          {/* Status Breakdown Box */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-sky-600" />
              Status Pekerjaan CHR
            </h3>

            <div className="space-y-3">
              {[
                { status: 'COMPLETED', label: 'Completed (Selesai)', count: statusCounts.COMPLETED, color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
                { status: 'IN PROGRESS', label: 'In Progress (Pengerjaan)', count: statusCounts['IN PROGRESS'], color: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-400' },
                { status: 'WAITING PART', label: 'Waiting Part (Menunggu Suku Cadang)', count: statusCounts['WAITING PART'], color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
                { status: 'OPEN', label: 'Open (Belum Dimulai)', count: statusCounts.OPEN, color: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400' },
              ].map((st) => {
                const pct = records.length > 0 ? Math.round((st.count / records.length) * 100) : 0;
                return (
                  <div key={st.status} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${st.color}`} />
                        <span className="text-slate-700 dark:text-slate-300">{st.label}</span>
                      </div>
                      <span className={`font-bold ${st.text}`}>{st.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${st.color}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Repeat Failure Warning Banner */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                  Highlight Khusus Armada
                </h4>
                <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-1 leading-relaxed">
                  Unit <strong className="text-amber-950 dark:text-white">B 9780 FYV</strong> tercatat mengalami <span className="font-bold underline text-rose-600 dark:text-rose-400">2x masalah berulang pada Sistem Rem</span> (pipa kompresor bocor & tekanan rem drop).
                </p>
                <button
                  onClick={() => setSelectedUnitForDetail('B 9780 FYV')}
                  className="mt-3 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
                >
                  Buka Detail Histori B 9780 FYV →
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
