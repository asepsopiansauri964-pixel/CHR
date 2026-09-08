import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/common/Toast';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { ManagementDashboard } from './components/dashboard/ManagementDashboard';
import { HSEDashboard } from './components/dashboard/HSEDashboard';
import { MaintenanceDashboard } from './components/dashboard/MaintenanceDashboard';
import { CHRTable } from './components/chr/CHRTable';
import { CHRFormModal } from './components/chr/CHRFormModal';
import { CHRDetailModal } from './components/chr/CHRDetailModal';
import { ExcelImportModal } from './components/chr/ExcelImportModal';
import { UnitHistoryModal } from './components/unit/UnitHistoryModal';
import { MasterUnitPage } from './components/master/MasterUnitPage';
import { MasterDriverPage } from './components/master/MasterDriverPage';
import { MasterMechanicPage } from './components/master/MasterMechanicPage';
import { MasterCategoryPage } from './components/master/MasterCategoryPage';
import { MaintenanceMonitoringPage } from './components/maintenance/MaintenanceMonitoringPage';
import { CostAnalysisPage } from './components/analytics/CostAnalysisPage';
import { FailureAnalysisPage } from './components/analytics/FailureAnalysisPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { AuditTrailPage } from './components/audit/AuditTrailPage';
import { CHRRecord } from './types';

const MainLayout: React.FC = () => {
  const { activeView, setActiveView, setSelectedUnitForDetail } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CHRRecord | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<CHRRecord | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (record: CHRRecord) => {
    setEditingRecord(record);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (record: CHRRecord) => {
    setDetailRecord(record);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Toast Feedback */}
      <Toast />

      {/* Top Navigation Bar */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area (offset left by sidebar on desktop) */}
      <main className="flex-1 lg:pl-72 pt-16 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Dynamic View Router */}
          {activeView === 'dashboard' && (
            <MainDashboard
              onOpenAddModal={handleOpenAddModal}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
          )}

          {activeView === 'dashboard-management' && <ManagementDashboard />}

          {activeView === 'dashboard-hse' && <HSEDashboard />}

          {activeView === 'dashboard-maintenance' && <MaintenanceDashboard />}

          {activeView === 'chr-data' && (
            <CHRTable
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
              onOpenDetailModal={handleOpenDetailModal}
            />
          )}

          {activeView === 'maintenance-monitoring' && (
            <MaintenanceMonitoringPage
              onOpenAddModal={handleOpenAddModal}
              onOpenDetailModal={handleOpenDetailModal}
            />
          )}

          {activeView === 'unit-history' && (
            <div className="space-y-6">
              <MasterUnitPage />
            </div>
          )}

          {activeView === 'cost-analysis' && <CostAnalysisPage />}

          {activeView === 'failure-analysis' && <FailureAnalysisPage />}

          {activeView === 'reports' && <ReportsPage />}

          {activeView === 'master-units' && <MasterUnitPage />}

          {activeView === 'master-drivers' && <MasterDriverPage />}

          {activeView === 'master-mechanics' && <MasterMechanicPage />}

          {activeView === 'master-categories' && <MasterCategoryPage />}

          {activeView === 'audit-trail' && <AuditTrailPage />}
        </div>
      </main>

      {/* Global Modals */}
      <CHRFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRecord(null);
        }}
        initialData={editingRecord}
      />

      <CHRDetailModal
        record={detailRecord}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailRecord(null);
        }}
        onEdit={(rec) => {
          setEditingRecord(rec);
          setIsFormModalOpen(true);
        }}
      />

      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <UnitHistoryModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
