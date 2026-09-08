import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Layers,
  Lightbulb,
  Shield,
  ShieldAlert,
  Truck,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';

export const FailureAnalysisPage: React.FC = () => {
  const { filteredCHRRecords, units, setSelectedUnitForDetail } = useApp();
  const records = filteredCHRRecords;

  // 1. Repeat Failure Detector Engine (Requirement 10)
  // Track (unit + category) pairs that appear >= 2 times
  const unitCategoryMap: {
    [key: string]: {
      unit: string;
      category: string;
      dates: string[];
      records: typeof records;
    };
  } = {};

  records.forEach((r) => {
    const key = `${r.unit}___${r.kategori}`;
    if (!unitCategoryMap[key]) {
      unitCategoryMap[key] = {
        unit: r.unit,
        category: r.kategori,
        dates: [],
        records: [],
      };
    }
    unitCategoryMap[key].dates.push(r.tanggalLapor);
    unitCategoryMap[key].records.push(r);
  });

  const repeatFailures = Object.values(unitCategoryMap).filter((item) => item.records.length >= 2);

  // 2. Component System Breakdown
  const systemCounts: { [system: string]: { count: number; cost: number; critical: number } } = {
    'Sistem Rem': { count: 0, cost: 0, critical: 0 },
    'Sistem Ban & Suspensi': { count: 0, cost: 0, critical: 0 },
    'Mesin & Bahan Bakar': { count: 0, cost: 0, critical: 0 },
    'Transmisi & Kopling': { count: 0, cost: 0, critical: 0 },
    'Kelistrikan & Starter': { count: 0, cost: 0, critical: 0 },
    'Tangki & Valve Gas': { count: 0, cost: 0, critical: 0 },
    'Sistem Pendingin / Radiator': { count: 0, cost: 0, critical: 0 },
  };

  records.forEach((r) => {
    let matched = false;
    for (const sys of Object.keys(systemCounts)) {
      if (r.kategori.toLowerCase().includes(sys.toLowerCase().replace('sistem ', ''))) {
        systemCounts[sys].count++;
        systemCounts[sys].cost += r.nominal || 0;
        if (r.prioritas === 'CRITICAL') systemCounts[sys].critical++;
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (!systemCounts[r.kategori]) {
        systemCounts[r.kategori] = { count: 0, cost: 0, critical: 0 };
      }
      systemCounts[r.kategori].count++;
      systemCounts[r.kategori].cost += r.nominal || 0;
      if (r.prioritas === 'CRITICAL') systemCounts[r.kategori].critical++;
    }
  });

  const sortedSystems = Object.entries(systemCounts)
    .filter(([_, v]) => v.count > 0)
    .sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">
            ROOT CAUSE & RELIABILITY
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Analisis Kerusakan & Repeat Failure Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deteksi otomatis kerusakan berulang, analisis komponen kritis, dan rekomendasi preventif
          </p>
        </div>
      </div>

      {/* REPEAT FAILURE ENGINE SECTION (Requirement 10) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Peringatan Repeat Failure Aktif ({repeatFailures.length} Unit Terdeteksi)
          </h2>
        </div>

        {repeatFailures.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 dark:text-slate-200">Tidak ada kerusakan berulang yang terdeteksi.</p>
            <p className="mt-1">Semua perbaikan berhasil diselesaikan tanpa keluhan ulang pada komponen yang sama.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repeatFailures.map((rf, idx) => (
              <div
                key={idx}
                className="bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-400 dark:border-rose-900/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-rose-500 text-white">
                        <AlertOctagon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                          PERINGATAN RISIKO TINGGI
                        </span>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {rf.unit}
                        </h3>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-rose-200/80 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-xs font-black">
                      {rf.records.length}x Kejadian Berulang
                    </span>
                  </div>

                  <p className="text-xs text-rose-900/90 dark:text-rose-200/90 leading-relaxed font-medium mt-2">
                    Unit <strong>{rf.unit}</strong> mengalami keluhan berulang pada komponen{' '}
                    <strong className="underline">{rf.category}</strong> sebanyak {rf.records.length} kali dalam 30 hari.
                  </p>

                  {/* Chronology items */}
                  <div className="mt-3 space-y-2">
                    {rf.records.map((r, rIdx) => (
                      <div
                        key={r.id}
                        className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/50 text-xs flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold">
                            Kejadian #{rIdx + 1} ({r.tanggalLapor})
                          </div>
                          <div className="text-slate-800 dark:text-slate-200 font-medium">{r.uraian}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Tindakan: {r.tindakan}</div>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 shrink-0">
                          {formatRupiah(r.nominal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-200/60 dark:border-rose-900/50 flex justify-end">
                  <button
                    onClick={() => setSelectedUnitForDetail(rf.unit)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>Buka Histori Lengkap {rf.unit}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Component Breakdown Table & Prevention Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Systems */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-600" />
            Distribusi Kerusakan Berdasarkan Komponen Sistem Kendaraan
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Sistem Komponen</th>
                  <th className="p-3">Frekuensi</th>
                  <th className="p-3">Kasus Kritis</th>
                  <th className="p-3">Total Biaya</th>
                  <th className="p-3">Tingkat Risiko</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedSystems.map(([sys, val]) => (
                  <tr key={sys} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{sys}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">{val.count} kasus</td>
                    <td className="p-3 font-bold text-rose-600">
                      {val.critical > 0 ? `${val.critical} Kritis` : '0'}
                    </td>
                    <td className="p-3 font-bold text-emerald-600">{formatRupiah(val.cost)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          val.critical > 0 || val.count >= 4
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {val.critical > 0 || val.count >= 4 ? 'TINGGI' : 'MODERAT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Preventive Recommendations (Requirement 9) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Rekomendasi Tindakan Pencegahan (Preventive Maintenance)
          </h3>

          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <li className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <strong className="text-slate-900 dark:text-white block mb-0.5">1. Drain Air Reservoir Kompresor:</strong>
              Lakukan pembuangan kondensasi air pada tangki angin kompresor setiap pergantian shift untuk mencegah korosi pipa rem tembaga.
            </li>
            <li className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <strong className="text-slate-900 dark:text-white block mb-0.5">2. Penggantian Seal PRV Valve Berkala:</strong>
              Pastikan seal o-ring katup tangki gas diganti setiap 10.000 km guna mencegah kebocoran uap gas berbahaya.
            </li>
            <li className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <strong className="text-slate-900 dark:text-white block mb-0.5">3. Torsi Roda & Cek Baut U-Bolt:</strong>
              Pemeriksaan kekencangan baut roda trailer menggunakan torque wrench 550 Nm setiap sebelum keberangkatan rute jauh.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};
