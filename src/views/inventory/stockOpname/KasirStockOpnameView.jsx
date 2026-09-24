import React, { useState, useMemo } from 'react';
import { useStockOpname } from '../../../controllers/StockOpnameController';
import { useAuth } from '../../../controllers/AuthController';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Send, 
  Search, 
  X, 
  Check, 
  Clock, 
  ArrowLeft,
  RotateCcw,
  Eye,
  Edit3,
  Lock
} from 'lucide-react';
import { formatDateIndonesian, getLocalDateStr } from '../../../utils/dateUtils';
import { toast } from '../../components/Toast';
import { KasirOpnameHistory } from './KasirOpnameHistory';

export const KasirStockOpnameView = ({ onBack, isAdminCreating = false }) => {
  const { currentUser } = useAuth();
  const {
    todayReport,
    activeMasterMaterials = [],
    draftStocks = {},
    draftSummary,
    updateDraftStock,
    submitOpnameReport,
    startEditingReport,
    isSubmitting,
    isLoading
  } = useStockOpname();

  const todayStr = useMemo(() => getLocalDateStr(), []);
  const displayDate = useMemo(() => formatDateIndonesian(todayStr), [todayStr]);

  // UI state
  const [viewMode, setViewMode] = useState('FORM'); // 'FORM' | 'HISTORY'
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'UNCOUNTED' | 'COUNTED'
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingSubmitted, setIsEditingSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // If today's report exists and not explicitly in edit mode
  const isAlreadySubmitted = Boolean(todayReport) && !isEditingSubmitted && !isAdminCreating;

  // Filter items based on filterMode and searchQuery
  const filteredItems = useMemo(() => {
    return (draftSummary?.items || []).filter(item => {
      // 1. Status Filter
      if (filterMode === 'UNCOUNTED' && item.actualStock !== null) return false;
      if (filterMode === 'COUNTED' && item.actualStock === null) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const categoryMatch = (item.categoryName || '').toLowerCase().includes(q);
        return nameMatch || categoryMatch;
      }

      return true;
    });
  }, [draftSummary?.items, filterMode, searchQuery]);

  // Handle Save Draft locally
  const handleSaveDraft = () => {
    toast.success('Draft stok fisik berhasil disimpan di perangkat ini.');
  };

  // Handle trigger submit
  const handleTriggerSubmit = () => {
    if (!draftSummary.isComplete) {
      toast.error(`Masih ada ${draftSummary.uncountedCount} bahan yang belum diisi!`);
      setFilterMode('UNCOUNTED');
      return;
    }
    setShowConfirmModal(true);
  };

  // Confirm and Submit
  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    const res = await submitOpnameReport();
    if (res?.success) {
      setIsEditingSubmitted(false);
    }
  };

  const isTodayApplied = Boolean(todayReport?.isApplied || todayReport?.status === 'APPLIED' || todayReport?.appliedAt || todayReport?.isLockedForKasir || todayReport?.needsReapply);

  // Switch to History View
  if (viewMode === 'HISTORY') {
    return (
      <KasirOpnameHistory
        onBackToForm={() => setViewMode('FORM')}
        onEditReport={(report) => {
          startEditingReport(report);
          setIsEditingSubmitted(true);
          setViewMode('FORM');
        }}
      />
    );
  }

  // If already submitted and user is just viewing today's report
  if (isAlreadySubmitted && todayReport) {
    const isVoid = todayReport.status === 'VOID';
    const discrepancyCount = (todayReport.summary?.deficitCount || 0) + (todayReport.summary?.surplusCount || 0);

    return (
      <div className="stock-opname-page animate-fade-in" style={styles.container}>
        {/* Header */}
        <div className="stock-opname-header" style={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={styles.title}>Stock Opname</h1>
              <Badge variant="primary">Kasir POS</Badge>
            </div>
            <p style={styles.subtitle}>{displayDate}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="outline"
              icon={ClipboardCheck}
              onClick={() => setViewMode('HISTORY')}
              size="sm"
            >
              Riwayat Laporan
            </Button>
            {onBack && (
              <Button variant="secondary" icon={ArrowLeft} onClick={onBack} size="sm">
                Kembali
              </Button>
            )}
          </div>
        </div>

        {/* Submitted Status Card */}
        <div className="stock-opname-submitted-card" style={styles.submittedCard}>
          <div style={styles.submittedIconWrap}>
            {isTodayApplied ? (
              <div style={{ backgroundColor: '#d1fae5', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={30} color="#059669" />
              </div>
            ) : (
              <CheckCircle2 size={36} color="#059669" />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={styles.submittedTitle}>
                {isTodayApplied ? 'Stock Opname Hari Ini Telah Diterapkan & Dikunci' : 'Stock Opname Hari Ini Sudah Dikirim'}
              </h3>
              {isTodayApplied ? (
                <span style={styles.appliedLockedBadge}>
                  <Lock size={11} /> DITERAPKAN (TERKUNCI)
                </span>
              ) : (
                <span style={styles.submittedBadge}>TERKIRIM</span>
              )}
            </div>
            <p style={styles.submittedMeta}>
              Dibuat oleh: <strong>{todayReport.createdBy?.name || 'Kasir'}</strong> • Waktu: {todayReport.submittedAt ? new Date(todayReport.submittedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
            </p>
            {isTodayApplied && (
              <p style={{ margin: '6px 0 2px 0', fontSize: '12.5px', color: '#047857', fontWeight: 600 }}>
                ✓ Laporan telah disetujui & diterapkan oleh Admin ke saldo stok bahan baku. Laporan ini telah dikunci permanen dan tidak dapat diubah lagi oleh kasir.
              </p>
            )}
            <div style={styles.submittedStats}>
              <span>Total <strong>{todayReport.summary?.totalMaterials || todayReport.items?.length || 0}</strong> bahan tercatat</span>
            </div>
          </div>

          <div style={styles.submittedActions}>
            <Button
              variant="secondary"
              icon={Eye}
              onClick={() => setShowDetailModal(true)}
              size="sm"
            >
              Lihat Rincian
            </Button>
            {!isTodayApplied && (
              <Button
                variant="primary"
                icon={Edit3}
                onClick={() => {
                  startEditingReport(todayReport);
                  setIsEditingSubmitted(true);
                }}
                size="sm"
              >
                Edit Laporan
              </Button>
            )}
          </div>
        </div>

        {/* Modal Rincian Laporan Hari Ini */}
        {showDetailModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <div style={styles.modalHeader}>
                <div>
                  <h3 style={styles.modalTitle}>Rincian Stock Opname Hari Ini</h3>
                  <p style={styles.modalSubtitle}>{displayDate} • Oleh {todayReport.createdBy?.name || 'Kasir'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(todayReport.items || []).map((item, idx) => {
                    const diff = item.difference ?? 0;
                    const isMatch = diff === 0;
                    return (
                      <div key={item.rawMaterialId || idx} style={styles.modalItemRow}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--neutral-900)' }}>
                            {item.name}
                          </div>
                          {item.categoryName && (
                            <div style={{ fontSize: '11.5px', color: 'var(--neutral-400)' }}>
                              {item.categoryName}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--neutral-900)' }}>
                            {item.actualStock} {item.unitName}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={styles.modalFooter}>
                <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Input Mode (Section 4 & 5)
  return (
    <div className="stock-opname-page animate-fade-in" style={styles.container}>
      {/* Header */}
      <div className="stock-opname-header" style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={styles.title}>Stock Opname</h1>
            {isEditingSubmitted && <Badge variant="warning">Mode Revisi</Badge>}
            {isAdminCreating && <Badge variant="primary">Input Admin</Badge>}
          </div>
          <p style={styles.subtitle}>{displayDate} • Cek dan masukkan kuantitas fisik aktual</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            icon={ClipboardCheck}
            onClick={() => setViewMode('HISTORY')}
            size="sm"
          >
            Riwayat Laporan
          </Button>
          {onBack && (
            <Button variant="secondary" icon={ArrowLeft} onClick={onBack} size="sm">
              Kembali
            </Button>
          )}
        </div>
      </div>

      {/* Progress & Validation Card (Section 4 & 5) */}
      <div className="stock-opname-progress-card" style={styles.progressCard}>
        <div style={styles.progressTopRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={styles.progressText}>
              <strong>{draftSummary?.countedCount || 0}</strong> / {draftSummary?.totalMaterials || activeMasterMaterials.length} bahan sudah diisi
            </span>
            {draftSummary?.isComplete && (
              <span style={styles.completeCheckBadge}>
                <Check size={12} /> Lengkap
              </span>
            )}
          </div>
          <span style={styles.progressPercent}>{draftSummary?.progressPercent || 0}%</span>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBarTrack}>
          <div 
            style={{ 
              ...styles.progressBarFill, 
              width: `${draftSummary?.progressPercent || 0}%`,
              backgroundColor: draftSummary?.isComplete ? '#059669' : 'var(--primary-600)'
            }} 
          />
        </div>

        {/* Validation Notice if not complete */}
        {!draftSummary?.isComplete && (draftSummary?.uncountedCount || 0) > 0 && (
          <div style={styles.uncountedAlert}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#b45309" />
              <span style={styles.uncountedAlertText}>
                Masih ada <strong>{draftSummary.uncountedCount} bahan</strong> yang belum diisi.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFilterMode(filterMode === 'UNCOUNTED' ? 'ALL' : 'UNCOUNTED')}
              style={styles.uncountedFilterBtn}
            >
              {filterMode === 'UNCOUNTED' ? 'Tampilkan Semua' : 'Lihat yang Belum Diisi'}
            </button>
          </div>
        )}
      </div>

      {/* Filter Pills & Quick Search */}
      <div className="stock-opname-controls" style={styles.controlsRow}>
        <div className="stock-opname-pill-group" style={styles.pillGroup}>
          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className="stock-opname-pill-btn"
            style={{
              ...styles.pillBtn,
              ...(filterMode === 'ALL' ? styles.pillBtnActive : {})
            }}
          >
            Semua ({draftSummary?.totalMaterials || activeMasterMaterials.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('UNCOUNTED')}
            className="stock-opname-pill-btn"
            style={{
              ...styles.pillBtn,
              ...(filterMode === 'UNCOUNTED' ? styles.pillBtnActiveAlert : {})
            }}
          >
            Belum Diisi ({draftSummary?.uncountedCount || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('COUNTED')}
            className="stock-opname-pill-btn"
            style={{
              ...styles.pillBtn,
              ...(filterMode === 'COUNTED' ? styles.pillBtnActive : {})
            }}
          >
            Sudah Diisi ({draftSummary?.countedCount || 0})
          </button>
        </div>

        {/* Search Input */}
        <div className="stock-opname-search" style={styles.searchWrap}>
          <Search size={14} color="var(--neutral-400)" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari nama bahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Items List (Mobile-First Simple Cards) */}
      <div className="stock-opname-items-list" style={styles.itemsContainer}>
        {filteredItems.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={{ margin: 0, color: 'var(--neutral-500)', fontSize: '13px' }}>
              Tidak ada bahan baku yang cocok dengan filter.
            </p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const hasActual = item.actualStock !== null && item.actualStock !== undefined;
            const hasValidCategory = item.categoryName && item.categoryName.trim() !== '-' && item.categoryName.trim() !== '';

            return (
              <div 
                key={item.rawMaterialId} 
                className="stock-opname-card mobile-unit-card"
                style={{
                  ...styles.mobileRawCard,
                  borderColor: hasActual ? 'var(--blue-300)' : 'var(--border-color)',
                  boxShadow: hasActual ? '0 2px 6px rgba(37,99,235,0.06)' : '0 2px 4px rgba(0,0,0,0.03)'
                }}
              >
                {/* Left/Top Section: #No tag, Material Name, and Category Badge */}
                <div className="stock-opname-card-main">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <span style={styles.rowNumberTag}>
                      #{index + 1}
                    </span>
                    <span className="stock-opname-card-name" style={{ fontSize: '0.938rem', fontWeight: 700, color: 'var(--neutral-900)', wordBreak: 'break-word', lineHeight: 1.25 }}>
                      {item.name}
                    </span>
                  </div>
                  {hasValidCategory && (
                    <span style={styles.categoryBadge}>
                      {item.categoryName}
                    </span>
                  )}
                </div>

                {/* Right/Bottom Section: Input & Status Box */}
                <div className="stock-opname-detail-grid mobile-detail-grid" style={styles.mobileDetailGrid}>
                  <div className="stock-opname-detail-info" style={styles.mobileDetailBox}>
                    <span className="stock-opname-detail-label" style={styles.mobileDetailLabel}>Input Stok Fisik</span>
                    <span className="stock-opname-detail-status" style={{ fontSize: '0.75rem', color: hasActual ? '#059669' : 'var(--neutral-400)', fontWeight: 600 }}>
                      {hasActual ? '✓ Sudah Diisi' : 'Belum Diisi'}
                    </span>
                  </div>

                  {/* Touch-Friendly Input */}
                  <div className="stock-opname-input-wrap" style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      ...styles.inputGroup,
                      borderColor: hasActual ? 'var(--blue-500)' : 'var(--border-color)',
                      boxShadow: hasActual ? '0 0 0 1px var(--blue-100)' : 'none'
                    }}>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0"
                        value={draftStocks[item.rawMaterialId] ?? ''}
                        onChange={(e) => updateDraftStock(item.rawMaterialId, e.target.value)}
                        style={styles.actualInput}
                      />
                      <span style={styles.unitSuffix}>{item.unitName}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Actions Bar (Section 4) */}
      <div className="stock-opname-bottom-bar" style={styles.bottomBar}>
        <div className="stock-opname-bottom-inner" style={styles.bottomBarInner}>
          {/* Progress info placed ABOVE buttons on mobile, sejajar on desktop */}
          <div className="stock-opname-bottom-stats" style={styles.bottomStats}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--neutral-600)' }}>
                Progres: <strong>{draftSummary?.countedCount || 0} / {draftSummary?.totalMaterials || activeMasterMaterials.length}</strong> bahan
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: draftSummary?.isComplete ? '#059669' : 'var(--blue-600)' }}>
                {draftSummary?.progressPercent || 0}%
              </span>
            </div>
            <div style={styles.miniProgressTrack}>
              <div 
                style={{
                  ...styles.miniProgressFill,
                  width: `${draftSummary?.progressPercent || 0}%`,
                  backgroundColor: draftSummary?.isComplete ? '#059669' : 'var(--blue-600)'
                }} 
              />
            </div>
          </div>

          <div className="stock-opname-bottom-buttons" style={styles.bottomButtons}>
            <Button
              variant="secondary"
              icon={Save}
              onClick={handleSaveDraft}
              size="md"
              style={{ flex: 1 }}
            >
              Simpan Draft
            </Button>
            <Button
              variant={draftSummary.isComplete ? 'primary' : 'secondary'}
              icon={Send}
              onClick={handleTriggerSubmit}
              disabled={isSubmitting}
              style={{
                flex: 1,
                backgroundColor: draftSummary.isComplete ? '#059669' : undefined,
                borderColor: draftSummary.isComplete ? '#059669' : undefined,
                color: draftSummary.isComplete ? '#FFFFFF' : undefined
              }}
              size="md"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardSmall}>
            <div style={styles.confirmIconWrap}>
              <CheckCircle2 size={40} color="#059669" />
            </div>
            <h3 style={styles.confirmTitle}>Kirim Laporan Stock Opname?</h3>
            <p style={styles.confirmDesc}>
              Seluruh <strong>{draftSummary.totalMaterials} bahan baku</strong> telah diisi. Laporan untuk tanggal <strong>{displayDate}</strong> akan tercatat dan dapat ditinjau oleh Admin.
            </p>

            <div style={styles.confirmActions}>
              <Button
                variant="secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
              >
                {isSubmitting ? 'Mengirim...' : 'Ya, Kirim Laporan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Responsive Styles: Desktop Sejajar Center & Mobile 16px spacing rules */}
      <style>{`
        /* Desktop: Sejajar Center */
        @media (min-width: 769px) {
          .stock-opname-card {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 12px 18px !important;
            gap: 16px !important;
          }
          .stock-opname-card-main {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            flex: 1 !important;
            min-width: 0 !important;
          }
          .stock-opname-detail-grid {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: flex-end !important;
            gap: 14px !important;
            background-color: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            flex-shrink: 0 !important;
          }
          .stock-opname-detail-info {
            display: flex !important;
            align-items: center !important;
          }
          .stock-opname-detail-label {
            display: none !important;
          }
          .stock-opname-detail-status {
            font-size: 0.813rem !important;
            white-space: nowrap !important;
          }
          .stock-opname-bottom-bar {
            left: var(--sidebar-width, 260px) !important;
            right: 0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            box-sizing: border-box !important;
            transition: left var(--transition-smooth, 0.2s) !important;
          }
          .stock-opname-bottom-inner {
            width: 100% !important;
            max-width: 800px !important;
            margin: 0 auto !important;
            padding: 0 20px !important;
            box-sizing: border-box !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 24px !important;
          }
          .stock-opname-bottom-stats {
            width: auto !important;
            flex: 1 !important;
            max-width: 380px !important;
          }
          .stock-opname-bottom-buttons {
            display: flex !important;
            flex-direction: row !important;
            width: auto !important;
            gap: 12px !important;
          }
          .stock-opname-bottom-buttons > button {
            flex: initial !important;
            min-width: 140px !important;
          }
        }

        /* Mobile Layout (< 768px): Card Stok Bahan Baku & 16px Spacing */
        @media (max-width: 768px) {
          .stock-opname-page {
            padding: 0 0 135px 0 !important;
            margin: 0 !important;
            gap: 16px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .stock-opname-header {
            margin-bottom: 0 !important;
            gap: 10px !important;
          }
          .stock-opname-progress-card {
            margin-bottom: 0 !important;
            padding: 16px !important;
            border-radius: 12px !important;
          }
          .stock-opname-controls {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            margin-bottom: 0 !important;
          }
          .stock-opname-pill-group {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .stock-opname-pill-btn {
            padding: 8px 6px !important;
            font-size: 12px !important;
            text-align: center !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .stock-opname-search {
            width: 100% !important;
            min-width: 100% !important;
          }
          .stock-opname-search input {
            height: 42px !important;
            font-size: 13.5px !important;
          }
          .stock-opname-items-list {
            gap: 12px !important;
            margin-bottom: 16px !important;
          }
          .stock-opname-card {
            margin: 0 !important;
            padding: 12px 14px !important;
            border-radius: 10px !important;
            background-color: #ffffff !important;
            border: 1px solid var(--border-color) !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03) !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          .stock-opname-card-main {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
          }
          .stock-opname-detail-grid {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 10px !important;
            padding: 9px 12px !important;
            background-color: var(--neutral-50) !important;
            border: 1px solid var(--border-subtle, #f1f5f9) !important;
            border-radius: 8px !important;
          }
          .stock-opname-detail-info {
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
          }
          .stock-opname-detail-label {
            display: block !important;
          }
          .stock-opname-bottom-bar {
            left: 0 !important;
            right: 0 !important;
            padding: 10px 16px 14px 16px !important;
          }
          .stock-opname-bottom-inner {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .stock-opname-bottom-stats {
            width: 100% !important;
          }
          .stock-opname-bottom-buttons {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .stock-opname-bottom-buttons > button {
            width: 100% !important;
          }
          .stock-opname-submitted-card {
            padding: 16px !important;
            border-radius: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px 20px 130px 20px',
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px'
  },
  title: {
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    margin: 0,
    letterSpacing: '-0.02em'
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--neutral-500)',
    margin: '4px 0 0 0'
  },

  // Progress Card
  progressCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: 'var(--shadow-xs)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  progressTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressText: {
    fontSize: '13.5px',
    color: 'var(--neutral-700)'
  },
  progressPercent: {
    fontSize: '13.5px',
    fontWeight: 700,
    color: 'var(--neutral-900)'
  },
  completeCheckBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#065f46',
    backgroundColor: '#d1fae5',
    padding: '2px 6px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
  },
  progressBarTrack: {
    height: '10px',
    backgroundColor: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.25s ease, background-color 0.25s ease'
  },
  uncountedAlert: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fef3c7',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '4px'
  },
  uncountedAlertText: {
    fontSize: '12.5px',
    color: '#92400e'
  },
  uncountedFilterBtn: {
    background: 'none',
    border: 'none',
    color: '#b45309',
    fontSize: '12px',
    fontWeight: 700,
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: 0
  },

  // Controls Row
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  pillGroup: {
    display: 'flex',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: '8px',
    padding: '3px',
    gap: '3px'
  },
  pillBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--neutral-600)',
    cursor: 'pointer'
  },
  pillBtnActive: {
    backgroundColor: '#FFFFFF',
    color: 'var(--blue-600)',
    boxShadow: 'var(--shadow-xs)'
  },
  pillBtnActiveAlert: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    boxShadow: 'var(--shadow-xs)'
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '200px'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px'
  },
  searchInput: {
    width: '100%',
    padding: '7px 26px 7px 30px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '12.5px',
    backgroundColor: '#FFFFFF'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--neutral-400)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Items List
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  rowNumberTag: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--blue-600)',
    backgroundColor: 'var(--blue-50)',
    border: '1px solid var(--blue-200)',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block',
    flexShrink: 0
  },
  categoryBadge: {
    fontSize: '0.688rem',
    fontWeight: 600,
    color: 'var(--neutral-500)',
    backgroundColor: 'var(--neutral-100)',
    border: '1px solid var(--border-subtle, #e2e8f0)',
    padding: '2px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    flexShrink: 0
  },
  mobileRawCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '12px 14px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  mobileDetailGrid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '9px 12px',
    backgroundColor: 'var(--neutral-50)',
    borderRadius: '8px',
    border: '1px solid var(--border-subtle, #f1f5f9)'
  },
  mobileDetailBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '0.813rem'
  },
  mobileDetailLabel: {
    fontSize: '0.688rem',
    color: 'var(--neutral-500)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    height: '38px',
    boxSizing: 'border-box'
  },
  actualInput: {
    width: '80px',
    height: '38px',
    border: 'none',
    padding: '0 8px',
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    outline: 'none',
    textAlign: 'center',
    backgroundColor: '#FFFFFF'
  },
  unitSuffix: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--neutral-600)',
    padding: '0 10px',
    backgroundColor: '#f8fafc',
    borderLeft: '1px solid var(--border-color)',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap'
  },
  emptyCard: {
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid var(--border-color)'
  },

  // Bottom Sticky Bar
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: 'var(--sidebar-width, 260px)',
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid var(--border-color)',
    padding: '10px 0 12px 0',
    boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
    zIndex: 90,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  bottomBarInner: {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '8px'
  },
  bottomStats: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  miniProgressTrack: {
    width: '100%',
    height: '3px',
    backgroundColor: 'var(--neutral-100)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  miniProgressFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  bottomButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%'
  },

  // Submitted State Card
  submittedCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #d1fae5',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    boxShadow: 'var(--shadow-sm)'
  },
  submittedIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  submittedTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    margin: 0
  },
  submittedBadge: {
    fontSize: '10.5px',
    fontWeight: 800,
    color: '#065f46',
    backgroundColor: '#d1fae5',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  appliedLockedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 800,
    color: '#065f46',
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  submittedMeta: {
    fontSize: '12.5px',
    color: 'var(--neutral-600)',
    margin: '4px 0 0 0'
  },
  submittedStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--neutral-500)',
    marginTop: '6px'
  },
  submittedActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  // Modals
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px'
  },
  modalCardSmall: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    padding: '24px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    boxShadow: 'var(--shadow-lg)'
  },
  confirmIconWrap: {
    marginBottom: '12px'
  },
  confirmTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    margin: 0
  },
  confirmDesc: {
    fontSize: '13px',
    color: 'var(--neutral-600)',
    margin: '8px 0 20px 0',
    lineHeight: 1.5
  },
  confirmActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px'
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    maxWidth: '550px',
    width: '100%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    margin: 0
  },
  modalSubtitle: {
    fontSize: '12px',
    color: 'var(--neutral-500)',
    margin: '3px 0 0 0'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--neutral-400)',
    padding: '4px'
  },
  modalBody: {
    padding: '16px 20px',
    overflowY: 'auto',
    flex: 1
  },
  modalItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  modalFooter: {
    padding: '12px 20px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end'
  }
};
