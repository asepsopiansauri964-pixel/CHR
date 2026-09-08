import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CHRRecord, KPISummary } from '../types';
import { formatDateIndo, formatRupiah } from './formatters';

export function exportCHRToPDF(
  records: CHRRecord[],
  title = 'CUSTOMER HISTORY REPORT (CHR)',
  periodLabel = 'Agustus 2026',
  kpi?: Partial<KPISummary>
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(2, 132, 199); // sky-600
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('PT. MAXALMINA', 14, 12);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('TRANSPORTASI GAS & FLEET MANAGEMENT SYSTEM', 14, 18);
  doc.text('Customer History Report (CHR) & Maintenance Log', 14, 23);

  // Title on Right side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(title.toUpperCase(), pageWidth - 14, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(186, 230, 253);
  doc.text(`Periode Laporan: ${periodLabel}`, pageWidth - 14, 18, { align: 'right' });
  doc.text(`Dicetak: ${formatDateIndo(new Date().toISOString(), true)}`, pageWidth - 14, 23, { align: 'right' });

  // Summary Metrics Box
  let startY = 35;
  const totalRecords = records.length;
  const uniqueUnits = new Set(records.map((r) => r.unit)).size;
  const totalCost = records.reduce((acc, r) => acc + (r.nominal || 0), 0);
  const completed = records.filter((r) => r.status === 'COMPLETED').length;
  const openCount = records.filter((r) => r.status === 'OPEN').length;
  const inProgress = records.filter((r) => r.status === 'IN PROGRESS').length;
  const critical = records.filter((r) => r.prioritas === 'CRITICAL').length;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, startY, pageWidth - 28, 16, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('RINGKASAN LAPORAN:', 18, startY + 5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);

  const colW = (pageWidth - 36) / 6;
  doc.text(`Total CHR: ${totalRecords}`, 18, startY + 11);
  doc.text(`Unit Terkait: ${uniqueUnits}`, 18 + colW, startY + 11);
  doc.text(`Total Biaya: ${formatRupiah(totalCost)}`, 18 + colW * 2, startY + 11);

  doc.setTextColor(16, 185, 129); // green
  doc.text(`Completed: ${completed}`, 18 + colW * 3.5, startY + 11);

  doc.setTextColor(239, 68, 68); // red
  doc.text(`Open: ${openCount} | Critical: ${critical}`, 18 + colW * 4.6, startY + 11);

  // Table
  const tableData = records.map((r, i) => [
    i + 1,
    r.tanggalLapor,
    r.unit,
    r.plantPelapor,
    r.uraian,
    r.kategori,
    r.prioritas,
    r.mekanik,
    r.tanggalEksekusi || '-',
    formatRupiah(r.nominal),
    r.status,
  ]);

  autoTable(doc, {
    startY: startY + 20,
    head: [[
      'No', 'Tgl Lapor', 'Unit', 'Plant / Driver', 'Uraian Keluhan & Kerusakan',
      'Kategori', 'Prioritas', 'Mekanik', 'Tgl Selesai', 'Biaya (Rp)', 'Status'
    ]],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      overflow: 'linebreak',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 20, fontStyle: 'bold' },
      3: { cellWidth: 26 },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 20 },
      6: { cellWidth: 16, halign: 'center' },
      7: { cellWidth: 22 },
      8: { cellWidth: 18, halign: 'center' },
      9: { cellWidth: 22, halign: 'right' },
      10: { cellWidth: 20, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (data) => {
      // Footer on each page
      const pageCount = (doc.internal as any).getNumberOfPages();
      const currentPage = (doc.internal as any).getCurrentPageInfo().pageNumber;

      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'PT. MAXALMINA – Dokumen Resmi Divisi Fleet & HSE Management • Kerahasiaan Perusahaan Dijaga',
        14,
        doc.internal.pageSize.getHeight() - 6
      );
      doc.text(
        `Halaman ${currentPage} dari ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'right' }
      );
    },
  });

  doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}_PT_MAXALMINA.pdf`);
}

export const exportCHRListPDF = exportCHRToPDF;

export function exportSingleCHRPDF(record: CHRRecord): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(2, 132, 199);
  doc.rect(0, 28, pageWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('PT. MAXALMINA', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text('LEMBAR PERINTAH KERJA & RIWAYAT PERBAIKAN (WORK ORDER SLIP)', 14, 19);
  doc.text(`NO. DOKUMEN: WO-CHR-${record.id.substring(0, 8).toUpperCase()}`, 14, 24);

  let y = 38;
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI KENDARAAN & PELAPORAN', 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Parameter', 'Detail Keterangan']],
    body: [
      ['Nomor Unit (Plat)', record.unit],
      ['Plant / Lokasi Pelapor', record.plantPelapor],
      ['Driver Pelapor', record.driver || '-'],
      ['Tanggal Lapor', formatDateIndo(record.tanggalLapor)],
      ['Tanggal Eksekusi', record.tanggalEksekusi ? formatDateIndo(record.tanggalEksekusi) : '-'],
      ['Status Perbaikan', record.status],
      ['Tingkat Prioritas', record.prioritas],
      ['Kategori Kerusakan', record.kategori],
      ['Mekanik Penanggung Jawab', record.mekanik],
      ['Estimasi / Nominal Biaya', formatRupiah(record.nominal)],
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('URAIAN MASALAH / KELUHAN DRIVER', 14, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const uraianLines = doc.splitTextToSize(record.uraian, pageWidth - 28);
  doc.text(uraianLines, 14, y);
  y += uraianLines.length * 5 + 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TINDAKAN PERBAIKAN & PENANGANAN MEKANIK', 14, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const tindakanLines = doc.splitTextToSize(record.tindakan || 'Sedang dalam penanganan.', pageWidth - 28);
  doc.text(tindakanLines, 14, y);
  y += tindakanLines.length * 5 + 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SUKU CADANG / SPAREPART YANG DIGUNAKAN', 14, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(record.sparepartTindakan || '-', 14, y);
  y += 18;

  // Signature approvals
  const signY = Math.max(y, 220);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Driver Pelapor,', 25, signY);
  doc.text('Mekanik Teknisi,', 90, signY);
  doc.text('HSE / Fleet Manager,', 150, signY);

  doc.line(20, signY + 25, 60, signY + 25);
  doc.line(85, signY + 25, 125, signY + 25);
  doc.line(145, signY + 25, 185, signY + 25);

  doc.setFont('helvetica', 'normal');
  doc.text(`( ${record.driver || 'Driver'} )`, 25, signY + 30);
  doc.text(`( ${record.mekanik || 'Mekanik'} )`, 90, signY + 30);
  doc.text('( Safety / Fleet Officer )', 145, signY + 30);

  doc.save(`WORK_ORDER_${record.unit.replace(/\s+/g, '_')}_${record.id.substring(0, 6)}.pdf`);
}

export function exportUnitHistoryPDF(unitInfo: any, records: CHRRecord[]): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(2, 132, 199);
  doc.rect(0, 28, pageWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('PT. MAXALMINA', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225);
  doc.text(`LEMBAR RIWAYAT HISTORI PERBAIKAN UNIT: ${unitInfo.nomorPolisi}`, 14, 19);
  doc.text(`Spesifikasi: ${unitInfo.jenisKendaraan || '-'} | Base: ${unitInfo.plant || '-'}`, 14, 24);

  const totalCost = records.reduce((s, r) => s + (r.nominal || 0), 0);

  autoTable(doc, {
    startY: 36,
    head: [['No', 'Tgl Lapor', 'Driver', 'Kategori', 'Uraian Masalah', 'Tindakan & Sparepart', 'Mekanik', 'Biaya (Rp)', 'Status']],
    body: records.map((r, i) => [
      i + 1,
      r.tanggalLapor,
      r.driver || '-',
      r.kategori,
      r.uraian,
      r.tindakan || '-',
      r.mekanik,
      formatRupiah(r.nominal),
      r.status,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2 },
  });

  doc.save(`HISTORI_UNIT_${unitInfo.nomorPolisi.replace(/\s+/g, '_')}.pdf`);
}

export function exportComprehensivePDFReport(params: {
  title: string;
  periodText: string;
  records: CHRRecord[];
  totalCost: number;
  plantName?: string;
}): void {
  exportCHRToPDF(params.records, params.title, params.periodText);
}
