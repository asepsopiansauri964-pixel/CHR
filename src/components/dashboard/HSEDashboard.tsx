import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Gauge,
  RefreshCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PeriodSelector } from './PeriodSelector';

export const HSEDashboard: React.FC = () => {
  const { kpis, filteredCHRRecords, units, setSelectedUnitForDetail, setActiveView } = useApp();

  // HSE Indicators
  const criticalCount = kpis.criticalCount;
  const overdueCount = kpis.overdueCount;
  const repeatFailureCount = Math.round((kpis.repeatFailureRate * kpis.totalCHR) / 100) || 1;

  // Breakdown count (High / Critical in progress or waiting part)
  const breakdownCount = filteredCHRRecords.filter(
    (r) => (r.prioritas === 'CRITICAL' || r.prioritas === 'HIGH') && r.status !== 'COMPLETED'
  ).length;

  // Service berkala count
  const serviceBerkalaCount = filteredCHRRecords.filter(
    (r) => r.kategori === 'Service Berkala' || r.kategori === 'Preventive Maintenance'
  ).length;

  // High risk units calculation (units with critical issues or repeat failures)
  const highRiskUnits = units.filter((u) => {
    const hasCrit = filteredCHRRecords.some((r) => r.unit === u.nomorPolisi && r.prioritas === 'CRITICAL');
    return hasCrit || u.status === 'MAINTENANCE' || u.status === 'OUT OF SERVICE';
  });

  // Overall Safety Status Indicator: GREEN, YELLOW, RED
  let overallSafety: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
  if (criticalCount > 2 || overdueCount > 2 || breakdownCount > 3) {
    overallSafety = 'RED';
  } else if (criticalCount > 0 || overdueCount > 0 || breakdownCount > 0) {
    overallSafety = 'YELLOW';
  }

  const safetyThemes = {
    GREEN: {
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      bannerBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800',
      title: 'KONDISI KESELAMATAN: NORMAL (GREEN)',
      desc: 'Seluruh armada berada dalam batas toleransi keselamatan kerja Migas.',
    },
    YELLOW: {
      bg: 'bg-amber-500',
      border: 'border-amber-500',
      text: 'text-amber-700 dark:text-amber-300',
      bannerBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800',
      title: 'PERINGATAN KESELAMATAN: ATTENTION (YELLOW)',
      desc: 'Terdapat pekerjaan overdue atau potensi gangguan keselamatan pada komponen unit gas.',
    },
    RED: {
      bg: 'bg-rose-500',
      border: 'border-rose-500',
      text: 'text-rose-700 dark:text-rose-300',
      bannerBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800',
      title: 'STATUS BAHAYA KESELAMATAN: CRITICAL (RED)',
      desc: 'Dibutuhkan tindakan darurat inspeksi HSE! Unit kritis tidak boleh beroperasi di jalan raya.',
    },
  };

  const curTheme = safetyThemes[overallSafety];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              SAFETY & COMPLIANCE
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              STANDAR MIGAS B3
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Dashboard Keselamatan (HSE) & Risiko Armada
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring integritas tangki gas, sistem pengereman, kebocoran pipa, dan kepatuhan servis berkala
          </p>
        </div>
        <PeriodSelector />
      </div>

      {/* Primary Indicator Banner: GREEN / YELLOW / RED (Requirement 34) */}
      <div className={`p-5 rounded-2xl border-2 shadow-sm ${curTheme.bannerBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${curTheme.bg} flex items-center justify-center text-white font-black text-lg shadow-md animate-pulse`}>
            {overallSafety === 'RED' ? '⚠️' : overallSafety === 'YELLOW' ? '⚡' : '🛡️'}
          </div>
          <div>
            <h2 className={`text-base font-black tracking-tight ${curTheme.text}`}>
              {curTheme.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {curTheme.desc}
            </p>
          </div>
        </div>

        {/* 3 Indicators Visual Lights */}
        <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 mr-2">Indikator HSE:</div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className={`flex items-center gap-1.5 ${overallSafety === 'GREEN' ? 'text-emerald-600 scale-105' : 'text-slate-300 dark:text-slate-600 opacity-40'}`}>
              <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-200 dark:ring-emerald-950" /> NORMAL
            </span>
            <span className={`flex items-center gap-1.5 ${overallSafety === 'YELLOW' ? 'text-amber-600 scale-105' : 'text-slate-300 dark:text-slate-600 opacity-40'}`}>
              <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-200 dark:ring-amber-950" /> ATTENTION
            </span>
            <span className={`flex items-center gap-1.5 ${overallSafety === 'RED' ? 'text-rose-600 scale-105' : 'text-slate-300 dark:text-slate-600 opacity-40'}`}>
              <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-200 dark:ring-rose-950 animate-ping" /> CRITICAL
            </span>
          </div>
        </div>
      </div>

      {/* 8 HSE KPI Cards (Requirement 34) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Jumlah unit bermasalah */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Bermasalah</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{kpis.totalProblemUnits}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">dari {units.length} total unit</div>
        </div>

        {/* Critical issue */}
        <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-rose-600">Critical Issue</div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{criticalCount}</div>
          <div className="text-[10px] text-rose-600/80 mt-0.5">Rem / Valve / Tekanan</div>
        </div>

        {/* Repeat failure */}
        <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-2xl border border-orange-200 dark:border-orange-900 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-orange-600">Repeat Failure</div>
          <div className="text-2xl font-black text-orange-700 dark:text-orange-300 mt-1">{repeatFailureCount}</div>
          <div className="text-[10px] text-orange-600/80 mt-0.5">Masalah berulang</div>
        </div>

        {/* Maintenance overdue */}
        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-amber-600">Overdue</div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{overdueCount}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Lewat jadwal selesai</div>
        </div>

        {/* Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Breakdown Fisik</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{breakdownCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Tidak siap jalan</div>
        </div>

        {/* Service berkala */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Service Berkala</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{serviceBerkalaCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">PM & Kalibrasi</div>
        </div>

        {/* Unit Risiko Tinggi */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Risiko Tinggi</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{highRiskUnits.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Perlu inspeksi HSE</div>
        </div>
      </div>

      {/* High-Risk Units List & Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Unit dengan Risiko Tinggi Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Daftar Unit Armada dalam Pengawasan Khusus HSE
          </h3>
          <div className="space-y-3">
            {highRiskUnits.map((u) => {
              const unitCritCHR = filteredCHRRecords.filter((r) => r.unit === u.nomorPolisi && r.prioritas === 'CRITICAL');
              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUnitForDetail(u.nomorPolisi)}
                  className="p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/50 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900 dark:text-white">{u.nomorPolisi}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {u.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {u.jenisKendaraan} • {u.plant}
                    </div>
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 font-medium">
                      ⚠️ {unitCritCHR.length > 0 ? unitCritCHR[0].uraian.substring(0, 60) + '...' : 'Status Maintenance Aktif'}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 shrink-0 ml-2">
                    Detail Riwayat →
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* HSE Compliance Checklist */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Checklist Kepatuhan & Mitigasi Risiko Transportasi Gas
          </h3>
          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <li className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
              <span className="text-emerald-500 font-bold text-sm">✓</span>
              <div>
                <strong>Uji Hydrotest & Pressure Relief Valve (PRV):</strong> Dilakukan kalibrasi certified master gauge setiap 6 bulan sesuai regulasi SKPP Ditjen Migas.
              </div>
            </li>
            <li className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
              <span className="text-emerald-500 font-bold text-sm">✓</span>
              <div>
                <strong>Grounding Static & Flame Trap:</strong> Seluruh unit pengangkut LPG & CNG wajib memiliki grounding reel fungsional dan arrestor knalpot aktif.
              </div>
            </li>
            <li className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
              <span className="text-amber-500 font-bold text-sm">!</span>
              <div>
                <strong>Prosedur Freeze Emergency Cryogenic:</strong> Penanganan khusus pembekuan globe valve LNG pada suhu minus 162 derajat Celcius tanpa merusak insulating chamber.
              </div>
            </li>
            <li className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
              <span className="text-rose-500 font-bold text-sm">✕</span>
              <div>
                <strong>Toleransi Nol untuk Sistem Rem Drop:</strong> Unit dengan tekanan pneumatik di bawah 6.5 bar dilarang meninggalkan area depot.
              </div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};
