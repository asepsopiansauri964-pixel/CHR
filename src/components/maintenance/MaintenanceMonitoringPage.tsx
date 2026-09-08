import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Package,
  Plus,
  Truck,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CHRRecord, CHRStatus } from '../../types';
import { formatDateIndo, formatRupiah, getPriorityBadgeClass, getStatusBadgeClass, isOverdue } from '../../utils/formatters';

interface MaintenanceMonitoringPageProps {
  onOpenAddModal: () => void;
  onOpenDetailModal: (r: CHRRecord) => void;
}

export const MaintenanceMonitoringPage: React.FC<MaintenanceMonitoringPageProps> = ({
  onOpenAddModal,
  onOpenDetailModal,
}) => {
  const { filteredCHRRecords, quickUpdateStatus, currentRole, setSelectedUnitForDetail } = useApp();
  const [filterTab, setFilterTab] = useState<'ALL' | 'OVERDUE' | 'WAITING_PART' | 'IN_PROGRESS' | 'OPEN'>('ALL');

  const records = filteredCHRRecords.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');

  const overdueRecords = records.filter(isOverdue);
  const waitingPartRecords = records.filter((r) => r.status === 'WAITING PART');
  const inProgressRecords = records.filter((r) => r.status === 'IN PROGRESS');
  const openRecords = records.filter((r) => r.status === 'OPEN');

  const displayed =
    filterTab === 'OVERDUE'
      ? overdueRecords
      : filterTab === 'WAITING_PART'
      ? waitingPartRecords
      : filterTab === 'IN_PROGRESS'
      ? inProgressRecords
      : filterTab === 'OPEN'
      ? openRecords
      : records;

  const canEdit = currentRole !== 'VIEWER';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            FLEET SERVICE TRACKER
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Monitoring Maintenance & Jadwal Perbaikan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau pekerjaan aktif, penanganan suku cadang, dan pekerjaan tertunda (overdue) armada gas
          </p>
        </div>

        {canEdit && (
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Jadwalkan Servis Baru</span>
          </button>
        )}
      </div>

      {/* 4 Summary Cards (Requirement 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Overdue Card */}
        <div
          onClick={() => setFilterTab('OVERDUE')}
          className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
            filterTab === 'OVERDUE'
              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[10px] font-black uppercase">Pekerjaan Overdue</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-600">{overdueRecords.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Melewati batas eksekusi</p>
        </div>

        {/* Waiting Part Card */}
        <div
          onClick={() => setFilterTab('WAITING_PART')}
          className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
            filterTab === 'WAITING_PART'
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[10px] font-black uppercase">Waiting Part</span>
            <Package className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-600">{waitingPartRecords.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Menunggu suku cadang</p>
        </div>

        {/* In Progress Card */}
        <div
          onClick={() => setFilterTab('IN_PROGRESS')}
          className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
            filterTab === 'IN_PROGRESS'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-[10px] font-black uppercase">In Progress</span>
            <Wrench className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{inProgressRecords.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Sedang dikerjakan teknisi</p>
        </div>

        {/* Open Card */}
        <div
          onClick={() => setFilterTab('OPEN')}
          className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
            filterTab === 'OPEN'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-[10px] font-black uppercase">Open (Antrian)</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-blue-600">{openRecords.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Belum dimulai</p>
        </div>

      </div>

      {/* Tabs bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400">Filter Tampilan:</span>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterTab === 'ALL' ? 'bg-white dark:bg-slate-900 text-sky-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Semua Aktif ({records.length})
          </button>
          <button
            onClick={() => setFilterTab('OVERDUE')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterTab === 'OVERDUE' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Overdue ({overdueRecords.length})
          </button>
          <button
            onClick={() => setFilterTab('WAITING_PART')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterTab === 'WAITING_PART' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Waiting Part ({waitingPartRecords.length})
          </button>
          <button
            onClick={() => setFilterTab('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterTab === 'IN_PROGRESS' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            In Progress ({inProgressRecords.length})
          </button>
        </div>
      </div>

      {/* Monitoring Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayed.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Tidak ada pekerjaan pada kategori ini.
            </p>
            <p className="text-xs mt-1">Seluruh armada dalam kategori ini telah selesai ditangani.</p>
          </div>
        ) : (
          displayed.map((r) => {
            const overdue = isOverdue(r);
            return (
              <div
                key={r.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition ${
                  overdue
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-sky-300'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setSelectedUnitForDetail(r.unit)}
                      className="font-black text-sm text-slate-900 dark:text-white hover:text-sky-600 flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4 text-slate-400" />
                      <span>{r.unit}</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className={getPriorityBadgeClass(r.prioritas)}>{r.prioritas}</span>
                      <span className={getStatusBadgeClass(r.status)}>{r.status}</span>
                    </div>
                  </div>

                  {overdue && (
                    <div className="mb-2 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>PERINGATAN: Pekerjaan Melewati Batas Jadwal!</span>
                    </div>
                  )}

                  {/* Category & Problem */}
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                    {r.kategori}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed mb-3 line-clamp-2">
                    {r.uraian}
                  </p>

                  {/* Sparepart & Action */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs space-y-1 mb-3">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Tindakan:</span> {r.tindakan || 'Menunggu diagnosis teknisi'}
                    </div>
                    {r.sparepartTindakan && r.sparepartTindakan !== '-' && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                        Part: {r.sparepartTindakan}
                      </div>
                    )}
                  </div>

                  {/* Dates & Mechanic */}
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>Lapor: <span className="text-slate-600 dark:text-slate-300 font-semibold">{r.tanggalLapor}</span></div>
                    <div>Mekanik: <span className="text-slate-600 dark:text-slate-300 font-semibold">{r.mekanik}</span></div>
                  </div>
                </div>

                {/* Bottom Quick Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onOpenDetailModal(r)}
                    className="text-xs font-semibold text-sky-600 hover:underline"
                  >
                    Detail Lengkap →
                  </button>

                  {canEdit && (
                    <div className="flex items-center gap-1">
                      {r.status === 'OPEN' && (
                        <button
                          onClick={() => quickUpdateStatus(r.id, 'IN PROGRESS')}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          Mulai Servis
                        </button>
                      )}
                      {r.status === 'IN PROGRESS' && (
                        <button
                          onClick={() => quickUpdateStatus(r.id, 'WAITING PART')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          Tunggu Part
                        </button>
                      )}
                      <button
                        onClick={() => quickUpdateStatus(r.id, 'COMPLETED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selesai</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
