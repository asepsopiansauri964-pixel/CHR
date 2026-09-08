import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Printer,
  Search,
  Truck,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportCHRToExcel } from '../../utils/excelExportImport';
import { exportComprehensivePDFReport } from '../../utils/pdfExport';
import { formatDateIndo, formatRupiah, getStatusBadgeClass } from '../../utils/formatters';

export const ReportsPage: React.FC = () => {
  const { filteredCHRRecords, chrRecords, units, selectedPlant, setSelectedPlant, dateRange, setDateRange } = useApp();

  const [reportType, setReportType] = useState<
    'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'UNIT' | 'CATEGORY' | 'PLANT' | 'COST' | 'MECHANIC'
  >('ALL');

  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Filter records based on reportType selection
  const records = filteredCHRRecords.filter((r) => {
    if (selectedUnit !== 'ALL' && r.unit !== selectedUnit) return false;
    if (selectedCategory !== 'ALL' && r.kategori !== selectedCategory) return false;
    return true;
  });

  const totalCost = records.reduce((s, r) => s + (r.nominal || 0), 0);
  const completedCount = records.filter((r) => r.status === 'COMPLETED').length;
  const inProgressCount = records.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;

  const handleExportPDF = () => {
    exportComprehensivePDFReport({
      title: `Laporan CHR - ${reportType}`,
      periodText: `Periode: ${dateRange.startDate} s/d ${dateRange.endDate}`,
      records,
      totalCost,
      plantName: selectedPlant,
    });
  };

  const handleExportExcel = () => {
    exportCHRToExcel(records, `Laporan_CHR_${reportType}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
            OFFICIAL REPORTING MODULE
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Pusat Laporan Komprehensif CHR
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate laporan resmi operasional, biaya, dan performa armada gas PT. MAXALMINA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Ekspor PDF Resmi</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
            title="Cetak Langsung"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report Type Selector Buttons */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600" />
          <span>Pilih Format Laporan:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs font-bold">
          {[
            { id: 'ALL', label: 'Semua Data' },
            { id: 'DAILY', label: 'Harian' },
            { id: 'WEEKLY', label: 'Mingguan' },
            { id: 'MONTHLY', label: 'Bulanan' },
            { id: 'UNIT', label: 'Per Unit' },
            { id: 'CATEGORY', label: 'Per Kategori' },
            { id: 'PLANT', label: 'Per Plant' },
            { id: 'COST', label: 'Biaya Perawatan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`py-2 px-3 rounded-xl transition text-center ${
                reportType === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters specific to reports */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Filter Unit:</span>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg"
            >
              <option value="ALL">Semua Unit</option>
              {units.map((u) => (
                <option key={u.id} value={u.nomorPolisi}>
                  {u.nomorPolisi}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI of the generated report */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] text-slate-400 uppercase font-bold">Total Baris Laporan</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{records.length} Baris</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] text-emerald-600 uppercase font-bold">Pekerjaan Selesai</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{completedCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] text-amber-600 uppercase font-bold">Masih Berjalan</div>
          <div className="text-2xl font-black text-amber-600 mt-0.5">{inProgressCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] text-emerald-600 uppercase font-bold">Total Akumulasi Biaya</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
            {formatRupiah(totalCost)}
          </div>
        </div>
      </div>

      {/* Report Preview Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
            Preview Laporan Resmi: PT. MAXALMINA ({records.length} Data Terpilih)
          </div>
          <span className="text-[10px] text-slate-400">Dicetak: {new Date().toLocaleDateString('id-ID')}</span>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px] sticky top-0">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">Tanggal Lapor</th>
                <th className="p-3">Nomor Unit</th>
                <th className="p-3">Plant</th>
                <th className="p-3">Driver</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Uraian Kerusakan</th>
                <th className="p-3">Tindakan Bengkel</th>
                <th className="p-3">Mekanik</th>
                <th className="p-3">Biaya</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r, idx) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400">{idx + 1}</td>
                  <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                    {r.tanggalLapor}
                  </td>
                  <td className="p-3 whitespace-nowrap font-black text-slate-900 dark:text-white">{r.unit}</td>
                  <td className="p-3 whitespace-nowrap text-slate-700 dark:text-slate-300">{r.plantPelapor}</td>
                  <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{r.driver}</td>
                  <td className="p-3 whitespace-nowrap font-semibold">{r.kategori}</td>
                  <td className="p-3 max-w-xs text-slate-700 dark:text-slate-300 truncate">{r.uraian}</td>
                  <td className="p-3 max-w-xs text-slate-600 dark:text-slate-400 truncate">{r.tindakan}</td>
                  <td className="p-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{r.mekanik}</td>
                  <td className="p-3 whitespace-nowrap font-bold text-emerald-600">{formatRupiah(r.nominal)}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={getStatusBadgeClass(r.status)}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
