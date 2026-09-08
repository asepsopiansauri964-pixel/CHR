import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AuditLog,
  DamageCategory,
  Driver,
  KPISummary,
  Mechanic,
  PeriodFilter,
  CHRRecord,
  CHRStatus,
  Unit,
  UserRole,
  AppNotification,
  DateRange,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_CHR_RECORDS,
  INITIAL_DRIVERS,
  INITIAL_MECHANICS,
  INITIAL_UNITS,
} from '../data/initialData';
import { isOverdue } from '../utils/formatters';

interface AppContextType {
  // Data state
  chrRecords: CHRRecord[];
  units: Unit[];
  drivers: Driver[];
  mechanics: Mechanic[];
  categories: DamageCategory[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];

  // User & UI
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: string;
  setCurrentUser: (name: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedUnitForDetail: string | null;
  setSelectedUnitForDetail: (unit: string | null) => void;

  // Global filters
  periodFilter: PeriodFilter;
  setPeriodFilter: (p: PeriodFilter) => void;
  customDateRange: DateRange;
  setCustomDateRange: (range: DateRange) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Feedback
  toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

  // CRUD CHR
  addCHR: (record: Omit<CHRRecord, 'id' | 'no' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => void;
  updateCHR: (id: string, updates: Partial<CHRRecord>) => void;
  deleteCHR: (id: string) => void;
  bulkImportCHR: (records: Omit<CHRRecord, 'id' | 'no' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>[]) => void;
  quickUpdateStatus: (id: string, newStatus: CHRStatus) => void;

  // CRUD Unit
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  updateUnit: (id: string, updates: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;

  // CRUD Driver
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;

  // CRUD Mechanic
  addMechanic: (mechanic: Omit<Mechanic, 'id'>) => void;
  updateMechanic: (id: string, updates: Partial<Mechanic>) => void;
  deleteMechanic: (id: string) => void;

  // CRUD Category
  addCategory: (cat: Omit<DamageCategory, 'id'>) => void;
  deleteCategory: (id: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Metrics
  kpis: KPISummary;
  filteredCHRRecords: CHRRecord[];

  // Utilities
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CHR: 'maxalmina_chr_records_v1',
  UNITS: 'maxalmina_units_v1',
  DRIVERS: 'maxalmina_drivers_v1',
  MECHANICS: 'maxalmina_mechanics_v1',
  CATEGORIES: 'maxalmina_categories_v1',
  AUDIT: 'maxalmina_audit_v1',
  ROLE: 'maxalmina_role_v1',
  THEME: 'maxalmina_theme_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or Fallback
  const [chrRecords, setChrRecords] = useState<CHRRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHR);
      return saved ? JSON.parse(saved) : INITIAL_CHR_RECORDS;
    } catch {
      return INITIAL_CHR_RECORDS;
    }
  });

  const [units, setUnits] = useState<Unit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNITS);
      return saved ? JSON.parse(saved) : INITIAL_UNITS;
    } catch {
      return INITIAL_UNITS;
    }
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  const [mechanics, setMechanics] = useState<Mechanic[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MECHANICS);
      return saved ? JSON.parse(saved) : INITIAL_MECHANICS;
    } catch {
      return INITIAL_MECHANICS;
    }
  });

  const [categories, setCategories] = useState<DamageCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'audit-0',
        timestamp: '2026-08-01T08:00:00Z',
        actor: 'Sistem Inisialisasi',
        role: 'ADMIN',
        action: 'IMPORT',
        entity: 'CHR',
        entityId: 'ALL',
        details: 'Inisialisasi database CHR dari file referensi CHR AGUSTUS.xlsx (20 data awal)',
      },
    ];
  });

  // UI state
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      return (saved as UserRole) || 'ADMIN';
    } catch {
      return 'ADMIN';
    }
  });

  const [currentUser, setCurrentUser] = useState<string>('Asep Sopian (Fleet Coordinator)');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) === 'dark';
    } catch {
      return false;
    }
  });

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<string | null>(null);

  // Filters
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('THIS_MONTH'); // Default to August 2026
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    startDate: '2026-08-01',
    endDate: '2026-08-31',
  });
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHR, JSON.stringify(chrRecords));
    } catch {}
  }, [chrRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
    } catch {}
  }, [units]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    } catch {}
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MECHANICS, JSON.stringify(mechanics));
    } catch {}
  }, [mechanics]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
    } catch {}
  }, [currentRole]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const addAuditLog = (
    action: AuditLog['action'],
    entity: AuditLog['entity'],
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actor: currentUser,
      role: currentRole,
      action,
      entity,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  // Filter CHR Records by Period
  const filteredCHRRecords = useMemo(() => {
    const activeRecords = chrRecords.filter((r) => !r.isDeleted);
    const refYear = 2026;
    const refMonth = 8; // August

    return activeRecords.filter((record) => {
      const d = new Date(record.tanggalLapor);
      if (isNaN(d.getTime())) return true;

      if (periodFilter === 'ALL') return true;

      if (periodFilter === 'THIS_MONTH') {
        // August 2026
        return d.getFullYear() === refYear && d.getMonth() + 1 === refMonth;
      }

      if (periodFilter === 'LAST_MONTH') {
        // July 2026
        return d.getFullYear() === refYear && d.getMonth() + 1 === 7;
      }

      if (periodFilter === 'THIS_YEAR') {
        return d.getFullYear() === refYear;
      }

      if (periodFilter === 'TODAY') {
        return record.tanggalLapor === '2026-08-30' || record.tanggalLapor === new Date().toISOString().split('T')[0];
      }

      if (periodFilter === 'THIS_WEEK') {
        return record.tanggalLapor >= '2026-08-24' && record.tanggalLapor <= '2026-08-30';
      }

      if (periodFilter === 'CUSTOM') {
        if (customDateRange.startDate && record.tanggalLapor < customDateRange.startDate) return false;
        if (customDateRange.endDate && record.tanggalLapor > customDateRange.endDate) return false;
        return true;
      }

      return true;
    });
  }, [chrRecords, periodFilter, customDateRange]);

  // Dynamic KPI calculations
  const kpis: KPISummary = useMemo(() => {
    const records = filteredCHRRecords;
    const totalCHR = records.length;

    const openCount = records.filter((r) => r.status === 'OPEN').length;
    const inProgressCount = records.filter((r) => r.status === 'IN PROGRESS').length;
    const waitingPartCount = records.filter((r) => r.status === 'WAITING PART').length;
    const completedCount = records.filter((r) => r.status === 'COMPLETED').length;
    const cancelledCount = records.filter((r) => r.status === 'CANCELLED').length;
    const criticalCount = records.filter((r) => r.prioritas === 'CRITICAL').length;
    const overdueCount = records.filter((r) => isOverdue(r)).length;

    const uniqueProblemUnits = new Set(records.map((r) => r.unit)).size;
    const totalCost = records.reduce((sum, r) => sum + (r.nominal || 0), 0);

    const completionRate = totalCHR > 0 ? (completedCount / totalCHR) * 100 : 0;
    const openRate = totalCHR > 0 ? (openCount / totalCHR) * 100 : 0;
    const criticalRate = totalCHR > 0 ? (criticalCount / totalCHR) * 100 : 0;

    // Average repair days
    let totalRepairDays = 0;
    let completedWithDates = 0;
    records.forEach((r) => {
      if (r.status === 'COMPLETED' && r.tanggalLapor && r.tanggalEksekusi) {
        const lapor = new Date(r.tanggalLapor).getTime();
        const selesai = new Date(r.tanggalEksekusi).getTime();
        const days = Math.max(0, Math.round((selesai - lapor) / (1000 * 60 * 60 * 24)));
        totalRepairDays += days;
        completedWithDates++;
      }
    });
    const avgRepairDays = completedWithDates > 0 ? totalRepairDays / completedWithDates : 1;

    // Maintenance cost per unit
    const costPerUnit = units.length > 0 ? totalCost / units.length : 0;

    // Repeat failure rate
    // Count units that have multiple failures in the same category
    const unitCategoryMap: { [key: string]: number } = {};
    let repeatFailures = 0;
    records.forEach((r) => {
      const key = `${r.unit}___${r.kategori}`;
      unitCategoryMap[key] = (unitCategoryMap[key] || 0) + 1;
      if (unitCategoryMap[key] === 2) {
        repeatFailures++;
      }
    });
    const repeatFailureRate = totalCHR > 0 ? (repeatFailures / totalCHR) * 100 : 0;

    // Current month CHR
    const currentMonthCHR = records.filter((r) => r.tanggalLapor.startsWith('2026-08')).length;

    return {
      totalCHR,
      openCount,
      inProgressCount,
      waitingPartCount,
      completedCount,
      cancelledCount,
      criticalCount,
      overdueCount,
      totalProblemUnits: uniqueProblemUnits,
      totalCost,
      currentMonthCHR,
      completionRate,
      openRate,
      criticalRate,
      avgRepairDays,
      costPerUnit,
      repeatFailureRate,
    };
  }, [filteredCHRRecords, units.length]);

  // Notifications calculation
  const notifications: AppNotification[] = useMemo(() => {
    const list: AppNotification[] = [];
    const active = chrRecords.filter((r) => !r.isDeleted);

    // Critical issues
    active
      .filter((r) => r.prioritas === 'CRITICAL' && r.status !== 'COMPLETED')
      .forEach((r) => {
        list.push({
          id: `notif-crit-${r.id}`,
          timestamp: r.createdAt || new Date().toISOString(),
          title: `Masalah Kritis pada ${r.unit}`,
          message: `${r.uraian.substring(0, 65)}... Kategori: ${r.kategori}`,
          type: 'CRITICAL',
          isRead: false,
          referenceId: r.id,
          unit: r.unit,
        });
      });

    // Overdue tasks
    active
      .filter((r) => isOverdue(r))
      .forEach((r) => {
        list.push({
          id: `notif-overdue-${r.id}`,
          timestamp: r.updatedAt || new Date().toISOString(),
          title: `Maintenance OVERDUE: ${r.unit}`,
          message: `Target selesai ${r.tanggalEksekusi || r.tanggalLapor} telah terlewati. Status: ${r.status}`,
          type: 'OVERDUE',
          isRead: false,
          referenceId: r.id,
          unit: r.unit,
        });
      });

    // Waiting Part
    active
      .filter((r) => r.status === 'WAITING PART')
      .forEach((r) => {
        list.push({
          id: `notif-wait-${r.id}`,
          timestamp: r.updatedAt || new Date().toISOString(),
          title: `Menunggu Sparepart: ${r.unit}`,
          message: `Kebutuhan: ${r.sparepartTindakan.substring(0, 60)}`,
          type: 'WAITING_PART',
          isRead: false,
          referenceId: r.id,
          unit: r.unit,
        });
      });

    // Repeat failure check
    const unitIssues: { [key: string]: CHRRecord[] } = {};
    active.forEach((r) => {
      const key = `${r.unit}-${r.kategori}`;
      unitIssues[key] = unitIssues[key] || [];
      unitIssues[key].push(r);
    });

    Object.entries(unitIssues).forEach(([key, recs]) => {
      if (recs.length >= 2) {
        const [unit, cat] = key.split('-');
        list.push({
          id: `notif-repeat-${key}`,
          timestamp: recs[recs.length - 1].createdAt || new Date().toISOString(),
          title: `Repeat Failure Terdeteksi: ${unit}`,
          message: `Unit mengalami ${recs.length}x masalah berulang pada sistem ${cat}. Perlu evaluasi komprehensif.`,
          type: 'REPEAT_FAILURE',
          isRead: false,
          referenceId: recs[0].id,
          unit,
        });
      }
    });

    return list.slice(0, 15);
  }, [chrRecords]);

  // CRUD Implementations
  const addCHR = (data: Omit<CHRRecord, 'id' | 'no' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    const now = new Date().toISOString();
    const newId = `chr-${Date.now()}`;
    const nextNo = chrRecords.length > 0 ? Math.max(...chrRecords.map((r) => r.no || 0)) + 1 : 1;

    const newRecord: CHRRecord = {
      ...data,
      id: newId,
      no: nextNo,
      createdAt: now,
      updatedAt: now,
      createdBy: currentUser,
      updatedBy: currentUser,
      isDeleted: false,
    };

    setChrRecords((prev) => [newRecord, ...prev]);
    addAuditLog('CREATE', 'CHR', newId, `Menambah CHR untuk unit ${data.unit}: ${data.uraian.substring(0, 45)}`);
    showToast(`Laporan CHR untuk ${data.unit} berhasil disimpan!`, 'success');
  };

  const updateCHR = (id: string, updates: Partial<CHRRecord>) => {
    setChrRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated: CHRRecord = {
            ...r,
            ...updates,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser,
          };
          return updated;
        }
        return r;
      })
    );
    addAuditLog('UPDATE', 'CHR', id, `Mengubah data CHR (${Object.keys(updates).join(', ')})`);
    showToast('Data CHR berhasil diperbarui.', 'success');
  };

  const deleteCHR = (id: string) => {
    const target = chrRecords.find((r) => r.id === id);
    setChrRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isDeleted: true, updatedAt: new Date().toISOString() } : r))
    );
    addAuditLog('DELETE', 'CHR', id, `Soft delete data CHR unit ${target?.unit || id}`);
    showToast('Data CHR berhasil dihapus (Soft Delete).', 'info');
  };

  const bulkImportCHR = (records: Omit<CHRRecord, 'id' | 'no' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>[]) => {
    const now = new Date().toISOString();
    let currentMaxNo = chrRecords.length > 0 ? Math.max(...chrRecords.map((r) => r.no || 0)) : 0;

    const newItems: CHRRecord[] = records.map((r, index) => {
      currentMaxNo++;
      return {
        ...r,
        id: `chr-imp-${Date.now()}-${index}`,
        no: currentMaxNo,
        createdAt: now,
        updatedAt: now,
        createdBy: `${currentUser} (Import Excel)`,
        updatedBy: currentUser,
        isDeleted: false,
      };
    });

    setChrRecords((prev) => [...newItems, ...prev]);
    addAuditLog('IMPORT', 'CHR', 'BATCH', `Berhasil import ${newItems.length} data CHR dari Excel`);
    showToast(`Sukses mengimport ${newItems.length} data CHR ke database!`, 'success');
  };

  const quickUpdateStatus = (id: string, newStatus: CHRStatus) => {
    setChrRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updates: Partial<CHRRecord> = {
            status: newStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser,
          };
          if (newStatus === 'COMPLETED' && !r.tanggalEksekusi) {
            updates.tanggalEksekusi = new Date().toISOString().split('T')[0];
          }
          return { ...r, ...updates };
        }
        return r;
      })
    );
    addAuditLog('STATUS_CHANGE', 'CHR', id, `Status diubah menjadi ${newStatus}`);
    showToast(`Status CHR diubah menjadi ${newStatus}`, 'success');
  };

  // Unit CRUD
  const addUnit = (data: Omit<Unit, 'id'>) => {
    const newUnit: Unit = {
      ...data,
      id: `u-${Date.now()}`,
    };
    setUnits((prev) => [...prev, newUnit]);
    addAuditLog('CREATE', 'UNIT', newUnit.nomorPolisi, `Menambah unit armada ${newUnit.nomorPolisi}`);
    showToast(`Unit ${newUnit.nomorPolisi} berhasil ditambahkan.`, 'success');
  };

  const updateUnit = (id: string, updates: Partial<Unit>) => {
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    addAuditLog('UPDATE', 'UNIT', id, `Memperbarui data unit`);
    showToast(`Data unit berhasil diperbarui.`, 'success');
  };

  const deleteUnit = (id: string) => {
    const target = units.find((u) => u.id === id);
    setUnits((prev) => prev.filter((u) => u.id !== id));
    addAuditLog('DELETE', 'UNIT', id, `Menghapus unit ${target?.nomorPolisi || id}`);
    showToast(`Unit telah dihapus dari sistem.`, 'info');
  };

  // Driver CRUD
  const addDriver = (data: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...data,
      id: `drv-${Date.now()}`,
    };
    setDrivers((prev) => [...prev, newDriver]);
    addAuditLog('CREATE', 'DRIVER', newDriver.namaDriver, `Menambah master driver ${newDriver.namaDriver}`);
    showToast(`Driver ${newDriver.namaDriver} berhasil ditambahkan.`, 'success');
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    addAuditLog('UPDATE', 'DRIVER', id, `Memperbarui driver`);
    showToast(`Data driver diperbarui.`, 'success');
  };

  const deleteDriver = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    addAuditLog('DELETE', 'DRIVER', id, `Menghapus data driver`);
    showToast(`Driver dihapus.`, 'info');
  };

  // Mechanic CRUD
  const addMechanic = (data: Omit<Mechanic, 'id'>) => {
    const newMek: Mechanic = {
      ...data,
      id: `m-${Date.now()}`,
    };
    setMechanics((prev) => [...prev, newMek]);
    addAuditLog('CREATE', 'MECHANIC', newMek.namaMekanik, `Menambah mekanik ${newMek.namaMekanik}`);
    showToast(`Mekanik ${newMek.namaMekanik} berhasil ditambahkan.`, 'success');
  };

  const updateMechanic = (id: string, updates: Partial<Mechanic>) => {
    setMechanics((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    addAuditLog('UPDATE', 'MECHANIC', id, `Memperbarui data mekanik`);
    showToast(`Data mekanik diperbarui.`, 'success');
  };

  const deleteMechanic = (id: string) => {
    setMechanics((prev) => prev.filter((m) => m.id !== id));
    addAuditLog('DELETE', 'MECHANIC', id, `Menghapus data mekanik`);
    showToast(`Mekanik dihapus.`, 'info');
  };

  // Category CRUD
  const addCategory = (data: Omit<DamageCategory, 'id'>) => {
    const newCat: DamageCategory = {
      ...data,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog('CREATE', 'CATEGORY', newCat.name, `Menambah kategori kerusakan: ${newCat.name}`);
    showToast(`Kategori ${newCat.name} berhasil dibuat.`, 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('DELETE', 'CATEGORY', id, `Menghapus kategori kerusakan`);
    showToast(`Kategori dihapus.`, 'info');
  };

  // Notifications helper
  const markNotificationAsRead = (id: string) => {
    // We can maintain read IDs locally
  };

  const clearAllNotifications = () => {
    showToast('Notifikasi dibersihkan.', 'info');
  };

  const resetToDefaultData = () => {
    setChrRecords(INITIAL_CHR_RECORDS);
    setUnits(INITIAL_UNITS);
    setDrivers(INITIAL_DRIVERS);
    setMechanics(INITIAL_MECHANICS);
    setCategories(INITIAL_CATEGORIES);
    addAuditLog('RESTORE', 'CHR', 'ALL', 'Reset database ke data awal Agustus 2026');
    showToast('Database berhasil di-reset ke data awal CHR Agustus 2026.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        chrRecords,
        units,
        drivers,
        mechanics,
        categories,
        auditLogs,
        notifications,
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        isDarkMode,
        toggleDarkMode,
        activeView,
        setActiveView,
        selectedUnitForDetail,
        setSelectedUnitForDetail,
        periodFilter,
        setPeriodFilter,
        customDateRange,
        setCustomDateRange,
        globalSearch,
        setGlobalSearch,
        toast,
        showToast,
        addCHR,
        updateCHR,
        deleteCHR,
        bulkImportCHR,
        quickUpdateStatus,
        addUnit,
        updateUnit,
        deleteUnit,
        addDriver,
        updateDriver,
        deleteDriver,
        addMechanic,
        updateMechanic,
        deleteMechanic,
        addCategory,
        deleteCategory,
        markNotificationAsRead,
        clearAllNotifications,
        kpis,
        filteredCHRRecords,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
