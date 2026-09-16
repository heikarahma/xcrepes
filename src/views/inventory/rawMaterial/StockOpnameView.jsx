import React, { useState, useMemo } from 'react';
import { useRawMaterial } from '../../../controllers/RawMaterialController';
import { useAuth } from '../../../controllers/AuthController';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { 
  exportStockOpnameToPDF, 
  exportStockOpnameToExcel 
} from '../../../utils/reportExportUtils';
import { 
  ClipboardCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  RotateCcw, 
  Download, 
  FileText, 
  Save, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  Store, 
  Calendar, 
  Layers, 
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';

export const StockOpnameView = () => {
  const {
    rawMaterials = [],
    opnameItems = {},
    dailyOpnameReports = [],
    todayReport,
    todayStoreClosed,
    addOrUpdateCountedItem,
    removeCountedItem,
    completeStoreClosing,
    updateAdminOpnameNote,
    updateAdminOpnameItem,
    reopenStoreClosing,
    applyReportToInventory,
    enrichedOpnameList = [],
    opnameSummary = {},
    isSubmitting
  } = useRawMaterial();

  const { currentUser, storeName = 'XCrepes POS' } = useAuth();
  const isCashier = currentUser?.role === 'kasir';
  const isSuperAdmin = !isCashier;

  // -------------------------------------------------------------
  // VIEW MODES & FILTERS
  // -------------------------------------------------------------
  // Superadmin view mode: 'REPORTS' | 'KASIR_SIMULATION'
  const [adminViewMode, setAdminViewMode] = useState('REPORTS');

  // Selected date for Superadmin reports (defaults to today)
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedReportDate, setSelectedReportDate] = useState(todayStr);

  // Search & filter for Superadmin report table
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL'); // 'ALL' | 'DISCREPANCY' | 'MATCH' | 'UNCOUNTED'
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Search & filter for Kasir's Review Stock Opname Table
  const [kasirSearchQuery, setKasirSearchQuery] = useState('');
  const [kasirStatusFilter, setKasirStatusFilter] = useState('ALL'); // 'ALL' | 'UNCOUNTED' | 'COUNTED'

  // Modal States
  // Screen 2: Modal Tambah/Edit Hasil Stock Opname
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [inputActualStock, setInputActualStock] = useState('');
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Screen 4: Modal Konfirmasi Store Closing
  const [isClosingConfirmModalOpen, setIsClosingConfirmModalOpen] = useState(false);

  // Screen 7: Modal Detail Selisih & Catatan Superadmin
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailItem, setActiveDetailItem] = useState(null);
  const [adminActualStockInput, setAdminActualStockInput] = useState('');
  const [adminInvestigationNote, setAdminInvestigationNote] = useState('');

  // Toggle for Success State: Show/Hide Read-Only Report
  const [showClosedSummary, setShowClosedSummary] = useState(false);

  // -------------------------------------------------------------
  // HELPER FORMATTERS
  // -------------------------------------------------------------
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const currentDateDisplay = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  // -------------------------------------------------------------
  // COMPUTED DATA FOR KASIR WORKFLOW
  // -------------------------------------------------------------
  // Items that have been counted by cashier in active session
  const countedItems = useMemo(() => {
    return enrichedOpnameList.filter(item => item.hasActual);
  }, [enrichedOpnameList]);

  // Uncounted items
  const uncountedItems = useMemo(() => {
    return enrichedOpnameList.filter(item => !item.hasActual);
  }, [enrichedOpnameList]);

  // Filtered list for Kasir's Review Stock Opname Table
  const filteredReviewList = useMemo(() => {
    let list = enrichedOpnameList;

    if (kasirStatusFilter === 'UNCOUNTED') {
      list = list.filter(item => !item.hasActual);
    } else if (kasirStatusFilter === 'COUNTED') {
      list = list.filter(item => item.hasActual);
    }

    if (kasirSearchQuery.trim()) {
      const q = kasirSearchQuery.toLowerCase().trim();
      list = list.filter(item =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.categoryName || '').toLowerCase().includes(q) ||
        (item.unitName || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [enrichedOpnameList, kasirStatusFilter, kasirSearchQuery]);

  // Selected material details for Screen 2 Modal
  const currentSelectedMaterial = useMemo(() => {
    return rawMaterials.find(m => m.id === selectedMaterialId) || null;
  }, [rawMaterials, selectedMaterialId]);

  // Live calculation in Modal Screen 2
  const modalSystemStock = Number(currentSelectedMaterial?.stock ?? currentSelectedMaterial?.currentStock ?? 0);
  const modalActualStockNum = inputActualStock !== '' ? Number(inputActualStock) : null;
  const modalDifference = modalActualStockNum !== null ? Math.round((modalActualStockNum - modalSystemStock) * 1000) / 1000 : null;
  
  let modalStatus = 'MATCH';
  if (modalDifference !== null) {
    if (modalDifference < 0) modalStatus = 'DEFICIT';
    else if (modalDifference > 0) modalStatus = 'SURPLUS';
    else modalStatus = 'MATCH';
  }

  // -------------------------------------------------------------
  // COMPUTED DATA FOR SUPERADMIN REPORTS
  // -------------------------------------------------------------
  // Get report corresponding to selectedReportDate
  const currentAdminReport = useMemo(() => {
    const found = dailyOpnameReports.find(r => r.date === selectedReportDate);
    if (found) {
      // Normalize items & summary:
      // Status is ONLY MATCH, DEFICIT, or SURPLUS when an item has been counted (hasActual === true).
      // If hasActual is false, status is 'UNCOUNTED', difference is null, and actualStock is null.
      const sanitizedItems = (found.items || []).map(item => {
        const hasActual = Boolean(item.hasActual && item.actualStock !== '' && item.actualStock !== undefined && item.actualStock !== null);
        const sysStock = Number(item.systemStock ?? 0);
        const actStock = hasActual ? Number(item.actualStock) : null;
        const diff = hasActual ? Math.round((actStock - sysStock) * 1000) / 1000 : null;
        let status = 'UNCOUNTED';
        if (hasActual) {
          if (diff > 0) status = 'SURPLUS';
          else if (diff < 0) status = 'DEFICIT';
          else status = 'MATCH';
        }
        return {
          ...item,
          hasActual,
          actualStock: actStock,
          difference: diff,
          status
        };
      });

      const totalMaterials = found.summary?.totalMaterials || sanitizedItems.length;
      const totalCounted = sanitizedItems.filter(i => i.hasActual).length;
      const matchCount = sanitizedItems.filter(i => i.hasActual && i.status === 'MATCH').length;
      const deficitCount = sanitizedItems.filter(i => i.hasActual && i.status === 'DEFICIT').length;
      const surplusCount = sanitizedItems.filter(i => i.hasActual && i.status === 'SURPLUS').length;
      const uncountedCount = sanitizedItems.filter(i => !i.hasActual).length;
      const totalDifferenceValue = sanitizedItems.reduce((acc, i) => {
        if (!i.hasActual) return acc;
        return acc + ((i.difference || 0) * (i.pricePerUnit || 0));
      }, 0);

      return {
        ...found,
        items: sanitizedItems,
        summary: {
          ...found.summary,
          totalMaterials,
          totalCounted,
          matchCount,
          deficitCount,
          surplusCount,
          uncountedCount,
          totalDifferenceValue
        }
      };
    }

    // If selected is today and today has no completed store closing report yet, build preview from active opname items
    if (selectedReportDate === todayStr) {
      return {
        id: `PREVIEW-${todayStr}`,
        date: todayStr,
        displayDate: currentDateDisplay,
        outlet: storeName,
        closedBy: 'Belum Selesai (Draft Kasir)',
        closedAt: null,
        status: 'IN_PROGRESS',
        summary: opnameSummary,
        items: enrichedOpnameList.map(item => ({
          ...item,
          adminNote: item.note || ''
        })),
        appliedToInventory: false
      };
    }

    return null;
  }, [dailyOpnameReports, selectedReportDate, todayStr, currentDateDisplay, storeName, opnameSummary, enrichedOpnameList]);

  // Filtered items for Superadmin report table
  const filteredAdminItems = useMemo(() => {
    let items = currentAdminReport?.items || [];
    if (adminStatusFilter === 'DISCREPANCY') {
      items = items.filter(i => i.hasActual && (i.status === 'DEFICIT' || i.status === 'SURPLUS'));
    } else if (adminStatusFilter === 'MATCH') {
      items = items.filter(i => i.hasActual && i.status === 'MATCH');
    } else if (adminStatusFilter === 'UNCOUNTED') {
      items = items.filter(i => !i.hasActual);
    }

    if (adminSearchQuery.trim()) {
      const q = adminSearchQuery.toLowerCase().trim();
      items = items.filter(i => 
        (i.name || '').toLowerCase().includes(q) ||
        (i.categoryName || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [currentAdminReport?.items, adminStatusFilter, adminSearchQuery]);

  // -------------------------------------------------------------
  // HANDLERS: SCREEN 2 (TAMBAH / EDIT BAHAN)
  // -------------------------------------------------------------
  const handleOpenAddModal = (material = null) => {
    if (material) {
      setSelectedMaterialId(material.id);
      setInputActualStock(material.actualStock !== undefined && material.actualStock !== null ? material.actualStock : '');
      setIsEditMode(true);
    } else {
      setSelectedMaterialId('');
      setInputActualStock('');
      setIsEditMode(false);
    }
    setMaterialSearchQuery('');
    setIsAddModalOpen(true);
  };

  const handleSaveModalItem = (saveAndNext = false) => {
    if (!selectedMaterialId) return;
    if (inputActualStock === '') return;

    addOrUpdateCountedItem(selectedMaterialId, inputActualStock);

    if (saveAndNext) {
      // Find next uncounted material
      const remaining = rawMaterials.filter(m => m.id !== selectedMaterialId && !opnameItems[m.id]);
      if (remaining.length > 0) {
        setSelectedMaterialId(remaining[0].id);
        setInputActualStock('');
        setIsEditMode(false);
      } else {
        setIsAddModalOpen(false);
      }
    } else {
      setIsAddModalOpen(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: SCREEN 4 (STORE CLOSING EXECUTION)
  // -------------------------------------------------------------
  const handleConfirmClosing = async () => {
    const res = await completeStoreClosing({
      closedBy: currentUser?.nama || 'Kasir Outlet',
      outlet: storeName
    });

    if (res.success) {
      setIsClosingConfirmModalOpen(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: SCREEN 7 (SUPERADMIN DETAIL & CATATAN)
  // -------------------------------------------------------------
  const handleOpenDetailModal = (item) => {
    setActiveDetailItem(item);
    setAdminActualStockInput(
      item.hasActual && item.actualStock !== undefined && item.actualStock !== null
        ? String(item.actualStock)
        : ''
    );
    setAdminInvestigationNote(item.adminNote || item.note || '');
    setIsDetailModalOpen(true);
  };

  const handleSaveAdminDetail = () => {
    if (!activeDetailItem) return;
    updateAdminOpnameItem(
      currentAdminReport?.id,
      activeDetailItem.id || activeDetailItem.rawMaterialId,
      {
        actualStock: adminActualStockInput !== '' ? Number(adminActualStockInput) : undefined,
        adminNote: adminInvestigationNote,
        user: currentUser?.nama || 'Super Admin'
      }
    );
    setIsDetailModalOpen(false);
  };

  const handleSaveAdminNote = handleSaveAdminDetail;

  // -------------------------------------------------------------
  // HANDLERS: EXPORT & PRINT
  // -------------------------------------------------------------
  const handleExportPDF = () => {
    if (!currentAdminReport) return;
    exportStockOpnameToPDF({
      items: currentAdminReport.items || [],
      summary: currentAdminReport.summary || {},
      storeName,
      conductedBy: currentAdminReport.closedBy || 'Kasir',
      isCashier: false
    });
  };

  const handleExportExcel = () => {
    if (!currentAdminReport) return;
    exportStockOpnameToExcel({
      items: currentAdminReport.items || [],
      summary: currentAdminReport.summary || {},
      storeName,
      conductedBy: currentAdminReport.closedBy || 'Kasir',
      isCashier: false
    });
  };

  // =============================================================
  // RENDER FLOW KASIR (STORE CLOSING)
  // =============================================================
  // =============================================================
  // RENDER FLOW KASIR (STORE CLOSING - BLIND OPNAME FISIK)
  // =============================================================
  const renderKasirFlow = () => {
    // SCREEN 5: SUCCESS STATE (Hari ini Store Closing sudah selesai)
    if (todayStoreClosed && !showClosedSummary) {
      return (
        <div className="opname-success-wrapper animate-fade-in" style={styles.successContainer}>
          <div style={styles.successCard}>
            <div style={styles.successIconWrapper}>
              <CheckCircle2 size={44} color="#059669" />
            </div>

            <span style={styles.successDateBadge}>
              <Calendar size={13} /> {todayReport?.displayDate || currentDateDisplay}
            </span>

            <h1 style={styles.successTitle}>Stock Opname Selesai</h1>
            <p style={styles.successMessage}>
              Hasil stok fisik aktual <strong>{todayReport?.displayDate || currentDateDisplay}</strong> telah berhasil dicatat untuk store closing oleh <strong>{todayReport?.closedBy || 'Kasir'}</strong>.
            </p>

            {/* Metric Summary Pill Badges (KASIR: HANYA JUMLAH BAHAN DIHITUNG, TANPA DEFICIT/SURPLUS/SESUAI) */}
            <div style={{ ...styles.successMetricsGrid, gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div style={styles.successMetricBox}>
                <span style={styles.successMetricValue}>{todayReport?.summary?.totalMaterials || rawMaterials.length}</span>
                <span style={styles.successMetricLabel}>Total Bahan Baku</span>
              </div>
              <div style={{ ...styles.successMetricBox, borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' }}>
                <span style={{ ...styles.successMetricValue, color: '#059669' }}>
                  {todayReport?.items?.filter(i => i.hasActual !== false && i.actualStock !== null && i.actualStock !== undefined).length || rawMaterials.length}
                </span>
                <span style={styles.successMetricLabel}>Stok Fisik Dicatat</span>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="primary"
                icon={FileCheck2}
                onClick={() => setShowClosedSummary(true)}
                size="md"
              >
                Lihat Ringkasan
              </Button>

              <Button
                variant="outline"
                icon={RotateCcw}
                onClick={() => reopenStoreClosing(todayReport?.id)}
                size="md"
                style={{ color: 'var(--neutral-600)' }}
                title="Buka kembali jika masih perlu penyesuaian hitungan"
              >
                Buka Ulang Opname
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Read-only view after clicking "Lihat Ringkasan" on Screen 5
    if (todayStoreClosed && showClosedSummary) {
      return (
        <div className="opname-closed-summary-view animate-fade-in" style={styles.pageContainer}>
          <div style={styles.closedSummaryHeader}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...styles.statusBadge, backgroundColor: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                  <CheckCircle2 size={13} /> Store Closing Selesai
                </span>
                <span style={styles.closedTimestamp}>
                  <Clock size={13} /> {todayReport?.displayDate} ({new Date(todayReport?.closedAt || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB)
                </span>
              </div>
              <h1 style={{ ...styles.pageTitle, marginTop: '6px' }}>Ringkasan Hitungan Fisik Hari Ini</h1>
              <p style={styles.pageSubtitle}>
                Stok fisik aktual telah dikirim sebagai laporan store closing ke Superadmin.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClosedSummary(false)}
              >
                Kembali
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={() => reopenStoreClosing(todayReport?.id)}
              >
                Buka Ulang
              </Button>
            </div>
          </div>

          {/* Table Summary of today's closed opname (KASIR: NO SYSTEM STOCK, NO DIFFERENCE) */}
          <div className="blue-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="blue-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                  <th>Bahan Baku</th>
                  <th>Satuan</th>
                  <th style={{ textAlign: 'right' }}>Stok Fisik Aktual</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(todayReport?.items || []).map((item, idx) => {
                  const hasActual = Boolean(item.hasActual && item.actualStock !== '' && item.actualStock !== undefined && item.actualStock !== null);
                  return (
                    <tr key={item.id || idx}>
                      <td style={{ textAlign: 'center', color: 'var(--neutral-400)' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>{item.name}</td>
                      <td style={{ color: 'var(--neutral-600)' }}>{item.unitName}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: hasActual ? 'var(--neutral-900)' : 'var(--neutral-400)' }}>
                        {hasActual ? formatNumber(item.actualStock) : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {hasActual ? (
                          <span style={styles.statusPillCounted}>
                            <Check size={11} /> Sudah Dihitung
                          </span>
                        ) : (
                          <span style={styles.statusPillUncounted}>
                            <Clock size={11} /> Belum Dihitung
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // DIRECT ACTIVE VIEW: KASIR REVIEW STOCK OPNAME (Sebelum Store Closing)
    return (
      <div className="opname-review-screen animate-fade-in" style={styles.pageContainer}>
        {/* Top Bar Header */}
        <div style={styles.reviewHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={styles.pageTitle}>Stock Opname Fisik</h1>
              <span style={styles.statusBadgeWarning}>
                <Clock size={12} /> Belum Selesai
              </span>
              <span style={styles.sessionBadge}>
                <Calendar size={12} /> {currentDateDisplay}
              </span>
              <span style={styles.outletBadge}>
                <Store size={12} /> {storeName}
              </span>
            </div>
            <p style={styles.pageSubtitle}>
              Fokus masukkan stok fisik aktual bahan baku di outlet sebelum store closing.
            </p>
          </div>

          <div style={styles.headerActions}>
            <Button
              variant="primary"
              icon={Check}
              size="md"
              onClick={() => setIsClosingConfirmModalOpen(true)}
            >
              Selesaikan Store Closing
            </Button>
          </div>
        </div>

        {/* Progress Bar Card */}
        <div style={styles.progressBarCard}>
          <div style={styles.progressBarHeader}>
            <span style={styles.progressLabel}>PROGRES PENGHITUNGAN FISIK</span>
            <strong style={styles.progressCounter}>
              {countedItems.length} / {rawMaterials.length} bahan ({opnameSummary.progressPercent || 0}%)
            </strong>
          </div>
          <div style={styles.progressBarTrack}>
            <div 
              style={{
                ...styles.progressBarFill,
                width: `${opnameSummary.progressPercent || 0}%`
              }} 
            />
          </div>
        </div>

        {/* 4 Clean Kasir Counting Summary Cards (TANPA SESUAI, DEFICIT, SURPLUS) */}
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <span style={styles.kpiTitle}>TOTAL BAHAN</span>
            <div style={styles.kpiValue}>{rawMaterials.length} <span style={styles.kpiUnit}>Bahan</span></div>
            <span style={styles.kpiFooter}>Katalog Master Bahan</span>
          </div>
          <div style={{ ...styles.kpiCard, borderColor: '#a7f3d0' }}>
            <span style={{ ...styles.kpiTitle, color: '#059669' }}>SUDAH DIHITUNG</span>
            <div style={{ ...styles.kpiValue, color: '#059669' }}>{countedItems.length} <span style={styles.kpiUnit}>Bahan</span></div>
            <span style={styles.kpiFooter}>Stok fisik dicatat</span>
          </div>
          <div style={{ ...styles.kpiCard, borderColor: uncountedItems.length > 0 ? '#fde68a' : 'var(--border-color)' }}>
            <span style={{ ...styles.kpiTitle, color: uncountedItems.length > 0 ? '#b45309' : 'var(--neutral-500)' }}>BELUM DIHITUNG</span>
            <div style={{ ...styles.kpiValue, color: uncountedItems.length > 0 ? '#b45309' : 'var(--neutral-700)' }}>{uncountedItems.length} <span style={styles.kpiUnit}>Bahan</span></div>
            <span style={styles.kpiFooter}>Perlu penghitungan</span>
          </div>
          <div style={{ ...styles.kpiCard, borderColor: '#bfdbfe' }}>
            <span style={{ ...styles.kpiTitle, color: '#2563eb' }}>KELENGKAPAN</span>
            <div style={{ ...styles.kpiValue, color: '#2563eb' }}>{opnameSummary.progressPercent || 0}%</div>
            <span style={styles.kpiFooter}>Progres Store Closing</span>
          </div>
        </div>

        {/* Warning Banner if uncounted items exist */}
        {uncountedItems.length > 0 && (
          <div style={styles.warningAlertBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} color="#d97706" />
              <div>
                <strong style={{ fontSize: '0.875rem', color: '#92400e' }}>
                  {uncountedItems.length} bahan belum dihitung.
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.813rem', color: '#b45309' }}>
                  Pastikan seluruh stok fisik aktual di outlet telah dihitung sebelum menyelesaikan store closing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Review Comparison Table Card */}
        <div className="blue-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table Toolbar */}
          <div style={styles.tableToolbar}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                style={{ ...styles.pillBtn, ...(kasirStatusFilter === 'ALL' ? styles.pillBtnActive : {}) }}
                onClick={() => setKasirStatusFilter('ALL')}
              >
                Semua ({rawMaterials.length})
              </button>
              <button
                type="button"
                style={{ ...styles.pillBtn, ...(kasirStatusFilter === 'UNCOUNTED' ? styles.pillBtnActive : {}) }}
                onClick={() => setKasirStatusFilter('UNCOUNTED')}
              >
                Belum Dihitung ({uncountedItems.length})
              </button>
              <button
                type="button"
                style={{ ...styles.pillBtn, ...(kasirStatusFilter === 'COUNTED' ? styles.pillBtnActive : {}) }}
                onClick={() => setKasirStatusFilter('COUNTED')}
              >
                Sudah Dihitung ({countedItems.length})
              </button>
            </div>

            {/* Quick Search */}
            <div style={styles.miniSearchWrapper}>
              <Search size={14} color="var(--neutral-400)" style={styles.miniSearchIcon} />
              <input
                type="text"
                placeholder="Cari bahan / kategori..."
                value={kasirSearchQuery}
                onChange={(e) => setKasirSearchQuery(e.target.value)}
                style={styles.miniSearchInput}
              />
              {kasirSearchQuery && (
                <button
                  type="button"
                  onClick={() => setKasirSearchQuery('')}
                  style={styles.miniSearchClear}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Table - KASIR: HANYA NO, NAMA BAHAN, SATUAN, STOK FISIK AKTUAL, STATUS HITUNG, AKSI */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="blue-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                  <th>Nama Bahan Baku</th>
                  <th>Satuan</th>
                  <th style={{ textAlign: 'right' }}>Stok Fisik Aktual</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviewList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--neutral-500)' }}>
                      Tidak ada bahan baku yang cocok dengan filter atau pencarian saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredReviewList.map((item, idx) => {
                    const hasActual = item.hasActual;

                    return (
                      <tr 
                        key={item.id}
                        style={{
                          backgroundColor: hasActual ? '#fafcff' : 'inherit'
                        }}
                      >
                        <td style={{ textAlign: 'center', color: 'var(--neutral-400)' }}>{idx + 1}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>{item.name}</div>
                          <span style={{ fontSize: '0.688rem', color: 'var(--neutral-500)' }}>
                            {item.categoryName || 'Bahan Baku'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--neutral-600)' }}>{item.unitName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: hasActual ? 'var(--neutral-900)' : 'var(--neutral-400)' }}>
                          {hasActual ? formatNumber(item.actualStock) : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {!hasActual ? (
                            <span style={styles.statusPillUncounted}>
                              <Clock size={11} /> Belum Dihitung
                            </span>
                          ) : (
                            <span style={styles.statusPillCounted}>
                              <Check size={11} /> Sudah Dihitung
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {!hasActual ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(item)}
                              style={styles.tableActionInputBtn}
                              title="Input Hitungan Fisik"
                            >
                              <Plus size={13} /> Input
                            </button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenAddModal(item)}
                                style={styles.tableActionEditBtn}
                                title="Ubah Stok Fisik"
                              >
                                <Edit3 size={13} /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCountedItem(item.id)}
                                style={styles.tableActionResetBtn}
                                title="Reset hitungan fisik bahan ini"
                              >
                                <RotateCcw size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Bar */}
          <div style={styles.tableFooterBar}>
            <span style={{ fontSize: '0.813rem', color: 'var(--neutral-500)' }}>
              Menampilkan <strong>{filteredReviewList.length}</strong> dari <strong>{rawMaterials.length}</strong> bahan baku
            </span>
            <Button
              variant="primary"
              icon={Check}
              size="sm"
              onClick={() => setIsClosingConfirmModalOpen(true)}
            >
              Selesaikan Store Closing
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // =============================================================
  // RENDER FLOW SUPERADMIN (MONITORING & REVIEW LAPORAN)
  // =============================================================
  const renderSuperAdminFlow = () => {
    // If Superadmin toggled to Kasir Simulation mode
    if (adminViewMode === 'KASIR_SIMULATION') {
      return (
        <div>
          {/* Top Switcher Bar */}
          <div style={styles.adminModeBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--blue-600)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--neutral-800)' }}>
                Mode Simulasi Kasir: Anda dapat melihat dan menguji alur store closing dari sudut pandang kasir.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdminViewMode('REPORTS')}
            >
              Kembali ke Laporan Superadmin
            </Button>
          </div>
          {renderKasirFlow()}
        </div>
      );
    }

    // SCREEN 6: SUPERADMIN LAPORAN STOCK OPNAME HARIAN
    return (
      <div className="opname-superadmin-screen animate-fade-in" style={styles.pageContainer}>
        {/* Header Section */}
        <div style={styles.headerSection}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={styles.pageTitle}>Laporan Stock Opname</h1>
              <Badge variant="primary" size="sm">Audit & Monitoring</Badge>
            </div>
            <p style={styles.pageSubtitle}>
              Pantau hasil pemeriksaan stok fisik outlet pada setiap store closing.
            </p>
          </div>

          {/* Switcher & Action Toolbar */}
          <div style={styles.headerActions}>
            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={handleExportPDF}
              title="Unduh laporan PDF"
            >
              Unduh PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportExcel}
              title="Unduh laporan Excel"
            >
              Unduh Excel
            </Button>

            {currentAdminReport && !currentAdminReport.appliedToInventory && currentAdminReport.status === 'COMPLETED' && (
              <Button
                variant="primary"
                size="sm"
                icon={Save}
                onClick={() => applyReportToInventory(currentAdminReport.id, currentUser?.nama || 'Super Admin')}
                disabled={isSubmitting}
                title="Terapkan hasil penyesuaian opname ke stok sistem master"
              >
                Terapkan ke Stok Sistem
              </Button>
            )}
          </div>
        </div>

        {/* Filter Bar (Date Filter Only) */}
        <div style={styles.adminFilterBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Date Filter */}
            <div style={styles.filterFieldGroup}>
              <Calendar size={15} color="var(--neutral-400)" />
              <span style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--neutral-600)' }}>Tanggal:</span>
              <input
                type="date"
                value={selectedReportDate}
                onChange={(e) => setSelectedReportDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>
          </div>
        </div>

        {/* 3 Summary KPI Cards (Total Bahan, Sesuai Sistem, Selisih Patut Dicurigai) */}
        {(() => {
          const totalMats = currentAdminReport?.summary?.totalMaterials || rawMaterials.length;
          const matchCount = currentAdminReport?.summary?.matchCount || 0;
          const deficitCount = currentAdminReport?.summary?.deficitCount || 0;
          const surplusCount = currentAdminReport?.summary?.surplusCount || 0;
          const totalDiscrepancy = deficitCount + surplusCount;

          return (
            <div style={{ ...styles.kpiGrid, gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {/* Card 1: TOTAL BAHAN */}
              <div 
                style={{ 
                  ...styles.kpiCard, 
                  cursor: 'pointer',
                  borderWidth: adminStatusFilter === 'ALL' ? '2px' : '1px',
                  borderColor: adminStatusFilter === 'ALL' ? 'var(--blue-600)' : 'var(--border-color)',
                  backgroundColor: adminStatusFilter === 'ALL' ? '#f0f7ff' : '#ffffff'
                }}
                onClick={() => setAdminStatusFilter('ALL')}
                title="Tampilkan semua bahan baku"
              >
                <span style={styles.kpiTitle}>TOTAL BAHAN</span>
                <div style={styles.kpiValue}>
                  {totalMats}
                </div>
                <span style={styles.kpiFooter}>Katalog Master Bahan</span>
              </div>

              {/* Card 2: SESUAI SISTEM */}
              <div 
                style={{ 
                  ...styles.kpiCard, 
                  borderWidth: adminStatusFilter === 'MATCH' ? '2px' : '1px',
                  borderColor: adminStatusFilter === 'MATCH' ? '#059669' : '#a7f3d0',
                  backgroundColor: adminStatusFilter === 'MATCH' ? '#ecfdf5' : '#ffffff',
                  cursor: 'pointer'
                }}
                onClick={() => setAdminStatusFilter('MATCH')}
                title="Tampilkan bahan yang sudah dihitung dan cocok dengan stok sistem"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...styles.kpiTitle, color: '#059669' }}>SESUAI SISTEM</span>
                  <CheckCircle2 size={15} color="#059669" />
                </div>
                <div style={{ ...styles.kpiValue, color: '#059669' }}>
                  {matchCount}
                </div>
                <span style={styles.kpiFooter}>Cocok dari {currentAdminReport?.summary?.totalCounted || 0} bahan dihitung</span>
              </div>

              {/* Card 3: SELISIH (PATUT DICURIGAI) */}
              <div 
                style={{ 
                  ...styles.kpiCard, 
                  borderWidth: adminStatusFilter === 'DISCREPANCY' ? '2px' : '1px',
                  borderColor: adminStatusFilter === 'DISCREPANCY' ? '#dc2626' : totalDiscrepancy > 0 ? '#fecaca' : 'var(--border-color)',
                  backgroundColor: adminStatusFilter === 'DISCREPANCY' ? '#fef2f2' : totalDiscrepancy > 0 ? '#fff8f8' : '#ffffff',
                  cursor: 'pointer'
                }}
                onClick={() => setAdminStatusFilter('DISCREPANCY')}
                title="Tampilkan bahan dengan selisih yang patut dicurigai"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...styles.kpiTitle, color: '#dc2626' }}>SELISIH (PATUT DICURIGAI)</span>
                  <AlertTriangle size={15} color="#dc2626" />
                </div>
                <div style={{ ...styles.kpiValue, color: '#dc2626' }}>
                  {totalDiscrepancy}
                </div>
                <span style={{ ...styles.kpiFooter, color: totalDiscrepancy > 0 ? '#b91c1c' : 'var(--neutral-500)', fontWeight: totalDiscrepancy > 0 ? 600 : 400 }}>
                  {deficitCount} Deficit (Kurang) · {surplusCount} Surplus (Lebih)
                </span>
              </div>
            </div>
          );
        })()}

        {/* Section Table: "Laporan Hari Ini" */}
        <div className="blue-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={styles.sectionTitle}>
                Laporan Hasil Opname: {currentAdminReport?.displayDate || currentDateDisplay}
              </h2>
              <span style={{ fontSize: '0.781rem', color: 'var(--neutral-500)' }}>
                Petugas Closing: <strong>{currentAdminReport?.closedBy || '-'}</strong>
              </span>
            </div>

            {/* Quick Filter Tabs & Applied Status */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', borderRadius: '6px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setAdminStatusFilter('ALL')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: 'none',
                    backgroundColor: adminStatusFilter === 'ALL' ? 'var(--blue-600)' : '#ffffff',
                    color: adminStatusFilter === 'ALL' ? '#ffffff' : 'var(--neutral-600)',
                    cursor: 'pointer'
                  }}
                >
                  Semua ({currentAdminReport?.items?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminStatusFilter('DISCREPANCY')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderLeft: '1px solid var(--border-color)',
                    borderRight: '1px solid var(--border-color)',
                    borderTop: 'none',
                    borderBottom: 'none',
                    backgroundColor: adminStatusFilter === 'DISCREPANCY' ? '#dc2626' : '#ffffff',
                    color: adminStatusFilter === 'DISCREPANCY' ? '#ffffff' : '#b91c1c',
                    cursor: 'pointer'
                  }}
                  title="Filter hanya bahan yang surplus dan deficit (patut dicurigai)"
                >
                  <AlertTriangle size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Selisih Dicurigai ({(currentAdminReport?.summary?.deficitCount || 0) + (currentAdminReport?.summary?.surplusCount || 0)})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminStatusFilter('MATCH')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderLeft: 'none',
                    borderRight: (currentAdminReport?.summary?.uncountedCount || 0) > 0 ? '1px solid var(--border-color)' : 'none',
                    borderTop: 'none',
                    borderBottom: 'none',
                    backgroundColor: adminStatusFilter === 'MATCH' ? '#059669' : '#ffffff',
                    color: adminStatusFilter === 'MATCH' ? '#ffffff' : '#047857',
                    cursor: 'pointer'
                  }}
                  title="Filter hanya bahan yang sudah dihitung dan cocok dengan stok sistem"
                >
                  <Check size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Sesuai ({currentAdminReport?.summary?.matchCount || 0})
                </button>
                {(currentAdminReport?.summary?.uncountedCount || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setAdminStatusFilter('UNCOUNTED')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: adminStatusFilter === 'UNCOUNTED' ? '#f59e0b' : '#ffffff',
                      color: adminStatusFilter === 'UNCOUNTED' ? '#ffffff' : '#b45309',
                      cursor: 'pointer'
                    }}
                    title="Filter bahan yang belum dihitung kasir"
                  >
                    Belum Dihitung ({currentAdminReport?.summary?.uncountedCount || 0})
                  </button>
                )}
              </div>

              {currentAdminReport?.appliedToInventory && (
                <span style={{ ...styles.statusPillMatch, fontSize: '0.75rem' }}>
                  <Check size={12} /> Diterapkan ke Sistem
                </span>
              )}
            </div>
          </div>

          <table className="blue-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>No</th>
                <th>Nama Bahan Baku</th>
                <th>Satuan</th>
                <th style={{ textAlign: 'right' }}>Stok Sistem</th>
                <th style={{ textAlign: 'right' }}>Stok Aktual</th>
                <th style={{ textAlign: 'center' }}>Dicatat Oleh</th>
                <th style={{ textAlign: 'right' }}>Selisih</th>
                <th>Catatan / Keterangan Superadmin</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdminItems.map((item, idx) => {
                const isDeficit = Boolean(item.hasActual && item.status === 'DEFICIT');
                const isSurplus = Boolean(item.hasActual && item.status === 'SURPLUS');
                const isMatch = Boolean(item.hasActual && item.status === 'MATCH');
                const hasNote = Boolean(item.adminNote || item.note);

                return (
                  <tr 
                    key={item.id || idx}
                    style={{
                      backgroundColor: isDeficit ? '#fff8f8' : isSurplus ? '#fffdf5' : 'inherit'
                    }}
                  >
                    <td style={{ textAlign: 'center', color: 'var(--neutral-400)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>{item.name}</td>
                    <td style={{ color: 'var(--neutral-600)' }}>{item.unitName}</td>
                    <td style={{ textAlign: 'right', color: 'var(--neutral-600)' }}>{formatNumber(item.systemStock)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {item.hasActual ? (
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            color: 'var(--neutral-900)'
                          }}
                          title="Klik untuk mengubah stok aktual"
                        >
                          <span>{formatNumber(item.actualStock)}</span>
                          <Edit3 size={11} color="var(--blue-600)" style={{ opacity: 0.65 }} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(item)}
                          style={{
                            background: '#fffbeb',
                            border: '1px dashed #f59e0b',
                            color: '#b45309',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            padding: '2px 6px',
                            cursor: 'pointer'
                          }}
                          title="Klik untuk mengisi stok aktual"
                        >
                          + Isi Stok
                        </button>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.hasActual ? (
                        <span style={{
                          fontSize: '0.813rem',
                          fontWeight: 500,
                          color: 'var(--neutral-700)',
                          backgroundColor: 'var(--neutral-100)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {item.countedBy || currentAdminReport?.closedBy || 'Kasir'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--neutral-400)' }}>-</span>
                      )}
                    </td>
                    <td style={{ 
                      textAlign: 'right', 
                      fontWeight: 700,
                      color: !item.hasActual ? 'var(--neutral-400)' : isDeficit ? '#dc2626' : isSurplus ? '#b45309' : '#059669'
                    }}>
                      {!item.hasActual ? '-' : item.difference > 0 ? `+${formatNumber(item.difference)}` : formatNumber(item.difference)}
                    </td>
                    <td>
                      {hasNote ? (
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'block',
                            width: '100%'
                          }}
                          title="Klik untuk mengubah catatan atau stok aktual"
                        >
                          <span style={styles.adminNoteText}>
                            {item.adminNote || item.note}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(item)}
                          style={styles.addNoteBtn}
                          title="Klik untuk menambah catatan atau stok aktual"
                        >
                          + Catatan
                        </button>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenDetailModal(item)}
                        style={styles.tableActionReviewBtn}
                        title="Lihat Detail"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredAdminItems.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--neutral-500)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={32} color="#059669" />
                      <span style={{ fontWeight: 600, color: 'var(--neutral-700)' }}>
                        {adminStatusFilter === 'DISCREPANCY' 
                          ? 'Bagus! Tidak ada bahan dengan selisih yang patut dicurigai.' 
                          : adminStatusFilter === 'MATCH'
                          ? 'Belum ada bahan yang sesuai dari hasil hitungan fisik.'
                          : adminStatusFilter === 'UNCOUNTED'
                          ? 'Bagus! Semua bahan sudah selesai dihitung.'
                          : 'Tidak ada data bahan baku yang cocok.'}
                      </span>
                      <span style={{ fontSize: '0.813rem' }}>
                        {adminStatusFilter === 'DISCREPANCY'
                          ? 'Semua stok fisik yang diperiksa tercatat sesuai dengan penjualan sistem.'
                          : adminStatusFilter === 'MATCH'
                          ? 'Bahan dikatakan sesuai apabila sudah dihitung fisik dan jumlahnya cocok dengan stok sistem.'
                          : adminStatusFilter === 'UNCOUNTED'
                          ? 'Semua bahan baku telah tercatat stok fisik aktualnya.'
                          : 'Coba ubah kata kunci pencarian atau filter status.'}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="stock-opname-page animate-fade-in" style={styles.container}>
      {isCashier ? renderKasirFlow() : renderSuperAdminFlow()}

      {/* ========================================================= */}
      {/* SCREEN 2: MODAL TAMBAH / EDIT HASIL STOCK OPNAME (KASIR)   */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isEditMode ? 'Ubah Hasil Stock Opname' : 'Tambah Hasil Stock Opname'}
        subtitle="Pilih bahan baku dan masukkan hasil hitungan fisik aktual."
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Field 1: Pilih Bahan Baku */}
          <div>
            <label style={styles.formLabel}>
              Bahan Baku <span style={{ color: '#dc2626' }}>*</span>
            </label>
            
            {!isEditMode ? (
              <div style={styles.relativeField}>
                <Search size={16} color="var(--neutral-400)" style={styles.fieldIcon} />
                <select
                  value={selectedMaterialId}
                  onChange={(e) => {
                    setSelectedMaterialId(e.target.value);
                    setInputActualStock('');
                  }}
                  className="blue-input"
                  style={styles.selectInputWithIcon}
                >
                  <option value="">-- Cari atau pilih bahan baku --</option>
                  {rawMaterials.map((m) => {
                    const isAlreadyCounted = opnameItems[m.id] !== undefined;
                    return (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.unitName || m.unit_name || 'Unit'}) {isAlreadyCounted ? '✓ [Sudah Dihitung]' : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={15} color="var(--neutral-400)" style={styles.fieldChevron} />
              </div>
            ) : (
              <div style={styles.selectedMaterialBadge}>
                <strong>{currentSelectedMaterial?.name}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                  {currentSelectedMaterial?.categoryName || 'Bahan Baku'}
                </span>
              </div>
            )}
          </div>

          {/* Revealed Area after Material Selection */}
          {currentSelectedMaterial && (
            <>
              {/* Satuan Takaran Info Box (KASIR: HANYA SATUAN, TANPA STOK SISTEM) */}
              <div style={styles.referenceBoxSingle}>
                <div style={styles.refItem}>
                  <span style={styles.refLabel}>Satuan Takaran</span>
                  <strong style={styles.refValue}>
                    {currentSelectedMaterial.unitName || 'Unit'}
                  </strong>
                </div>
              </div>

              {/* Field 2: Input Stok Fisik Aktual */}
              <div>
                <label style={styles.formLabel}>
                  Stok Fisik Aktual ({currentSelectedMaterial.unitName || 'Unit'}) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={styles.relativeField}>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Masukkan jumlah fisik aktual..."
                    value={inputActualStock}
                    onChange={(e) => setInputActualStock(e.target.value)}
                    className="blue-input"
                    autoFocus
                    style={styles.actualStockInput}
                  />
                  <span style={styles.unitSuffixLabel}>
                    {currentSelectedMaterial.unitName || 'Unit'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Modal CTAs */}
          <div style={styles.modalFooterActions}>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Batal
            </Button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!isEditMode && (
                <Button
                  variant="outline"
                  onClick={() => handleSaveModalItem(true)}
                  disabled={!selectedMaterialId || inputActualStock === ''}
                  title="Simpan dan langsung pilih bahan berikutnya"
                >
                  Simpan &amp; Lanjut
                </Button>
              )}

              <Button
                variant="primary"
                icon={Check}
                onClick={() => handleSaveModalItem(false)}
                disabled={!selectedMaterialId || inputActualStock === ''}
              >
                {isEditMode ? 'Perbarui Hitungan' : 'Tambahkan'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* SCREEN 4: MODAL KONFIRMASI STORE CLOSING (KASIR)           */}
      {/* ========================================================= */}
      <Modal
        isOpen={isClosingConfirmModalOpen}
        onClose={() => setIsClosingConfirmModalOpen(false)}
        title="Selesaikan Store Closing?"
        subtitle="Konfirmasi penyelesaian opname fisik harian"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--neutral-600)', lineHeight: 1.5 }}>
            Setelah stock opname dikirim, hasil penghitungan hari ini akan dicatat sebagai laporan stock opname dan tidak dapat diubah oleh kasir.
          </p>

          {/* Closing Summary Box (KASIR: HANYA PROGRES HITUNGAN, TANPA DEFICIT/SURPLUS/SESUAI) */}
          <div style={styles.confirmClosingBox}>
            <div style={styles.confirmClosingItem}>
              <span style={styles.confirmLabel}>Total Bahan Baku</span>
              <strong style={styles.confirmVal}>{rawMaterials.length} Bahan</strong>
            </div>
            <div style={styles.confirmClosingItem}>
              <span style={styles.confirmLabel}>Sudah Dihitung</span>
              <strong style={{ ...styles.confirmVal, color: '#059669' }}>{countedItems.length} Bahan</strong>
            </div>
            <div style={styles.confirmClosingItem}>
              <span style={styles.confirmLabel}>Belum Dihitung</span>
              <strong style={{ ...styles.confirmVal, color: uncountedItems.length > 0 ? '#b45309' : '#059669' }}>
                {uncountedItems.length} Bahan
              </strong>
            </div>
            <div style={styles.confirmClosingItem}>
              <span style={styles.confirmLabel}>Kelengkapan</span>
              <strong style={{ ...styles.confirmVal, color: '#2563eb' }}>{opnameSummary.progressPercent || 0}%</strong>
            </div>
          </div>

          <div style={styles.modalFooterActions}>
            <Button
              variant="outline"
              onClick={() => setIsClosingConfirmModalOpen(false)}
            >
              Kembali
            </Button>
            <Button
              variant="primary"
              icon={Check}
              onClick={handleConfirmClosing}
            >
              Selesaikan Closing
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* SCREEN 7: MODAL DETAIL & EDIT STOK AKTUAL & CATATAN       */}
      {/* (SUPERADMIN: BISA ISI / EDIT STOK AKTUAL + CATATAN)       */}
      {/* ========================================================= */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={activeDetailItem?.hasActual ? "Edit Stok Aktual & Catatan" : "Isi Stok Fisik Aktual & Catatan"}
        subtitle="Periksa hasil fisik, sesuaikan stok aktual, dan simpan catatan investigasi"
        size="md"
      >
        {activeDetailItem && (() => {
          const sysStock = Number(activeDetailItem.systemStock ?? 0);
          const hasInput = adminActualStockInput !== '';
          const actualNum = hasInput ? Number(adminActualStockInput) : (activeDetailItem.hasActual ? Number(activeDetailItem.actualStock) : null);
          const diff = actualNum !== null ? Math.round((actualNum - sysStock) * 1000) / 1000 : null;
          let previewStatus = 'MATCH';
          if (diff !== null) {
            if (diff < 0) previewStatus = 'DEFICIT';
            else if (diff > 0) previewStatus = 'SURPLUS';
            else previewStatus = 'MATCH';
          }
          const pricePerUnit = Number(activeDetailItem.pricePerUnit || 0);
          const estimatedDiffValue = diff !== null ? diff * pricePerUnit : 0;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Detail Info Card */}
              <div style={styles.detailCard}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Nama Bahan Baku:</span>
                  <strong style={styles.detailValue}>{activeDetailItem.name}</strong>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Kategori:</span>
                  <span style={styles.detailValue}>{activeDetailItem.categoryName || '-'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Satuan Takaran:</span>
                  <span style={styles.detailValue}>{activeDetailItem.unitName}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Stok Tercatat Sistem:</span>
                  <strong style={{ ...styles.detailValue, color: 'var(--neutral-700)' }}>
                    {formatNumber(sysStock)} {activeDetailItem.unitName}
                  </strong>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Dicatat Oleh:</span>
                  <span style={{ ...styles.detailValue, color: 'var(--neutral-700)' }}>
                    {activeDetailItem.hasActual 
                      ? (activeDetailItem.countedBy || currentAdminReport?.closedBy || 'Kasir') 
                      : 'Belum dihitung'}
                  </span>
                </div>
              </div>

              {/* Field 1: Input / Edit Stok Fisik Aktual */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ ...styles.formLabel, margin: 0 }}>
                    Stok Fisik Aktual ({activeDetailItem.unitName}) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--blue-600)', fontWeight: 600 }}>
                    {activeDetailItem.hasActual ? 'Mode: Ubah Stok' : 'Mode: Isi Baru'}
                  </span>
                </div>
                <div style={styles.relativeField}>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Masukkan jumlah stok fisik aktual..."
                    value={adminActualStockInput}
                    onChange={(e) => setAdminActualStockInput(e.target.value)}
                    className="blue-input"
                    autoFocus
                    style={styles.actualStockInput}
                  />
                  <span style={styles.unitSuffixLabel}>
                    {activeDetailItem.unitName}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '4px', display: 'block' }}>
                  Super Admin berhak menyesuaikan atau mengisi stok fisik aktual hasil pemeriksaan outlet.
                </span>
              </div>

              {/* Discrepancy & Status Live Preview Box */}
              <div style={{
                backgroundColor: diff === null ? 'var(--neutral-50)' : previewStatus === 'DEFICIT' ? '#fff1f2' : previewStatus === 'SURPLUS' ? '#fffdf5' : '#ecfdf5',
                border: `1px solid ${diff === null ? 'var(--border-color)' : previewStatus === 'DEFICIT' ? '#fecdd3' : previewStatus === 'SURPLUS' ? '#fde68a' : '#a7f3d0'}`,
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.813rem', fontWeight: 600, color: 'var(--neutral-700)' }}>
                    Status Hasil Pemeriksaan:
                  </span>
                  <div>
                    {diff === null ? (
                      <span style={styles.statusPillUncounted}>Belum Diisi</span>
                    ) : previewStatus === 'MATCH' ? (
                      <span style={styles.statusPillMatch}>
                        <Check size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                        Sesuai Penjualan
                      </span>
                    ) : previewStatus === 'DEFICIT' ? (
                      <span style={styles.statusPillDeficit}>
                        <AlertTriangle size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                        Deficit (Patut Dicurigai)
                      </span>
                    ) : (
                      <span style={{ ...styles.statusPillDeficit, backgroundColor: '#fffbeb', borderColor: '#fde68a', color: '#b45309' }}>
                        <AlertTriangle size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                        Surplus (Patut Dicurigai)
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.813rem', color: 'var(--neutral-600)' }}>
                    Kuantitas Selisih:
                  </span>
                  <strong style={{ 
                    fontSize: '0.938rem',
                    color: diff === null ? 'var(--neutral-500)' : diff < 0 ? '#dc2626' : diff > 0 ? '#b45309' : '#059669'
                  }}>
                    {diff === null ? '-' : diff > 0 ? `+${formatNumber(diff)} ${activeDetailItem.unitName}` : `${formatNumber(diff)} ${activeDetailItem.unitName}`}
                  </strong>
                </div>

                {/* Context Warning Alert: Both Deficit and Surplus are suspicious */}
                {diff !== null && diff !== 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    backgroundColor: diff < 0 ? '#fff5f5' : '#fffbeb',
                    border: `1px solid ${diff < 0 ? '#fed7d7' : '#fef3c7'}`,
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: diff < 0 ? '#991b1b' : '#92400e',
                    lineHeight: 1.4
                  }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>Perhatian — Selisih Patut Dicurigai:</strong>
                      {diff < 0 ? (
                        <span> Stok fisik lebih sedikit dari sistem (Deficit). Patut dicurigai adanya takaran porsi berlebih saat melayani customer, bahan terbuang/tumpah tanpa dicatat, atau kehilangan.</span>
                      ) : (
                        <span> Stok fisik melebihi sistem (Surplus). Patut dicurigai kemungkinan takaran porsi menu customer dikurangi (*under-portioning*), transaksi menu belum terinput ke sistem, atau salah hitung fisik.</span>
                      )}
                    </div>
                  </div>
                )}

                {diff === 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #d1fae5',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#065f46'
                  }}>
                    <CheckCircle2 size={14} color="#059669" />
                    <span>Stok fisik cocok dengan sisa stok sistem hasil pengurangan pesanan menu yang dibeli customer.</span>
                  </div>
                )}

                {diff !== null && pricePerUnit > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                      Estimasi Nilai Selisih:
                    </span>
                    <span style={{ 
                      fontSize: '0.813rem', 
                      fontWeight: 600,
                      color: estimatedDiffValue < 0 ? '#dc2626' : estimatedDiffValue > 0 ? '#b45309' : '#059669'
                    }}>
                      {formatIDR(estimatedDiffValue)}
                    </span>
                  </div>
                )}
              </div>

              {/* Field 2: Catatan Superadmin Input */}
              <div>
                <label style={styles.formLabel}>
                  Catatan Superadmin / Hasil Investigasi:
                </label>
                <textarea
                  rows={3}
                  className="blue-input"
                  placeholder="Tulis alasan perubahan stok fisik atau catatan investigasi selisih..."
                  value={adminInvestigationNote}
                  onChange={(e) => setAdminInvestigationNote(e.target.value)}
                  style={styles.adminTextarea}
                />
              </div>

              <div style={styles.modalFooterActions}>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  icon={Save}
                  onClick={handleSaveAdminDetail}
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Embedded Mobile Responsive Styles */}
      <style>{`
        .opname-kasir-dashboard,
        .opname-superadmin-screen,
        .opname-review-screen {
          width: 100%;
        }

        @media (max-width: 1024px) {
          .stock-opname-page {
            padding: 0 !important;
          }
        }

        @media (max-width: 768px) {
          .counted-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .app-navbar,
          .app-sidebar,
          .opname-header-actions,
          .admin-mode-banner,
          .opname-add-btn {
            display: none !important;
          }
          .blue-card,
          .blue-card * {
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
};

// -------------------------------------------------------------
// STYLES OBJECT
// -------------------------------------------------------------
const styles = {
  container: {
    padding: '24px',
    maxWidth: '100%',
    margin: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box'
  },
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    width: '100%'
  },
  headerSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    margin: 0,
    letterSpacing: '-0.02em'
  },
  pageSubtitle: {
    fontSize: '0.813rem',
    color: 'var(--neutral-500)',
    margin: '4px 0 0'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  sessionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--blue-700)',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    padding: '2px 8px',
    borderRadius: '999px'
  },
  statusBadgeWarning: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#b45309',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    padding: '2px 8px',
    borderRadius: '999px'
  },
  outletBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--neutral-600)',
    backgroundColor: 'var(--neutral-100)',
    border: '1px solid var(--border-color)',
    padding: '2px 8px',
    borderRadius: '999px'
  },
  progressBarCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    boxShadow: 'var(--shadow-xs)'
  },
  progressBarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.75rem'
  },
  progressLabel: {
    fontWeight: 700,
    color: 'var(--neutral-500)',
    letterSpacing: '0.5px'
  },
  progressCounter: {
    color: 'var(--blue-600)'
  },
  progressBarTrack: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--blue-600)',
    borderRadius: '999px',
    transition: 'width 0.3s ease'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    width: '100%'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: 'var(--shadow-xs)'
  },
  kpiTitle: {
    fontSize: '0.688rem',
    fontWeight: 700,
    color: 'var(--neutral-500)',
    letterSpacing: '0.4px'
  },
  kpiValue: {
    fontSize: '1.375rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    lineHeight: 1.2
  },
  kpiUnit: {
    fontSize: '0.813rem',
    fontWeight: 500,
    color: 'var(--neutral-400)'
  },
  kpiFooter: {
    fontSize: '0.688rem',
    color: 'var(--neutral-400)',
    marginTop: '2px'
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: 'var(--shadow-xs)'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  sectionTitle: {
    fontSize: '1.063rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    margin: 0
  },
  sectionFilterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  pillBtn: {
    padding: '5px 10px',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: '999px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--neutral-50)',
    color: 'var(--neutral-600)',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  pillBtnActive: {
    backgroundColor: 'var(--blue-600)',
    color: '#ffffff',
    borderColor: 'var(--blue-600)'
  },
  miniSearchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '160px'
  },
  miniSearchIcon: {
    position: 'absolute',
    left: '8px',
    pointerEvents: 'none'
  },
  miniSearchInput: {
    width: '100%',
    height: '30px',
    fontSize: '0.75rem',
    paddingLeft: '26px',
    paddingRight: '22px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--neutral-50)',
    boxSizing: 'border-box'
  },
  miniSearchClear: {
    position: 'absolute',
    right: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--neutral-400)',
    padding: 0
  },
  countedCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px'
  },
  countedCard: {
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'all 0.15s ease'
  },
  countedCardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px'
  },
  countedCardName: {
    fontSize: '0.938rem',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    margin: 0,
    lineHeight: 1.3
  },
  countedCardCategory: {
    fontSize: '0.688rem',
    fontWeight: 600,
    color: 'var(--neutral-500)',
    backgroundColor: 'var(--neutral-200)',
    padding: '1px 5px',
    borderRadius: '4px',
    display: 'inline-block',
    marginTop: '3px'
  },
  countedCardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  cardActionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--neutral-500)',
    padding: '4px',
    borderRadius: '4px'
  },
  countedCardMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px'
  },
  metricBox: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '6px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  metricBoxLabel: {
    fontSize: '0.625rem',
    color: 'var(--neutral-400)',
    fontWeight: 600
  },
  metricBoxValue: {
    fontSize: '0.813rem',
    fontWeight: 700,
    color: 'var(--neutral-700)'
  },
  metricBoxUnit: {
    fontSize: '0.625rem',
    fontWeight: 500,
    color: 'var(--neutral-400)'
  },
  countedCardBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  statusPillMatch: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '2px 7px',
    borderRadius: '999px'
  },
  statusPillDeficit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '2px 7px',
    borderRadius: '999px'
  },
  statusPillSurplus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    padding: '2px 7px',
    borderRadius: '999px'
  },
  statusPillUncounted: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 600,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    padding: '2px 8px',
    borderRadius: '999px'
  },
  statusPillCounted: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '2px 8px',
    borderRadius: '999px'
  },
  statusPillWarning: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#b45309',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    padding: '2px 7px',
    borderRadius: '999px'
  },
  // Success Screen 5
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    width: '100%',
    boxSizing: 'border-box'
  },
  successCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '36px 28px',
    maxWidth: '520px',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: 'var(--shadow-md)'
  },
  successIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '999px',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  successDateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--neutral-600)',
    backgroundColor: 'var(--neutral-100)',
    padding: '2px 8px',
    borderRadius: '999px',
    marginBottom: '10px'
  },
  successTitle: {
    fontSize: '1.375rem',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    margin: '0 0 8px 0'
  },
  successMessage: {
    fontSize: '0.875rem',
    color: 'var(--neutral-600)',
    lineHeight: 1.5,
    margin: '0 0 24px 0'
  },
  successMetricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    width: '100%',
    marginBottom: '24px'
  },
  successMetricBox: {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  successMetricValue: {
    fontSize: '1.125rem',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  successMetricLabel: {
    fontSize: '0.688rem',
    color: 'var(--neutral-500)'
  },
  // Review Screen
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  warningAlertBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  tableToolbar: {
    padding: '14px 18px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    backgroundColor: '#ffffff'
  },
  tableFooterBar: {
    padding: '12px 18px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    backgroundColor: 'var(--neutral-50)'
  },
  tableActionInputBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#ffffff',
    backgroundColor: 'var(--blue-600)',
    border: 'none',
    borderRadius: '6px',
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  tableActionEditBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--blue-600)',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  tableActionResetBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: 'var(--neutral-400)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '4px 6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  // Modal Fields
  formLabel: {
    display: 'block',
    fontSize: '0.813rem',
    fontWeight: 700,
    color: 'var(--neutral-800)',
    marginBottom: '6px'
  },
  relativeField: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  fieldIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none'
  },
  fieldChevron: {
    position: 'absolute',
    right: '12px',
    pointerEvents: 'none'
  },
  selectInputWithIcon: {
    width: '100%',
    height: '42px',
    paddingLeft: '36px',
    paddingRight: '32px',
    fontSize: '0.875rem'
  },
  selectedMaterialBadge: {
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  referenceBox: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px'
  },
  referenceBoxSingle: {
    display: 'flex',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px'
  },
  refItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  refLabel: {
    fontSize: '0.688rem',
    color: 'var(--neutral-400)',
    fontWeight: 600
  },
  refValue: {
    fontSize: '0.938rem',
    color: 'var(--neutral-800)',
    fontWeight: 700
  },
  actualStockInput: {
    width: '100%',
    height: '44px',
    fontSize: '1.125rem',
    fontWeight: 700,
    paddingRight: '60px'
  },
  unitSuffixLabel: {
    position: 'absolute',
    right: '14px',
    fontSize: '0.813rem',
    fontWeight: 600,
    color: 'var(--neutral-400)',
    pointerEvents: 'none'
  },
  feedbackBox: {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  feedbackRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  feedbackLabel: {
    fontSize: '0.813rem',
    color: 'var(--neutral-600)',
    fontWeight: 600
  },
  modalFooterActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)'
  },
  confirmClosingBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '14px'
  },
  confirmClosingItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  confirmLabel: {
    fontSize: '0.688rem',
    color: 'var(--neutral-400)',
    fontWeight: 600
  },
  confirmVal: {
    fontSize: '0.938rem',
    color: 'var(--neutral-900)'
  },
  // Superadmin styles
  adminModeBanner: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '10px',
    padding: '10px 16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px'
  },
  adminFilterBar: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  filterFieldGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  dateInput: {
    height: '32px',
    fontSize: '0.813rem',
    padding: '0 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)'
  },
  outletSelect: {
    height: '32px',
    fontSize: '0.813rem',
    padding: '0 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)'
  },
  adminNoteText: {
    fontSize: '0.813rem',
    color: 'var(--neutral-800)',
    fontStyle: 'italic',
    lineHeight: 1.3
  },
  addNoteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '0.75rem',
    color: 'var(--blue-600)',
    cursor: 'pointer',
    padding: 0,
    fontWeight: 600
  },
  tableActionReviewBtn: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--blue-600)',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer'
  },
  detailCard: {
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.813rem'
  },
  detailLabel: {
    color: 'var(--neutral-500)',
    fontWeight: 500
  },
  detailValue: {
    color: 'var(--neutral-800)',
    fontWeight: 600
  },
  adminTextarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '0.875rem',
    lineHeight: 1.4,
    borderRadius: '8px',
    boxSizing: 'border-box'
  },
  closedSummaryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  closedTimestamp: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    color: 'var(--neutral-500)'
  }
};
