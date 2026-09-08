import { CHRRecord, Priority, CHRStatus, UnitStatus } from '../types';

export function formatRupiah(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

export function parseRupiahInput(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export function formatDateIndo(dateStr: string | null | undefined, includeTime = false): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year} ${hours}:${mins}`;
    }
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function isOverdue(record: CHRRecord, referenceDate = '2026-09-08'): boolean {
  if (record.status === 'COMPLETED' || record.status === 'CANCELLED') return false;
  
  // If tanggal eksekusi is specified and already past referenceDate
  if (record.tanggalEksekusi) {
    return record.tanggalEksekusi < referenceDate;
  }
  
  // If lapor > 5 days ago and still open
  if (record.tanggalLapor) {
    const laporTime = new Date(record.tanggalLapor).getTime();
    const refTime = new Date(referenceDate).getTime();
    const diffDays = Math.floor((refTime - laporTime) / (1000 * 60 * 60 * 24));
    return diffDays > 3;
  }
  
  return false;
}

export function getPriorityBadgeClass(priority: Priority): string {
  switch (priority) {
    case 'LOW':
      return 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    case 'MEDIUM':
      return 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    case 'HIGH':
      return 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300';
    case 'CRITICAL':
      return 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse';
    default:
      return 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800';
  }
}

export function getStatusBadgeClass(status: CHRStatus): string {
  switch (status) {
    case 'OPEN':
      return 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    case 'IN PROGRESS':
      return 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
    case 'WAITING PART':
      return 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    case 'COMPLETED':
      return 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    case 'CANCELLED':
      return 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    default:
      return 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800';
  }
}

export function getPriorityBadge(priority: Priority): { label: string; bg: string; text: string; border: string } {
  switch (priority) {
    case 'LOW':
      return { label: 'LOW', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'MEDIUM':
      return { label: 'MEDIUM', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
    case 'HIGH':
      return { label: 'HIGH', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' };
    case 'CRITICAL':
      return { label: 'CRITICAL', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800' };
    default:
      return { label: priority, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

export function getStatusBadge(status: CHRStatus): { label: string; bg: string; text: string; dot: string } {
  switch (status) {
    case 'OPEN':
      return { label: 'OPEN', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' };
    case 'IN PROGRESS':
      return { label: 'IN PROGRESS', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' };
    case 'WAITING PART':
      return { label: 'WAITING PART', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' };
    case 'COMPLETED':
      return { label: 'COMPLETED', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' };
    case 'CANCELLED':
      return { label: 'CANCELLED', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' };
    default:
      return { label: status, bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' };
  }
}

export function getUnitStatusBadge(status: UnitStatus): { label: string; bg: string; text: string } {
  switch (status) {
    case 'ACTIVE':
      return { label: 'ACTIVE', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300', text: 'text-emerald-700' };
    case 'MAINTENANCE':
      return { label: 'MAINTENANCE', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300', text: 'text-amber-700' };
    case 'OUT OF SERVICE':
      return { label: 'OUT OF SERVICE', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300', text: 'text-rose-700' };
    case 'SOLD':
      return { label: 'SOLD', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', text: 'text-slate-600' };
    default:
      return { label: status, bg: 'bg-slate-100 text-slate-800', text: 'text-slate-600' };
  }
}
