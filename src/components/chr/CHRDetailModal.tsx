import React from 'react';
import {
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  FileText,
  History,
  Printer,
  Shield,
  Truck,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { CHRRecord } from '../../types';
import { formatDateIndo, formatRupiah, getPriorityBadgeClass, getStatusBadgeClass } from '../../utils/formatters';
import { exportSingleCHRPDF } from '../../utils/pdfExport';
import { useApp } from '../../context/AppContext';

interface CHRDetailModalProps {
  record: CHRRecord | null;
  onClose: () => void;
  onEdit: (record: CHRRecord) => void;
}

export const CHRDetailModal: React.FC<CHRDetailModalProps> = ({
  record,
  onClose,
  onEdit,
}) => {
  const { currentRole, setSelectedUnitForDetail } = useApp();

  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 my-8 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                MAXALMINA CHR DOCUMENT
              </span>
              <span className="text-[10px] text-slate-400">ID: {record.id.substring(0, 8)}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <span>Work Order Kendaraan:</span>
              <button
                onClick={() => {
                  setSelectedUnitForDetail(record.unit);
                  onClose();
                }}
                className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                title="Buka Histori Lengkap Unit"
              >
                <Truck className="w-5 h-5" />
                <span>{record.unit}</span>
              </button>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSingleCHRPDF(record)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Unduh Lembar Kerja PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Cetak Langsung"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-6 pt-4 text-xs">
          
          {/* Status & Priority Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Status Pekerjaan</span>
                <span className={getStatusBadgeClass(record.status)}>{record.status}</span>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Prioritas Kerusakan</span>
                <span className={getPriorityBadgeClass(record.prioritas)}>{record.prioritas}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Total Biaya Perbaikan</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {formatRupiah(record.nominal)}
              </span>
            </div>
          </div>

          {/* Grid Meta Information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Driver / Pelapor</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{record.driver}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Plant / Lokasi</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{record.plantPelapor}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Kategori Kerusakan</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{record.kategori}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Teknisi / Mekanik</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{record.mekanik}</p>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Jejak Waktu Pengerjaan (Timeline)
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Tanggal Lapor</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatDateIndo(record.tanggalLapor)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Tanggal Eksekusi</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {record.tanggalEksekusi ? formatDateIndo(record.tanggalEksekusi) : '-'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Tanggal Selesai</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {record.tanggalSelesai ? formatDateIndo(record.tanggalSelesai) : 'Dalam Proses'}
                </span>
              </div>
            </div>
          </div>

          {/* Uraian Masalah */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Deskripsi Keluhan & Gejala Kerusakan:</span>
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {record.uraian}
            </div>
          </div>

          {/* Tindakan Perbaikan */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tindakan Perbaikan & Solusi Bengkel:</span>
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {record.tindakan || 'Belum ada catatan tindakan dari teknisi.'}
            </div>
          </div>

          {/* Sparepart */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-sky-500" />
              <span>Sparepart & Suku Cadang Terpasang:</span>
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold">
              {record.sparepartTindakan || '-'}
            </div>
          </div>

          {/* Audit Metadata */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex flex-wrap justify-between gap-2">
            <span>Dibuat: {new Date(record.createdAt).toLocaleString('id-ID')}</span>
            <span>Diperbarui: {new Date(record.updatedAt).toLocaleString('id-ID')}</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedUnitForDetail(record.unit);
              onClose();
            }}
            className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
          >
            <History className="w-3.5 h-3.5" />
            <span>Lihat Semua Riwayat Unit {record.unit}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Tutup
            </button>
            {currentRole !== 'VIEWER' && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(record);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Data CHR</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
