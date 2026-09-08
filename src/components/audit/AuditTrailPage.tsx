import React, { useState } from 'react';
import {
  Clock,
  Filter,
  History,
  Info,
  Search,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditTrailPage: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filtered = auditLogs.filter((log) => {
    const matchSearch =
      log.targetId.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            SYSTEM ACCOUNTABILITY
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Audit Trail & Log Perubahan Data
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak setiap pembuatan, perubahan status, pengeditan nilai, dan penghapusan data operasional
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {auditLogs.length} Total Rekaman Log
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID data, nama user, detail perubahan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
        >
          <option value="ALL">Semua Aksi</option>
          <option value="CREATE">CREATE (Tambah Data)</option>
          <option value="UPDATE">UPDATE (Edit Data)</option>
          <option value="STATUS_CHANGE">STATUS_CHANGE (Status)</option>
          <option value="DELETE">DELETE (Hapus)</option>
          <option value="IMPORT_EXCEL">IMPORT_EXCEL (Import)</option>
        </select>
      </div>

      {/* Log Timeline List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Belum ada data riwayat aktivitas yang sesuai pencarian.
            </div>
          ) : (
            filtered.map((log) => {
              const isCreate = log.action === 'CREATE';
              const isDelete = log.action === 'DELETE';
              const isStatus = log.action === 'STATUS_CHANGE';
              const isImport = log.action === 'IMPORT_EXCEL';

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition flex items-start gap-4 text-xs"
                >
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      isDelete
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                        : isCreate
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                        : isStatus
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600'
                        : isImport
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                        : 'bg-sky-100 dark:bg-sky-950 text-sky-600'
                    }`}
                  >
                    <History className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            isDelete
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
                              : isCreate
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                              : isStatus
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{log.entity}</span>
                        <span className="text-[10px] text-slate-400 font-mono">[{log.targetId.substring(0, 8)}]</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {log.details}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                      <User className="w-3 h-3" />
                      <span>Pelaku: {log.user} ({log.role})</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
