import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  Flame,
  Moon,
  Plus,
  Search,
  Shield,
  Sun,
  Truck,
  Upload,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenImportModal,
  onToggleSidebar,
}) => {
  const {
    units,
    currentRole,
    setCurrentRole,
    currentUser,
    isDarkMode,
    toggleDarkMode,
    notifications,
    setSelectedUnitForDetail,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter units for quick search
  const filteredUnits = searchQuery.trim()
    ? units.filter(
        (u) =>
          u.nomorPolisi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.jenisKendaraan.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.plant.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectUnit = (unitPlate: string) => {
    setSelectedUnitForDetail(unitPlate);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const match = units.find((u) => u.nomorPolisi.toLowerCase() === searchQuery.trim().toLowerCase());
      if (match) {
        handleSelectUnit(match.nomorPolisi);
      } else if (filteredUnits.length > 0) {
        handleSelectUnit(filteredUnits[0].nomorPolisi);
      } else if (searchQuery.trim()) {
        handleSelectUnit(searchQuery.trim().toUpperCase());
      }
    }
  };

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ADMIN', label: 'Admin Utama', desc: 'Akses penuh ke seluruh sistem' },
    { role: 'HSE', label: 'HSE Coordinator', desc: 'Keselamatan & Analisis Risiko' },
    { role: 'MAINTENANCE', label: 'Maintenance Head', desc: 'Work Order & Monitoring Mekanik' },
    { role: 'DISPATCHER', label: 'Dispatcher Operasional', desc: 'Input CHR & Keluhan Unit' },
    { role: 'MANAGEMENT', label: 'Executive Management', desc: 'Dashboard Eksekutif & Laporan' },
    { role: 'VIEWER', label: 'Auditor / Viewer', desc: 'Mode Hanya Lihat (Read-Only)' },
  ];

  const unreadCount = notifications.length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base">MAXALMINA</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300">
                    GAS FLEET
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                  CUSTOMER HISTORY REPORT (CHR)
                </p>
              </div>
            </div>
          </div>

          {/* Center: Big Search Bar for Unit (Requirement 18) */}
          <div ref={searchRef} className="flex-1 max-w-md relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Cari Nomor Unit... (contoh: B 9780 FYV)"
                className="w-full pl-10 pr-12 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all shadow-inner"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                ↵
              </span>
            </div>

            {/* Quick search dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
                  {filteredUnits.length > 0 ? 'Pilih Unit untuk Buka Unit History' : 'Armada Tersedia'}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {(filteredUnits.length > 0 ? filteredUnits : units.slice(0, 5)).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUnit(u.nomorPolisi)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-sky-50 dark:hover:bg-slate-800/80 flex items-center justify-between group transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-sky-600 group-hover:text-white transition">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                            {u.nomorPolisi}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {u.jenisKendaraan} • {u.plant}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition">
                        Buka Riwayat →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions, Notifications, Role, Dark Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Action: Tambah CHR (Accessible if not VIEWER) */}
            {currentRole !== 'VIEWER' && (
              <button
                onClick={onOpenAddModal}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah CHR</span>
              </button>
            )}

            {/* Quick Action: Import Excel */}
            {['ADMIN', 'HSE', 'DISPATCHER'].includes(currentRole) && (
              <button
                onClick={onOpenImportModal}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                title="Unggah File Excel CHR"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Import Excel</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title={isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition relative"
                title="Pemberitahuan Sistem"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                  <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Pemberitahuan</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 font-bold">
                        {unreadCount} Aktif
                      </span>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Tidak ada peringatan kritis saat ini. Seluruh armada dalam kondisi normal.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                          onClick={() => {
                            if (n.unit) setSelectedUnitForDetail(n.unit);
                            setShowNotifDropdown(false);
                          }}
                        >
                          <div className="flex items-start gap-2.5">
                            {n.type === 'CRITICAL' ? (
                              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0 mt-0.5">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            ) : n.type === 'OVERDUE' ? (
                              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shrink-0 mt-0.5">
                                <Clock className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="p-1.5 rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 shrink-0 mt-0.5">
                                <Truck className="w-4 h-4" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{n.title}</p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <div ref={roleRef} className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentRole.substring(0, 2)}
                </div>
                <span className="hidden sm:inline">{currentRole}</span>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Role Dropdown */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 p-2">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Simulasi Hak Akses (Role)</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser}</p>
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        setCurrentRole(r.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                        currentRole === r.role
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div>{r.label} ({r.role})</div>
                        <div className="text-[10px] text-slate-400 font-normal">{r.desc}</div>
                      </div>
                      {currentRole === r.role && <CheckCircle className="w-4 h-4 text-sky-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
