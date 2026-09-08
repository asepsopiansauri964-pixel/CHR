export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PriorityLevel = Priority;

export type CHRStatus = 'OPEN' | 'IN PROGRESS' | 'WAITING PART' | 'COMPLETED' | 'CANCELLED';

export type UnitStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT OF SERVICE' | 'SOLD';

export type UserRole = 'ADMIN' | 'HSE' | 'MAINTENANCE' | 'DISPATCHER' | 'MANAGEMENT' | 'VIEWER';

export interface CHRRecord {
  id: string;
  no: number;
  tanggalLapor: string; // YYYY-MM-DD
  uraian: string; // keluhan / masalah
  unit: string; // Nomor Polisi (e.g., B 9780 FYV)
  plantPelapor: string; // Plant Pelapor or Driver name
  driver?: string; // Optional separated driver name
  tanggalEksekusi: string | null; // YYYY-MM-DD or null
  tanggalSelesai?: string | null; // YYYY-MM-DD or null
  mekanik: string; // Nama mekanik
  sparepartTindakan: string; // Sparepart yang digunakan & tindakan perbaikan
  tindakan?: string; // Optional detailed tindakan note
  nominal: number; // Biaya perbaikan
  keterangan: string; // Keterangan tambahan
  status: CHRStatus;
  prioritas: Priority;
  kategori: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted?: boolean;
  isImportedDefault?: boolean; // Flag if created via initial Excel import default
}

export interface Unit {
  id: string;
  nomorPolisi: string;
  jenisKendaraan: string; // e.g. Skid Tank 15 Ton, Bobtail LPG 8 Ton, Prime Mover Hino 500, Trailer CNG
  merk: string; // Hino, Isuzu, Mitsubishi Fuso, Scania
  tahun: number;
  plant: string;
  status: UnitStatus;
  driverUtama: string;
  kmTerakhir: number;
  tanggalServiceTerakhir: string;
  serviceBerikutnya: string;
  keterangan: string;
}

export interface Driver {
  id: string;
  idDriver: string;
  namaDriver: string;
  unit: string;
  plant: string;
  status: 'ACTIVE' | 'OFF' | 'LEAVE';
  nomorHp: string;
  tanggalBergabung: string;
  keterangan: string;
}

export interface Mechanic {
  id: string;
  idMekanik: string;
  namaMekanik: string;
  spesialisasi: string; // e.g. Mesin Diesel, Sistem Rem & Pneumatik, Elektrikal & Safety, Tangki & Valve Gas
  status: 'ACTIVE' | 'BUSY' | 'LEAVE';
  keterangan: string;
}

export interface DamageCategory {
  id: string;
  name: string;
  description: string;
  defaultPriority?: Priority;
  isSystem?: boolean;
}

export type FailureCategory = DamageCategory;

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'IMPORT' | 'RESTORE';
  entity: 'CHR' | 'UNIT' | 'DRIVER' | 'MECHANIC' | 'CATEGORY' | 'MAINTENANCE';
  entityId: string;
  details: string;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'OVERDUE' | 'WAITING_PART' | 'REPEAT_FAILURE' | 'NEW_CHR';
  isRead: boolean;
  referenceId?: string;
  unit?: string;
}

export type PeriodFilter = 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface CHRFilterState {
  search: string;
  period: PeriodFilter;
  customDateRange: DateRange;
  unit: string;
  plant: string;
  mekanik: string;
  kategori: string;
  status: string;
  prioritas: string;
}

export interface KPISummary {
  totalCHR: number;
  openCount: number;
  inProgressCount: number;
  waitingPartCount: number;
  completedCount: number;
  cancelledCount: number;
  criticalCount: number;
  overdueCount: number;
  totalProblemUnits: number;
  totalCost: number;
  currentMonthCHR: number;
  completionRate: number; // %
  openRate: number; // %
  criticalRate: number; // %
  avgRepairDays: number; // Days
  costPerUnit: number; // Rp
  repeatFailureRate: number; // %
}
