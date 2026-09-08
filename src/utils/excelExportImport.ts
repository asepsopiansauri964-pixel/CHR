import * as XLSX from 'xlsx';
import { CHRRecord, CHRStatus, Priority } from '../types';
import { parseRupiahInput } from './formatters';

export interface ImportPreviewResult {
  records: Omit<CHRRecord, 'id' | 'no' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>[];
  errors: { row: number; reason: string }[];
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  detectedHeaders: string[];
}

function normalizeHeader(str: string): string {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function parseExcelDate(val: any): string | null {
  if (!val) return null;
  if (typeof val === 'number') {
    // Excel serial date to JS date
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  const str = String(val).trim();
  if (!str) return null;

  // Check format DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Check format YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Fallback Date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

export async function parseExcelFile(file: File, existingRecords: CHRRecord[] = []): Promise<ImportPreviewResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to array of arrays
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawData.length === 0) {
    throw new Error('File Excel kosong atau tidak memiliki data.');
  }

  // Find header row (the row that contains keywords like "tanggal" or "uraian" or "unit")
  let headerRowIndex = -1;
  let headers: string[] = [];

  for (let r = 0; r < Math.min(rawData.length, 10); r++) {
    const row = rawData[r];
    const rowStr = row.map((cell) => normalizeHeader(String(cell))).join(' ');
    if (
      rowStr.includes('tanggal') ||
      rowStr.includes('uraian') ||
      rowStr.includes('unit') ||
      rowStr.includes('nopol') ||
      rowStr.includes('mekanik')
    ) {
      headerRowIndex = r;
      headers = row.map((c) => String(c).trim());
      break;
    }
  }

  if (headerRowIndex === -1) {
    // Default to first row
    headerRowIndex = 0;
    headers = rawData[0].map((c) => String(c).trim());
  }

  // Map header indexes
  const colIndex: { [key: string]: number } = {
    tanggalLapor: -1,
    uraian: -1,
    unit: -1,
    plantPelapor: -1,
    tanggalEksekusi: -1,
    mekanik: -1,
    sparepartTindakan: -1,
    nominal: -1,
    keterangan: -1,
    status: -1,
    prioritas: -1,
    kategori: -1,
  };

  headers.forEach((h, idx) => {
    const norm = normalizeHeader(h);
    if (norm.includes('tanggallapor') || norm.includes('tgllapor') || (norm.includes('lapor') && !norm.includes('plant')) || norm === 'tanggal' || norm === 'date') {
      if (colIndex.tanggalLapor === -1) colIndex.tanggalLapor = idx;
    } else if (norm.includes('uraian') || norm.includes('keluhan') || norm.includes('masalah') || norm.includes('kerusakan') || norm.includes('problem')) {
      if (colIndex.uraian === -1) colIndex.uraian = idx;
    } else if (norm.includes('unit') || norm.includes('nopol') || norm.includes('nomorpolisi') || norm.includes('plat') || norm.includes('kendaraan')) {
      if (colIndex.unit === -1) colIndex.unit = idx;
    } else if (norm.includes('plant') || norm.includes('pelapor') || norm.includes('driver') || norm.includes('supir')) {
      if (colIndex.plantPelapor === -1) colIndex.plantPelapor = idx;
    } else if (norm.includes('tanggaleksekusi') || norm.includes('tgleksekusi') || norm.includes('eksekusi') || norm.includes('tglselesai')) {
      if (colIndex.tanggalEksekusi === -1) colIndex.tanggalEksekusi = idx;
    } else if (norm.includes('mekanik') || norm.includes('mechanic') || norm.includes('teknisi')) {
      if (colIndex.mekanik === -1) colIndex.mekanik = idx;
    } else if (norm.includes('sparepart') || norm.includes('tindakan') || norm.includes('perbaikan') || norm.includes('part')) {
      if (colIndex.sparepartTindakan === -1) colIndex.sparepartTindakan = idx;
    } else if (norm.includes('nominal') || norm.includes('biaya') || norm.includes('harga') || norm.includes('cost') || norm.includes('rupiah') || norm.includes('rp')) {
      if (colIndex.nominal === -1) colIndex.nominal = idx;
    } else if (norm.includes('keterangan') || norm.includes('catatan') || norm.includes('note') || norm.includes('ket')) {
      if (colIndex.keterangan === -1) colIndex.keterangan = idx;
    } else if (norm.includes('status')) {
      if (colIndex.status === -1) colIndex.status = idx;
    } else if (norm.includes('prioritas') || norm.includes('priority')) {
      if (colIndex.prioritas === -1) colIndex.prioritas = idx;
    } else if (norm.includes('kategori') || norm.includes('category')) {
      if (colIndex.kategori === -1) colIndex.kategori = idx;
    }
  });

  const parsedRecords: Omit<CHRRecord, 'id' | 'no' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>[] = [];
  const errors: { row: number; reason: string }[] = [];
  let duplicateCount = 0;

  for (let r = headerRowIndex + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!row || row.every((c) => c === null || c === undefined || String(c).trim() === '')) {
      continue; // Skip empty row
    }

    const rowNumber = r + 1;

    const rawTanggalLapor = colIndex.tanggalLapor !== -1 ? row[colIndex.tanggalLapor] : null;
    const rawUraian = colIndex.uraian !== -1 ? String(row[colIndex.uraian] || '').trim() : '';
    const rawUnit = colIndex.unit !== -1 ? String(row[colIndex.unit] || '').trim() : '';
    const rawPlant = colIndex.plantPelapor !== -1 ? String(row[colIndex.plantPelapor] || '').trim() : '';
    const rawTanggalEksekusi = colIndex.tanggalEksekusi !== -1 ? row[colIndex.tanggalEksekusi] : null;
    const rawMekanik = colIndex.mekanik !== -1 ? String(row[colIndex.mekanik] || '').trim() : '';
    const rawSparepart = colIndex.sparepartTindakan !== -1 ? String(row[colIndex.sparepartTindakan] || '').trim() : '';
    const rawNominal = colIndex.nominal !== -1 ? row[colIndex.nominal] : 0;
    const rawKeterangan = colIndex.keterangan !== -1 ? String(row[colIndex.keterangan] || '').trim() : '';
    const rawStatus = colIndex.status !== -1 ? String(row[colIndex.status] || '').trim().toUpperCase() : '';
    const rawPrioritas = colIndex.prioritas !== -1 ? String(row[colIndex.prioritas] || '').trim().toUpperCase() : '';
    const rawKategori = colIndex.kategori !== -1 ? String(row[colIndex.kategori] || '').trim() : '';

    // Validations: Unit, Tanggal Lapor, Uraian are required
    if (!rawUnit) {
      errors.push({ row: rowNumber, reason: 'Nomor Unit kosong' });
      continue;
    }
    if (!rawUraian) {
      errors.push({ row: rowNumber, reason: 'Uraian / Keluhan kosong' });
      continue;
    }

    const tanggalLapor = parseExcelDate(rawTanggalLapor) || new Date().toISOString().split('T')[0];
    const tanggalEksekusi = parseExcelDate(rawTanggalEksekusi);

    // Format nominal
    let nominal = 0;
    if (typeof rawNominal === 'number') {
      nominal = rawNominal;
    } else if (typeof rawNominal === 'string') {
      nominal = parseRupiahInput(rawNominal);
    }

    // Default status handling
    let status: CHRStatus = 'OPEN';
    let isImportedDefault = false;
    if (['OPEN', 'IN PROGRESS', 'WAITING PART', 'COMPLETED', 'CANCELLED'].includes(rawStatus)) {
      status = rawStatus as CHRStatus;
    } else {
      status = 'OPEN';
      isImportedDefault = true;
    }

    // Default priority handling
    let prioritas: Priority = 'MEDIUM';
    if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(rawPrioritas)) {
      prioritas = rawPrioritas as Priority;
    } else {
      // Auto classify based on keywords if not specified
      const lowerUraian = rawUraian.toLowerCase();
      if (lowerUraian.includes('rem') || lowerUraian.includes('bocor') || lowerUraian.includes('gas') || lowerUraian.includes('relief') || lowerUraian.includes('cryogenic')) {
        prioritas = 'CRITICAL';
      } else if (lowerUraian.includes('kopling') || lowerUraian.includes('panas') || lowerUraian.includes('ban') || lowerUraian.includes('interlock')) {
        prioritas = 'HIGH';
      }
    }

    // Default category handling
    let kategori = rawKategori;
    if (!kategori) {
      const lower = (rawUraian + ' ' + rawSparepart).toLowerCase();
      if (lower.includes('rem') || lower.includes('brake') || lower.includes('tromol')) kategori = 'Brake';
      else if (lower.includes('kopling') || lower.includes('clutch')) kategori = 'Clutch';
      else if (lower.includes('ban') || lower.includes('tire') || lower.includes('velg')) kategori = 'Tire/Ban';
      else if (lower.includes('mesin') || lower.includes('engine') || lower.includes('turbo')) kategori = 'Engine';
      else if (lower.includes('oli') || lower.includes('service') || lower.includes('filter')) kategori = 'Service Berkala';
      else if (lower.includes('valve') || lower.includes('selang') || lower.includes('hose') || lower.includes('lpg')) kategori = 'Hydraulic';
      else if (lower.includes('lampu') || lower.includes('kabel') || lower.includes('aki') || lower.includes('sensor')) kategori = 'Electrical';
      else if (lower.includes('radiator') || lower.includes('coolant') || lower.includes('panas')) kategori = 'Cooling System';
      else kategori = 'Other';
    }

    // Duplicate check: same unit, same date, same description
    const isDuplicate = existingRecords.some(
      (ex) =>
        ex.unit.trim().toUpperCase() === rawUnit.toUpperCase() &&
        ex.tanggalLapor === tanggalLapor &&
        ex.uraian.trim().toLowerCase() === rawUraian.toLowerCase()
    );

    if (isDuplicate) {
      duplicateCount++;
      continue;
    }

    parsedRecords.push({
      tanggalLapor,
      uraian: rawUraian,
      unit: rawUnit.toUpperCase(),
      plantPelapor: rawPlant || 'Plant Pusat',
      tanggalEksekusi,
      mekanik: rawMekanik || 'Mekanik Workshop',
      sparepartTindakan: rawSparepart || '-',
      nominal,
      keterangan: rawKeterangan || '',
      status,
      prioritas,
      kategori,
      isImportedDefault,
    });
  }

  return {
    records: parsedRecords,
    errors,
    totalRows: rawData.length - 1 - headerRowIndex,
    validCount: parsedRecords.length,
    duplicateCount,
    detectedHeaders: headers.filter(Boolean),
  };
}

export function exportCHRToExcel(records: CHRRecord[], filename = 'CHR_EXPORT_MAXALMINA.xlsx', sheetTitle = 'Data CHR'): void {
  const exportRows = records.map((r, index) => ({
    'No': index + 1,
    'Tanggal Lapor': r.tanggalLapor,
    'Unit': r.unit,
    'Plant Pelapor / Driver': r.plantPelapor,
    'Uraian Keluhan / Masalah': r.uraian,
    'Kategori': r.kategori,
    'Prioritas': r.prioritas,
    'Tanggal Eksekusi': r.tanggalEksekusi || '-',
    'Mekanik': r.mekanik,
    'Sparepart / Tindakan Perbaikan': r.sparepartTindakan,
    'Nominal (Rp)': r.nominal,
    'Status': r.status,
    'Keterangan': r.keterangan,
    'Dibuat Oleh': r.createdBy,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 14 }, // Tgl Lapor
    { wch: 14 }, // Unit
    { wch: 22 }, // Plant/Driver
    { wch: 45 }, // Uraian
    { wch: 18 }, // Kategori
    { wch: 12 }, // Prioritas
    { wch: 14 }, // Tgl Eksekusi
    { wch: 18 }, // Mekanik
    { wch: 40 }, // Sparepart
    { wch: 16 }, // Nominal
    { wch: 14 }, // Status
    { wch: 30 }, // Keterangan
    { wch: 20 }, // Dibuat
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle.substring(0, 31));

  XLSX.writeFile(workbook, filename);
}

export function generateTemplateExcel(): void {
  const templateRows = [
    {
      'No': 1,
      'Tanggal Lapor': '2026-08-01',
      'Unit': 'B 9780 FYV',
      'Plant Pelapor / Driver': 'Plant Cilegon / Sutrisno',
      'Uraian': 'Tekanan angin kompresor rem drop',
      'Kategori': 'Brake',
      'Prioritas': 'CRITICAL',
      'Tanggal Eksekusi': '2026-08-01',
      'Mekanik': 'Joko Susilo',
      'Sparepart / Tindakan Perbaikan': 'Penggantian selang high pressure kompresor',
      'Nominal': 1850000,
      'Status': 'COMPLETED',
      'Keterangan': 'Uji kebocoran aman',
    },
    {
      'No': 2,
      'Tanggal Lapor': '2026-08-05',
      'Unit': 'B 9123 TEV',
      'Plant Pelapor / Driver': 'Plant Gresik / Bambang',
      'Uraian': 'Service berkala ganti oli & filter',
      'Kategori': 'Service Berkala',
      'Prioritas': 'MEDIUM',
      'Tanggal Eksekusi': '2026-08-05',
      'Mekanik': 'Rudi Hartono',
      'Sparepart / Tindakan Perbaikan': 'Oli Meditran SX 15W-40, Filter oli & solar',
      'Nominal': 4250000,
      'Status': 'COMPLETED',
      'Keterangan': 'Performa mesin normal',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
    { wch: 35 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 35 },
    { wch: 14 },
    { wch: 14 },
    { wch: 25 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_CHR');
  XLSX.writeFile(workbook, 'TEMPLATE_IMPORT_CHR_MAXALMINA.xlsx');
}
