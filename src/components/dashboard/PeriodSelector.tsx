import React, { useState } from 'react';
import { Calendar, ChevronDown, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PeriodFilter } from '../../types';

export const PeriodSelector: React.FC = () => {
  const { periodFilter, setPeriodFilter, customDateRange, setCustomDateRange } = useApp();
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [tempStart, setTempStart] = useState(customDateRange.startDate);
  const [tempEnd, setTempEnd] = useState(customDateRange.endDate);

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: 'THIS_MONTH', label: 'Bulan Ini (Agu 2026)' },
    { id: 'THIS_WEEK', label: 'Minggu Ini' },
    { id: 'TODAY', label: 'Hari Ini' },
    { id: 'LAST_MONTH', label: 'Bulan Lalu' },
    { id: 'THIS_YEAR', label: 'Tahun 2026' },
    { id: 'ALL', label: 'Semua Periode' },
    { id: 'CUSTOM', label: 'Custom Range...' },
  ];

  const handlePeriodChange = (p: PeriodFilter) => {
    if (p === 'CUSTOM') {
      setShowCustomModal(true);
    } else {
      setPeriodFilter(p);
    }
  };

  const applyCustomRange = () => {
    if (tempStart && tempEnd) {
      setCustomDateRange({ startDate: tempStart, endDate: tempEnd });
      setPeriodFilter('CUSTOM');
      setShowCustomModal(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
        <Filter className="w-3.5 h-3.5 text-sky-600" />
        <span>Periode:</span>
      </div>

      <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {periods.map((p) => {
          const isSelected = periodFilter === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handlePeriodChange(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {periodFilter === 'CUSTOM' && (
        <span className="text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
          {customDateRange.startDate} s/d {customDateRange.endDate}
        </span>
      )}

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              Pilih Rentang Tanggal
            </h3>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={applyCustomRange}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
