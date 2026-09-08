import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit2,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  MoreVertical,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  Truck,
  Wrench,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CHRRecord, CHRStatus, PriorityLevel } from '../../types';
import {
  formatDateIndo,
  formatRupiah,
  getPriorityBadgeClass,
  getStatusBadgeClass,
  isOverdue,
} from '../../utils/formatters';
import { exportCHRToExcel } from '../../utils/excelExportImport';
import { exportCHRListPDF } from '../../utils/pdfExport';
import { ConfirmModal } from '../common/ConfirmModal';

interface CHRTableProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (record: CHRRecord) => void;
  onOpenDetailModal: (record: CHRRecord) => void;
}

export const CHRTable: React.FC<CHRTableProps> = ({
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailModal,
}) => {
  const {
    filteredCHRRecords,
    units,
    mechanics,
    categories,
    deleteCHRRecord,
    quickUpdateStatus,
    currentRole,
    setSelectedUnitForDetail,
    searchFilter,
    setSearchFilter,
    unitFilter,
    setUnitFilter,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    mechanicFilter,
    setMechanicFilter,
    plantFilter,
    setPlantFilter,
    resetFilters,
  } = useApp();

  // Sorting state
  const [sortField, setSortField] = useState<keyof CHRRecord>('tanggalLapor');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Active action menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Delete confirmation
  const [recordToDelete, setRecordToDelete] = useState<CHRRecord | null>(null);

  // Sorting handler
  const handleSort = (field: keyof CHRRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Sorted records
  const sortedRecords = useMemo(() => {
    return [...filteredCHRRecords].sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredCHRRecords, sortField, sortOrder]);

  // Paginated records
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRecords.slice(start, start + itemsPerPage);
  }, [sortedRecords, currentPage, itemsPerPage]);

  const hasActiveFilters =
    searchFilter !== '' ||
    unitFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    mechanicFilter !== 'ALL' ||
    plantFilter !== 'ALL';

  const canEdit = currentRole !== 'VIEWER';
  const canDelete = ['ADMIN', 'HSE'].includes(currentRole);

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Title and Top Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
              CUSTOMER HISTORY REPORT
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              Data Seluruh Laporan CHR
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pencarian, pemantauan, status pengerjaan, tindakan perbaikan, dan biaya suku cadang armada
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah CHR</span>
              </button>
            )}

            <button
              onClick={() => exportCHRToExcel(filteredCHRRecords)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              title="Ekspor ke Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => exportCHRListPDF(filteredCHRRecords, 'Data CHR')}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              title="Ekspor ke PDF"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari berdasarkan Nomor Unit, Uraian Kerusakan, Sparepart, Mekanik, Driver, atau No CHR..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-sky-500"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Unit Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Unit Kendaraan</label>
            <select
              value={unitFilter}
              onChange={(e) => {
                setUnitFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Unit</option>
              {units.map((u) => (
                <option key={u.id} value={u.nomorPolisi}>
                  {u.nomorPolisi} ({u.jenisKendaraan})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="OPEN">Open</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="WAITING PART">Waiting Part</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prioritas</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="CRITICAL">Critical (Darurat)</option>
              <option value="HIGH">High (Tinggi)</option>
              <option value="MEDIUM">Medium (Sedang)</option>
              <option value="LOW">Low (Rendah)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mechanic Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mekanik</label>
            <select
              value={mechanicFilter}
              onChange={(e) => {
                setMechanicFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Mekanik</option>
              {mechanics.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Plant Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Plant Pelapor</label>
            <select
              value={plantFilter}
              onChange={(e) => {
                setPlantFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">Semua Plant</option>
              <option value="Plant Cilegon">Plant Cilegon</option>
              <option value="Plant Marunda">Plant Marunda</option>
              <option value="Plant Balongan">Plant Balongan</option>
              <option value="Plant Gresik">Plant Gresik</option>
              <option value="Plant Palembang">Plant Palembang</option>
            </select>
          </div>

        </div>

        {/* Filter Summary & Reset Button */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Filter aktif menghasilkan <strong className="text-sky-600">{filteredCHRRecords.length}</strong> data
            </span>
            <button
              onClick={() => {
                resetFilters();
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>
        )}

      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th
                  onClick={() => handleSort('tanggalLapor')}
                  className="p-3.5 cursor-pointer hover:text-sky-600 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Tgl Lapor</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unit')}
                  className="p-3.5 cursor-pointer hover:text-sky-600 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Unit Kendaraan</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5 whitespace-nowrap">Driver / Plant</th>
                <th
                  onClick={() => handleSort('kategori')}
                  className="p-3.5 cursor-pointer hover:text-sky-600 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Kategori</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5 min-w-[220px]">Uraian Keluhan</th>
                <th className="p-3.5 min-w-[180px]">Tindakan & Sparepart</th>
                <th className="p-3.5 whitespace-nowrap">Mekanik</th>
                <th
                  onClick={() => handleSort('nominal')}
                  className="p-3.5 cursor-pointer hover:text-sky-600 select-none whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Biaya (Rp)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('prioritas')}
                  className="p-3.5 cursor-pointer hover:text-sky-600 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Prioritas</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="p-3.5 cursor-pointer hover:text-sky-600 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3.5 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">Tidak ada data CHR yang cocok dengan kriteria pencarian.</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau bersihkan filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const overdue = isOverdue(r);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Tanggal Lapor */}
                      <td className="p-3.5 whitespace-nowrap text-slate-500 font-medium">
                        {r.tanggalLapor}
                      </td>

                      {/* Unit Kendaraan */}
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedUnitForDetail(r.unit)}
                          className="font-extrabold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 hover:underline flex items-center gap-1.5"
                          title="Klik untuk melihat histori unit lengkap"
                        >
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.unit}</span>
                        </button>
                        {overdue && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[9px] font-black rounded uppercase animate-pulse">
                            Overdue
                          </span>
                        )}
                      </td>

                      {/* Driver / Plant */}
                      <td className="p-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        <div className="font-semibold">{r.driver}</div>
                        <div className="text-[10px] text-slate-400">{r.plantPelapor}</div>
                      </td>

                      {/* Kategori */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                          {r.kategori}
                        </span>
                      </td>

                      {/* Uraian Keluhan */}
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        <div className="line-clamp-2" title={r.uraian}>
                          {r.uraian}
                        </div>
                      </td>

                      {/* Tindakan & Sparepart */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        <div className="line-clamp-2" title={`${r.tindakan} | Sparepart: ${r.sparepartTindakan}`}>
                          {r.tindakan}
                          {r.sparepartTindakan && r.sparepartTindakan !== '-' && (
                            <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                              Part: {r.sparepartTindakan}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Mekanik */}
                      <td className="p-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                        {r.mekanik}
                      </td>

                      {/* Nominal Biaya */}
                      <td className="p-3.5 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400 text-right">
                        {formatRupiah(r.nominal)}
                      </td>

                      {/* Prioritas */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={getPriorityBadgeClass(r.prioritas)}>
                          {r.prioritas}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={getStatusBadgeClass(r.status)}>
                          {r.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center whitespace-nowrap relative">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenDetailModal(r)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Lihat Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canEdit && (
                            <button
                              onClick={() => onOpenEditModal(r)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Edit Data"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => setRecordToDelete(r)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Hapus Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span>
              Menampilkan{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {filteredCHRRecords.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </strong>{' '}
              s/d{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {Math.min(currentPage * itemsPerPage, filteredCHRRecords.length)}
              </strong>{' '}
              dari <strong className="text-slate-800 dark:text-slate-200">{filteredCHRRecords.length}</strong> record
            </span>

            <div className="flex items-center gap-1.5">
              <span>Baris per halaman:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700 dark:text-slate-300">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <ConfirmModal
          isOpen={true}
          isDanger={true}
          title="Hapus Data CHR?"
          message={`Apakah Anda yakin ingin menghapus data CHR untuk unit ${recordToDelete.unit} (${recordToDelete.tanggalLapor})? Tindakan ini akan dicatat dalam Audit Trail.`}
          confirmLabel="Hapus CHR"
          onConfirm={() => deleteCHRRecord(recordToDelete.id)}
          onCancel={() => setRecordToDelete(null)}
        />
      )}
    </div>
  );
};
