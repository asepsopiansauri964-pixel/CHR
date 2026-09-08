import React from 'react';
import {
  Activity,
  AlertOctagon,
  BarChart3,
  CheckSquare,
  Clock,
  Database,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  PieChart,
  ShieldCheck,
  Tag,
  Truck,
  UserCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeView, setActiveView, kpis, currentRole, setSelectedUnitForDetail } = useApp();

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    if (viewId === 'unit-history') {
      setSelectedUnitForDetail('B 9780 FYV');
    }
    onClose();
  };

  const navSections = [
    {
      label: 'DASHBOARD & MONITORING',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Utama',
          icon: <LayoutDashboard className="w-4 h-4" />,
          badge: kpis.criticalCount > 0 ? `${kpis.criticalCount} Kritis` : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        {
          id: 'dashboard-management',
          label: 'Dashboard Management',
          icon: <BarChart3 className="w-4 h-4" />,
          roles: ['ADMIN', 'MANAGEMENT', 'HSE'],
        },
        {
          id: 'dashboard-hse',
          label: 'Dashboard HSE',
          icon: <ShieldCheck className="w-4 h-4" />,
          badge: 'Safety',
          badgeColor: 'bg-emerald-600 text-white',
          roles: ['ADMIN', 'HSE', 'MANAGEMENT'],
        },
        {
          id: 'dashboard-maintenance',
          label: 'Dashboard Maintenance',
          icon: <Wrench className="w-4 h-4" />,
          badge: kpis.overdueCount > 0 ? `${kpis.overdueCount} Overdue` : undefined,
          badgeColor: 'bg-amber-500 text-white',
          roles: ['ADMIN', 'MAINTENANCE', 'MANAGEMENT'],
        },
      ],
    },
    {
      label: 'CUSTOMER HISTORY & FLEET',
      items: [
        {
          id: 'chr-data',
          label: 'Data CHR',
          icon: <FileSpreadsheet className="w-4 h-4" />,
          badge: `${kpis.totalCHR}`,
          badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
        },
        {
          id: 'maintenance-monitoring',
          label: 'Monitoring Maintenance',
          icon: <Clock className="w-4 h-4" />,
          badge: kpis.overdueCount > 0 ? `${kpis.overdueCount} Alert` : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        {
          id: 'unit-history',
          label: 'Unit History (Detail)',
          icon: <History className="w-4 h-4" />,
        },
      ],
    },
    {
      label: 'ANALISIS & LAPORAN',
      items: [
        {
          id: 'cost-analysis',
          label: 'Analisis Biaya (Cost)',
          icon: <PieChart className="w-4 h-4" />,
        },
        {
          id: 'failure-analysis',
          label: 'Analisis Kerusakan',
          icon: <AlertOctagon className="w-4 h-4" />,
          badge: kpis.repeatFailureRate > 0 ? 'Repeat Failure' : undefined,
          badgeColor: 'bg-orange-500 text-white',
        },
        {
          id: 'reports',
          label: 'Laporan & Export',
          icon: <FileText className="w-4 h-4" />,
        },
      ],
    },
    {
      label: 'MASTER DATA & SISTEM',
      items: [
        {
          id: 'master-units',
          label: 'Master Unit Kendaraan',
          icon: <Truck className="w-4 h-4" />,
        },
        {
          id: 'master-drivers',
          label: 'Master Driver',
          icon: <Users className="w-4 h-4" />,
        },
        {
          id: 'master-mechanics',
          label: 'Master Mekanik',
          icon: <UserCheck className="w-4 h-4" />,
        },
        {
          id: 'master-categories',
          label: 'Kategori Kerusakan',
          icon: <Tag className="w-4 h-4" />,
        },
        {
          id: 'audit-trail',
          label: 'Audit Trail (Aktivitas)',
          icon: <Activity className="w-4 h-4" />,
          roles: ['ADMIN', 'HSE', 'MANAGEMENT'],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              PM
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">PT MAXALMINA</span>
              <p className="text-[10px] text-slate-400 font-medium leading-none">Gas Transport Division</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Role Badge */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Hak Akses Aktif:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
              {currentRole}
            </span>
          </div>
        </div>

        {/* Navigation Menus (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map((sec, secIdx) => {
            // Filter items by role if specified
            const visibleItems = sec.items.filter(
              (item) => !item.roles || item.roles.includes(currentRole)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={secIdx}>
                <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {sec.label}
                </div>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isActive ? 'bg-white/20 text-white' : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-400 text-center shrink-0">
          <div>CHR v2.4 • PT. MAXALMINA</div>
          <div className="text-[10px] text-slate-500">Agustus 2026 Fleet Database</div>
        </div>
      </aside>
    </>
  );
};
