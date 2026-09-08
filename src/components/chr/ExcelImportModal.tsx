import React, { useState, useRef } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Upload,
  X,
} from 'lucide-react';
import { parseExcelFile, ImportPreviewResult } from '../../utils/excelExportImport';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { chrRecords, importFromExcel } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Format file tidak didukung. Harap unggah file .xlsx, .xls, atau .csv');
      return;
    }
    setFile(selectedFile);
    setIsLoading(true);
    try {
      const res = await parseExcelFile(selectedFile, chrRecords);
      setPreviewResult(res);
    } catch (err: any) {
      alert(`Gagal membaca file Excel: ${err.message || 'Format tidak valid'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!previewResult || previewResult.records.length === 0) return;
    importFromExcel(previewResult.records as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full p-6 my-8 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Import File Excel CHR (Customer History Report)
              </h2>
              <p className="text-xs text-slate-500">
                Otomatis mengenali kolom CHR AGUSTUS.xlsx, mendeteksi duplikat, dan memvalidasi tipe data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="mt-6 space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition ${
              dragOver
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {file ? file.name : 'Tarik & Letakkan file Excel CHR di sini, atau klik untuk memilih file'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Mendukung file format: .xlsx, .xls, .csv (contoh: CHR AGUSTUS.xlsx)
            </p>
          </div>

          {isLoading && (
            <div className="text-center py-6 text-xs text-slate-500 font-semibold animate-pulse">
              Sedang memproses dan memvalidasi struktur kolom file Excel...
            </div>
          )}

          {/* Validation & Preview Summary */}
          {previewResult && (
            <div className="space-y-4">
              
              {/* Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">TOTAL BARIS TERDETEKSI</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{previewResult.totalRows}</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-bold">DATA VALID SIAP IMPORT</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{previewResult.validCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 block font-bold">DUPLIKAT DILEWATI</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">{previewResult.duplicateCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 block font-bold">BARIS ERROR</span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400">{previewResult.errors.length}</span>
                </div>
              </div>

              {/* Detected Headers */}
              {previewResult.detectedHeaders.length > 0 && (
                <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Kolom Dikenali:</span>{' '}
                  {previewResult.detectedHeaders.join(', ')}
                </div>
              )}

              {/* Preview Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300">
                  Preview Data Valid (Maksimal 5 baris pertama)
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-2.5">Tanggal Lapor</th>
                        <th className="p-2.5">Unit</th>
                        <th className="p-2.5">Driver</th>
                        <th className="p-2.5">Kategori</th>
                        <th className="p-2.5">Uraian</th>
                        <th className="p-2.5">Biaya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {previewResult.records.slice(0, 5).map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 whitespace-nowrap text-slate-500">{r.tanggalLapor}</td>
                          <td className="p-2.5 whitespace-nowrap font-bold text-slate-900 dark:text-white">{r.unit}</td>
                          <td className="p-2.5 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.driver}</td>
                          <td className="p-2.5 whitespace-nowrap">{r.kategori}</td>
                          <td className="p-2.5 truncate max-w-xs text-slate-700 dark:text-slate-300">{r.uraian}</td>
                          <td className="p-2.5 whitespace-nowrap font-bold text-emerald-600">{formatRupiah(r.nominal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!previewResult || previewResult.validCount === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan {previewResult?.validCount || 0} Data ke Database</span>
          </button>
        </div>

      </div>
    </div>
  );
};
