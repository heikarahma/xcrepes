import React, { useState, useMemo } from 'react';
import { useStockOpname } from '../../../controllers/StockOpnameController';
import { useAuth } from '../../../controllers/AuthController';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  ArrowLeft, 
  Edit3, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  X, 
  Calendar, 
  User, 
  Clock,
  RotateCcw,
  Lock,
  FileText
} from 'lucide-react';
import { formatDateIndonesian, formatDateTimeIndonesian } from '../../../utils/dateUtils';
import { toast } from '../../components/Toast';
import { exportSingleOpnameReportToPDF } from '../../../utils/reportExportUtils';

export const AdminOpnameDetailView = ({ report, onBack }) => {
  const { currentUser } = useAuth();
  const { reports = [], submitAdminCorrection, cancelAdminCorrection, applyOpnameToInventory, isSubmitting } = useStockOpname();

  // Always use the freshest report from controller state
  const activeReport = useMemo(() => {
    return reports.find(r => r.id === report?.id) || report;
  }, [reports, report]);

  // Active Report Data
  const reportDate = activeReport?.opnameDate || activeReport?.date;
  const displayDate = useMemo(() => formatDateIndonesian(reportDate), [reportDate]);
  const isApplied = Boolean(activeReport?.isApplied || activeReport?.status === 'APPLIED');
  const needsReapply = Boolean(activeReport?.needsReapply || (activeReport?.appliedAt && !activeReport?.isApplied));
  const isVoid = activeReport?.status === 'VOID';

  // Filter State: 'ALL' | 'MATCH' | 'DISCREPANCY' (Section 9)
  const [filterMode, setFilterMode] = useState('ALL');

  // Apply Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyNotes, setApplyNotes] = useState('');

  // Edit Modal State (Section 11 & 12)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editValues, setEditValues] = useState({}); // { [matId]: number | string }
  const [editReason, setEditReason] = useState('');

  // Cancel Confirm Modal State
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // History Modal State (Section 13)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Raw items with current values
  const items = useMemo(() => {
    return (activeReport?.items || []).map(item => {
      const sysStock = Number(item.systemStock ?? 0);
      const actStock = Number(item.actualStock ?? 0);
      const diff = Math.round((actStock - sysStock) * 1000) / 1000;
      const isMatch = diff === 0;

      return {
        ...item,
        systemStock: sysStock,
        actualStock: actStock,
        difference: diff,
        isMatch
      };
    });
  }, [report?.items]);

  // Counts for pills
  const stats = useMemo(() => {
    const total = items.length;
    const match = items.filter(i => i.isMatch).length;
    const discrepancy = total - match;
    return { total, match, discrepancy };
  }, [items]);

  // Filtered items (Section 9)
  const displayedItems = useMemo(() => {
    if (filterMode === 'MATCH') {
      return items.filter(i => i.isMatch);
    }
    if (filterMode === 'DISCREPANCY') {
      return items.filter(i => !i.isMatch);
    }
    return items;
  }, [items, filterMode]);

  // Open Edit Modal with current values
  const handleOpenEditModal = () => {
    const map = {};
    items.forEach(it => {
      const matId = it.rawMaterialId || it.id;
      map[matId] = it.actualStock;
    });
    setEditValues(map);
    setEditReason('');
    setIsEditModalOpen(true);
  };

  // Check which items have changed in edit mode
  const changedItems = useMemo(() => {
    return items.filter(it => {
      const matId = it.rawMaterialId || it.id;
      const currentVal = Number(it.actualStock);
      const newVal = editValues[matId] !== undefined ? Number(editValues[matId]) : currentVal;
      return newVal !== currentVal && !isNaN(newVal);
    });
  }, [items, editValues]);

  // Save changes (Section 11, 12, 14)
  const handleSaveCorrection = async () => {
    if (changedItems.length === 0) {
      toast.info('Tidak ada perubahan kuantitas fisik.');
      setIsEditModalOpen(false);
      return;
    }

    if (!editReason.trim()) {
      toast.error('Alasan perubahan stok wajib diisi!');
      return;
    }

    const res = await submitAdminCorrection(activeReport.id, editValues, editReason.trim());
    if (res?.success) {
      setIsEditModalOpen(false);
      toast.success('Perubahan stok fisik berhasil disimpan!');
    }
  };

  // Unduh Laporan PDF
  const handleDownloadPDF = () => {
    try {
      exportSingleOpnameReportToPDF({
        report: activeReport,
        storeName: 'XCrepes',
        isCashier: false
      });
      toast.success('Laporan Stock Opname berhasil diunduh (PDF)!');
    } catch (err) {
      console.error('Download PDF error:', err);
      toast.error('Gagal mengunduh file PDF: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  return (
    <div className="stock-opname-detail-page animate-fade-in" style={styles.container}>
      {/* Top Navigation */}
      <div style={styles.topNav}>
        <Button variant="secondary" icon={ArrowLeft} onClick={onBack} size="sm">
          Kembali ke Daftar Stock Opname
        </Button>
      </div>

      {/* Header Info Card (Section 7, 14) */}
      <div className="stock-opname-header-card" style={styles.headerCard}>
        <div style={styles.headerLeft}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={styles.title}>Stock Opname</h1>
            <span style={styles.dateBadge}>{displayDate}</span>
            {needsReapply ? (
              <span style={styles.statusBadgeWarning}>
                <AlertTriangle size={12} /> Perubahan Belum Diterapkan ke Sistem
              </span>
            ) : isApplied ? (
              <span style={styles.statusBadgeApplied}>
                <CheckCircle2 size={12} /> Diterapkan ke Stok (Terkunci Kasir)
              </span>
            ) : isVoid ? (
              <span style={styles.statusBadgeVoid}>
                <X size={12} /> Dibatalkan
              </span>
            ) : (
              <span style={styles.statusBadgePending}>
                <Clock size={12} /> Menunggu Penerapan
              </span>
            )}
          </div>

          {/* Creator & Last Modifier (Section 14) */}
          <div style={styles.creatorMeta}>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Dibuat oleh:</span>
              <strong style={{ color: 'var(--neutral-900)' }}>
                {activeReport.createdBy?.name || activeReport.submittedBy?.name || 'Kasir'}
              </strong>
              <span style={styles.roleSubtext}>
                — {activeReport.createdBy?.role === 'superadmin' ? 'Admin' : 'Kasir'}
              </span>
            </div>

            {activeReport.lastModifiedBy && activeReport.lastModifiedBy.name !== activeReport.createdBy?.name && (
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Terakhir diubah oleh:</span>
                <strong style={{ color: 'var(--blue-700)' }}>
                  {activeReport.lastModifiedBy.name}
                </strong>
                <span style={styles.roleSubtext}>
                  — {activeReport.lastModifiedBy.role === 'superadmin' ? 'Admin' : 'Kasir'}
                </span>
                {activeReport.lastModifiedAt && (
                  <span style={{ fontSize: '11.5px', color: 'var(--neutral-400)' }}>
                    ({new Date(activeReport.lastModifiedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                )}
              </div>
            )}

            {isApplied && (
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Diterapkan ke sistem:</span>
                <strong style={{ color: '#059669' }}>
                  {activeReport.appliedBy?.name || 'Super Admin'}
                </strong>
                {activeReport.appliedAt && (
                  <span style={{ fontSize: '11.5px', color: 'var(--neutral-400)' }}>
                    ({formatDateTimeIndonesian(activeReport.appliedAt)})
                  </span>
                )}
                {activeReport.appliedNotes && (
                  <span style={{ fontSize: '11.5px', color: 'var(--neutral-500)', fontStyle: 'italic', marginLeft: '4px' }}>
                    — "{activeReport.appliedNotes}"
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="admin-detail-header-actions" style={styles.headerActions}>
          {(activeReport.auditTrail || []).length > 1 && (
            <Button
              variant="secondary"
              icon={History}
              onClick={() => setIsHistoryModalOpen(true)}
              style={{ height: '42px' }}
            >
              Lihat Riwayat ({activeReport.auditTrail.length})
            </Button>
          )}

          <Button
            variant="outline"
            icon={FileText}
            onClick={handleDownloadPDF}
            className="opname-btn-pdf"
            style={{
              height: '42px',
              backgroundColor: '#FEF2F2',
              borderColor: '#FECACA',
              color: '#B91C1C',
              fontWeight: 600
            }}
          >
            Unduh PDF
          </Button>

          {!isVoid && (
            <Button
              variant="outline"
              icon={Edit3}
              onClick={handleOpenEditModal}
              style={{ height: '42px' }}
            >
              Edit Laporan
            </Button>
          )}

          {needsReapply && !isVoid && (
            <Button
              variant="outline"
              icon={RotateCcw}
              onClick={() => setIsCancelConfirmOpen(true)}
              disabled={isSubmitting}
              style={{ height: '42px', borderColor: '#fcd34d', color: '#92400e', backgroundColor: '#fffbeb' }}
            >
              Batalkan Perubahan
            </Button>
          )}

          {(!isApplied || needsReapply) && !isVoid && (
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={() => {
                setApplyNotes('');
                setIsApplyModalOpen(true);
              }}
              disabled={isSubmitting}
              style={{ height: '42px', backgroundColor: '#059669', borderColor: '#059669', color: '#fff' }}
            >
              {needsReapply ? 'Terapkan Ulang ke Stok Sistem' : 'Terapkan ke Stok Sistem'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Table Card (Section 7, 8, 9) */}
      <div className="stock-opname-table-card" style={styles.tableCard}>
        {/* Filter Pills Header (Section 9) */}
        <div style={styles.tableCardHeader}>
          <div className="stock-opname-pill-group" style={styles.pillGroup}>
            <button
              type="button"
              className="stock-opname-pill-btn"
              onClick={() => setFilterMode('ALL')}
              style={{
                ...styles.pillBtn,
                ...(filterMode === 'ALL' ? styles.pillBtnActive : {})
              }}
            >
              Semua ({stats.total})
            </button>
            <button
              type="button"
              className="stock-opname-pill-btn"
              onClick={() => setFilterMode('MATCH')}
              style={{
                ...styles.pillBtn,
                ...(filterMode === 'MATCH' ? styles.pillBtnActiveGreen : {})
              }}
            >
              Sesuai ({stats.match})
            </button>
            <button
              type="button"
              className="stock-opname-pill-btn"
              onClick={() => setFilterMode('DISCREPANCY')}
              style={{
                ...styles.pillBtn,
                ...(filterMode === 'DISCREPANCY' ? styles.pillBtnActiveRed : {})
              }}
            >
              Ada Selisih ({stats.discrepancy})
            </button>
          </div>

          <div style={styles.summarySubtext}>
            Menampilkan <strong>{displayedItems.length}</strong> dari {stats.total} bahan
          </div>
        </div>

        {/* Desktop Comparison Table (Section 7) */}
        <div className="admin-detail-desktop-table" style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}>#</th>
                <th style={styles.th}>Bahan</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Stok Sistem</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Stok Aktual</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Selisih</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.emptyTd}>
                    Tidak ada bahan baku yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                displayedItems.map((item, index) => {
                  const isMatch = item.isMatch;
                  const diff = item.difference;

                  return (
                    <tr 
                      key={item.rawMaterialId || index} 
                      style={{
                        ...styles.tableRow,
                        backgroundColor: !isMatch ? '#fffafa' : undefined
                      }}
                    >
                      {/* # */}
                      <td style={{ ...styles.td, textAlign: 'center', color: 'var(--neutral-400)', fontWeight: 600 }}>
                        {index + 1}
                      </td>

                      {/* Bahan */}
                      <td style={styles.td}>
                        <div style={{ fontWeight: 700, color: 'var(--neutral-900)', fontSize: '13.5px' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--neutral-400)' }}>
                          {item.categoryName || 'Bahan Baku'}
                        </div>
                      </td>

                      {/* Stok Sistem */}
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600, color: 'var(--neutral-700)' }}>
                        {item.systemStock} {item.unitName}
                      </td>

                      {/* Stok Aktual */}
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: 'var(--neutral-900)', fontSize: '14px' }}>
                        {item.actualStock} {item.unitName}
                      </td>

                      {/* Selisih */}
                      <td style={{ 
                        ...styles.td, 
                        textAlign: 'right', 
                        fontWeight: 700, 
                        fontSize: '13.5px',
                        color: isMatch ? '#059669' : diff < 0 ? '#dc2626' : '#2563eb' 
                      }}>
                        {isMatch ? '0 ' + item.unitName : `${diff > 0 ? '+' : ''}${diff} ${item.unitName}`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (Same as Kasir Stock Opname Mobile Cards) */}
        <div className="admin-detail-mobile-cards">
          {displayedItems.length === 0 ? (
            <div style={styles.mobileEmptyCard}>
              <p style={{ margin: 0, color: 'var(--neutral-500)', fontSize: '13px' }}>
                Tidak ada bahan baku yang cocok dengan filter yang dipilih.
              </p>
            </div>
          ) : (
            displayedItems.map((item, index) => {
              const isMatch = item.isMatch;
              const diff = item.difference;
              const borderLeftColor = isMatch ? '#10b981' : diff < 0 ? '#ef4444' : '#3b82f6';
              const hasValidCategory = item.categoryName && item.categoryName.trim() !== '-' && item.categoryName.trim() !== '';

              return (
                <div
                  key={item.rawMaterialId || index}
                  className="admin-detail-item-card"
                  style={{
                    ...styles.mobileItemCard,
                    borderLeft: `4px solid ${borderLeftColor}`
                  }}
                >
                  {/* Top Header: #No tag, Material Name, and Category Badge */}
                  <div style={styles.mobileItemHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                      <span style={styles.rowNumberTag}>
                        #{index + 1}
                      </span>
                      <span style={styles.mobileItemName}>
                        {item.name}
                      </span>
                    </div>
                    {hasValidCategory && (
                      <span style={styles.categoryBadge}>
                        {item.categoryName}
                      </span>
                    )}
                  </div>

                  {/* 3-Column Metrics Grid */}
                  <div style={styles.mobileItemMetricsGrid}>
                    <div style={styles.mobileMetricCol}>
                      <span style={styles.mobileMetricLabel}>Stok Sistem</span>
                      <span style={styles.mobileMetricValSystem}>
                        {item.systemStock} {item.unitName}
                      </span>
                    </div>
                    <div style={styles.mobileMetricCol}>
                      <span style={styles.mobileMetricLabel}>Stok Aktual</span>
                      <span style={styles.mobileMetricValActual}>
                        {item.actualStock} {item.unitName}
                      </span>
                    </div>
                    <div style={styles.mobileMetricCol}>
                      <span style={styles.mobileMetricLabel}>Selisih</span>
                      <span style={{
                        ...styles.mobileMetricValDiff,
                        color: isMatch ? '#059669' : diff < 0 ? '#dc2626' : '#2563eb'
                      }}>
                        {isMatch ? '0 ' + item.unitName : `${diff > 0 ? '+' : ''}${diff} ${item.unitName}`}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Status Pill */}
                  <div style={styles.mobileItemStatusRow}>
                    {isMatch ? (
                      <span style={styles.statusPillMatch}>
                        <CheckCircle2 size={12} /> Stok Cocok (Sesuai)
                      </span>
                    ) : diff < 0 ? (
                      <span style={styles.statusPillDeficit}>
                        <AlertTriangle size={12} /> Selisih Kurang ({diff} {item.unitName})
                      </span>
                    ) : (
                      <span style={styles.statusPillSurplus}>
                        <AlertTriangle size={12} /> Selisih Lebih (+{diff} {item.unitName})
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* EDIT MODAL (Section 11 & 12) */}
      {isEditModalOpen && (
        <div 
          className="admin-opname-modal-overlay" 
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div className="admin-opname-modal-card" style={styles.modalCard}>
            <div className="bottom-sheet-handle-wrapper" aria-hidden="true">
              <div className="bottom-sheet-handle-bar" />
            </div>
            <div className="admin-opname-modal-header" style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Edit Laporan Stock Opname</h3>
                <p style={styles.modalSubtitle}>Koreksi stok aktual jika ditemukan kesalahan hitung fisik.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-opname-modal-body" style={styles.modalBody}>
              {/* Diff Preview if there are changes (Section 12) */}
              {changedItems.length > 0 && (
                <div style={styles.diffAlertBox}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>
                    Perubahan yang akan disimpan ({changedItems.length} bahan):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {changedItems.map(ch => {
                      const matId = ch.rawMaterialId || ch.id;
                      const newVal = editValues[matId];
                      return (
                        <div key={matId} style={styles.diffLine}>
                          <span><strong>{ch.name}</strong></span>
                          <span>Sebelumnya: <strong>{ch.actualStock} {ch.unitName}</strong> → Menjadi: <strong style={{ color: '#1e40af' }}>{newVal} {ch.unitName}</strong></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items Edit List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {items.map(item => {
                  const matId = item.rawMaterialId || item.id;
                  const currentVal = editValues[matId] ?? item.actualStock;
                  const isItemChanged = Number(currentVal) !== Number(item.actualStock);

                  return (
                    <div 
                      key={matId} 
                      style={{
                        ...styles.editItemRow,
                        borderColor: isItemChanged ? 'var(--blue-400)' : 'var(--border-color)',
                        backgroundColor: isItemChanged ? '#eff6ff' : '#FFFFFF'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--neutral-900)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--neutral-500)' }}>
                          Stok Sistem: <strong>{item.systemStock}</strong> {item.unitName}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--neutral-500)', fontWeight: 600 }}>Aktual:</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={currentVal}
                          onChange={(e) => setEditValues(prev => ({ ...prev, [matId]: e.target.value }))}
                          style={styles.editInput}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--neutral-600)', minWidth: '32px' }}>
                          {item.unitName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reason input (Mandatory for audit) */}
              <div style={styles.reasonWrap}>
                <label style={styles.reasonLabel}>
                  Alasan Perubahan <span style={{ color: '#dc2626' }}>*</span>:
                </label>
                <input
                  type="text"
                  placeholder="Misal: Salah hitung fisik di gudang, koreksi kemasan..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  style={styles.reasonInput}
                />
              </div>
            </div>

            <div className="admin-opname-modal-footer" style={styles.modalFooter}>
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveCorrection}
                disabled={isSubmitting || changedItems.length === 0}
                style={{ backgroundColor: 'var(--blue-600)' }}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RIWAYAT PERUBAHAN MODAL (Section 13) */}
      {isHistoryModalOpen && (
        <div 
          className="admin-opname-modal-overlay" 
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsHistoryModalOpen(false);
          }}
        >
          <div className="admin-opname-modal-card" style={styles.modalCardSmall}>
            <div className="bottom-sheet-handle-wrapper" aria-hidden="true">
              <div className="bottom-sheet-handle-bar" />
            </div>
            <div className="admin-opname-modal-header" style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--blue-600, #005BC6)" />
                <h3 style={styles.modalTitle}>Riwayat Perubahan Laporan</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-opname-modal-body" style={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(activeReport.auditTrail || []).map((log, idx) => {
                  return (
                    <div key={log.id || idx} style={styles.historyEntry}>
                      <div style={styles.historyTop}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--neutral-900)' }}>
                          {log.user} — <span style={{ color: 'var(--neutral-500)', fontWeight: 500 }}>{log.role === 'superadmin' ? 'Admin' : 'Kasir'}</span>
                        </div>
                        <span style={styles.historyTime}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </div>
                      <div style={styles.historyAction}>
                        {log.action === 'SUBMIT' ? 'Laporan awal dibuat dan dikirim' : `Koreksi data: ${log.field || ''}`}
                      </div>
                      {log.reason && (
                        <div style={styles.historyReason}>
                          Alasan: "{log.reason}"
                        </div>
                      )}
                      {log.oldValue && log.newValue && (
                        <div style={styles.historyDiff}>
                          {log.oldValue} → <strong>{log.newValue}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="admin-opname-modal-footer" style={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setIsHistoryModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TERAPKAN STOK KE SISTEM */}
      {isApplyModalOpen && (
        <div 
          className="admin-opname-modal-overlay" 
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsApplyModalOpen(false);
          }}
        >
          <div className="admin-opname-modal-card" style={styles.modalCard}>
            <div className="bottom-sheet-handle-wrapper" aria-hidden="true">
              <div className="bottom-sheet-handle-bar" />
            </div>
            <div className="admin-opname-modal-header" style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#059669" />
                <div>
                  <h3 style={styles.modalTitle}>
                    {needsReapply ? 'Terapkan Ulang Stok Aktual ke Sistem' : 'Terapkan Stok Aktual ke Sistem'}
                  </h3>
                  <p style={styles.modalSubtitle}>
                    {needsReapply
                      ? `Sinkronkan koreksi hasil edit admin ke master stok bahan baku tanggal ${displayDate}`
                      : `Perbarui saldo stok bahan baku master data sesuai hasil fisik tanggal ${displayDate}`
                    }
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-opname-modal-body" style={styles.modalBody}>
              {/* Summary Stats Cards */}
              <div style={styles.applyStatsGrid}>
                <div style={styles.applyStatBox}>
                  <span style={styles.applyStatLabel}>Total Bahan Baku</span>
                  <strong style={styles.applyStatVal}>{stats.total}</strong>
                </div>
                <div style={{ ...styles.applyStatBox, borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' }}>
                  <span style={{ ...styles.applyStatLabel, color: '#065f46' }}>Stok Cocok</span>
                  <strong style={{ ...styles.applyStatVal, color: '#059669' }}>{stats.match}</strong>
                </div>
                <div style={{ ...styles.applyStatBox, borderColor: stats.discrepancy > 0 ? '#fecaca' : '#e5e7eb', backgroundColor: stats.discrepancy > 0 ? '#fff1f2' : '#f9fafb' }}>
                  <span style={{ ...styles.applyStatLabel, color: stats.discrepancy > 0 ? '#991b1b' : '#6b7280' }}>Ada Selisih</span>
                  <strong style={{ ...styles.applyStatVal, color: stats.discrepancy > 0 ? '#dc2626' : '#374151' }}>{stats.discrepancy}</strong>
                </div>
              </div>

              {/* Warning Callout Box */}
              <div style={styles.applyWarningBox}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertTriangle size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '12.5px', color: '#78350f', lineHeight: 1.5 }}>
                    <strong>PENTING:</strong>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                      <li>Saldo stok bahan baku di sistem akan langsung <strong>diperbarui mengikuti stok fisik aktual</strong>.</li>
                      <li>Selisih stok akan otomatis dicatat sebagai <strong>Log Mutasi Stok (ADJUST)</strong>.</li>
                      <li>Laporan stock opname hari ini akan <strong>DIKUNCI SECARA PERMANEN</strong>, sehingga kasir tidak dapat lagi mengubah data laporan ini.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Preview Differences if any */}
              {stats.discrepancy > 0 && (
                <div style={{ marginTop: '14px', marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--neutral-700)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                    Daftar Penyesuaian Selisih ({stats.discrepancy} Bahan):
                  </label>
                  <div style={styles.discrepancyListWrap}>
                    {items.filter(i => !i.isMatch).map(item => {
                      const isNegative = item.difference < 0;
                      return (
                        <div key={item.rawMaterialId || item.id} style={styles.discrepancyRow}>
                          <div>
                            <strong style={{ fontSize: '13px', color: 'var(--neutral-900)' }}>{item.name}</strong>
                            <div style={{ fontSize: '11.5px', color: 'var(--neutral-500)' }}>
                              Stok Sistem: {item.systemStock} {item.unitName} → Aktual: <strong>{item.actualStock} {item.unitName}</strong>
                            </div>
                          </div>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: isNegative ? '#fee2e2' : '#dcfce7',
                            color: isNegative ? '#dc2626' : '#16a34a'
                          }}>
                            {item.difference > 0 ? `+${item.difference}` : item.difference} {item.unitName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Notes */}
              <div style={{ marginTop: '12px' }}>
                <label style={styles.reasonLabel}>
                  Catatan Penerapan (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Misal: Penyesuaian stok opname shift sore telah diverifikasi..."
                  value={applyNotes}
                  onChange={(e) => setApplyNotes(e.target.value)}
                  style={styles.reasonInput}
                />
              </div>
            </div>

            <div className="admin-opname-modal-footer" style={styles.modalFooter}>
              <Button
                variant="secondary"
                onClick={() => setIsApplyModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  const res = await applyOpnameToInventory(activeReport.id, { notes: applyNotes });
                  if (res?.success) {
                    setIsApplyModalOpen(false);
                  }
                }}
                disabled={isSubmitting}
                style={{ backgroundColor: '#059669', borderColor: '#059669', color: '#fff' }}
              >
                {isSubmitting ? 'Menerapkan...' : needsReapply ? 'Ya, Terapkan Ulang ke Sistem' : 'Ya, Terapkan & Kunci Laporan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI BATALKAN PERUBAHAN */}
      {isCancelConfirmOpen && (
        <div 
          className="admin-opname-modal-overlay" 
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCancelConfirmOpen(false);
          }}
        >
          <div className="admin-opname-modal-card" style={styles.modalCardSmall}>
            <div className="bottom-sheet-handle-wrapper" aria-hidden="true">
              <div className="bottom-sheet-handle-bar" />
            </div>
            <div className="admin-opname-modal-header" style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={18} color="#d97706" />
                <h3 style={styles.modalTitle}>Batalkan Perubahan Laporan?</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-opname-modal-body" style={styles.modalBody}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--neutral-600)', lineHeight: 1.5, textAlign: 'left' }}>
                Nilai stok fisik yang baru saja Anda edit akan dibatalkan dan dikembalikan ke data versi sebelumnya.
              </p>
            </div>

            <div className="admin-opname-modal-footer" style={styles.modalFooter}>
              <Button
                variant="secondary"
                onClick={() => setIsCancelConfirmOpen(false)}
                disabled={isSubmitting}
              >
                Kembali
              </Button>
              <Button
                variant="danger"
                icon={RotateCcw}
                onClick={async () => {
                  const res = await cancelAdminCorrection(activeReport.id);
                  if (res?.success) {
                    setIsCancelConfirmOpen(false);
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Membatalkan...' : 'Ya, Batalkan Perubahan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Mobile Responsive Styles (16px spacing rules) */}
      <style>{`
        @keyframes opnameBottomSheetSlideUp {
          from {
            transform: translateY(100%);
            opacity: 0.6;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .bottom-sheet-handle-wrapper {
          display: none;
        }

        .admin-detail-desktop-table {
          display: block;
          width: 100%;
          overflow-x: auto;
        }
        .admin-detail-mobile-cards {
          display: none;
        }
        .admin-detail-header-actions button,
        .admin-detail-header-actions > button {
          height: 42px !important;
          box-sizing: border-box !important;
        }
        .opname-btn-pdf {
          height: 42px !important;
          background-color: #FEF2F2 !important;
          border-color: #FECACA !important;
          color: #B91C1C !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
          box-sizing: border-box !important;
        }
        .opname-btn-pdf:hover {
          background-color: #FEE2E2 !important;
          border-color: #FCA5A5 !important;
          color: #991B1B !important;
        }

        @media (max-width: 768px) {
          .bottom-sheet-handle-wrapper {
            display: flex !important;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 12px 0 4px 0;
            background-color: #FFFFFF;
            border-radius: 20px 20px 0 0;
            user-select: none;
            touch-action: none;
          }

          .bottom-sheet-handle-bar {
            display: block !important;
            width: 44px;
            height: 5px;
            background-color: var(--neutral-300, #cbd5e1);
            border-radius: 9999px;
          }

          .admin-opname-modal-overlay {
            padding: 0 !important;
            align-items: flex-end !important;
            justify-content: center !important;
            background-color: rgba(8, 33, 66, 0.55) !important;
          }

          .admin-opname-modal-card {
            max-width: 100% !important;
            width: 100% !important;
            border-radius: 20px 20px 0 0 !important;
            max-height: 85vh !important;
            margin: 0 !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: none !important;
            border-top: 1px solid var(--border-subtle, #e2e8f0) !important;
            animation: opnameBottomSheetSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
            box-shadow: 0 -10px 36px rgba(0, 0, 0, 0.25) !important;
          }

          .admin-opname-modal-header {
            padding: 8px 16px 12px 16px !important;
            flex-shrink: 0 !important;
          }

          .admin-opname-modal-body {
            padding: 14px 16px !important;
            flex: 1 1 auto !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            max-height: calc(85vh - 145px) !important;
          }

          .admin-opname-modal-footer {
            padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)) 16px !important;
            flex-shrink: 0 !important;
            background-color: #FFFFFF !important;
            border-top: 1px solid var(--border-color, #e2e8f0) !important;
            display: flex !important;
            gap: 10px !important;
          }

          .admin-opname-modal-footer > button {
            flex: 1 !important;
            height: 42px !important;
          }
          .admin-detail-desktop-table {
            display: none !important;
          }
          .admin-detail-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 0 !important;
          }
          .stock-opname-detail-page {
            padding: 0 0 100px 0 !important;
            margin: 0 !important;
            gap: 16px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .stock-opname-header-card,
          .stock-opname-table-card {
            margin-bottom: 16px !important;
            padding: 16px !important;
            border-radius: 12px !important;
          }
          .admin-detail-header-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .admin-detail-header-actions > button {
            width: 100% !important;
            justify-content: center !important;
          }
          .stock-opname-pill-group {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .stock-opname-pill-btn {
            padding: 8px 6px !important;
            font-size: 11.5px !important;
            text-align: center !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  topNav: {
    display: 'flex',
    alignItems: 'center'
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  title: {
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    margin: 0
  },
  dateBadge: {
    fontSize: '13px',
    fontWeight: 700,
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-800)',
    padding: '3px 10px',
    borderRadius: '6px'
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#065f46',
    backgroundColor: '#d1fae5',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  statusBadgeApplied: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#065f46',
    backgroundColor: '#d1fae5',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid #a7f3d0'
  },
  statusBadgeWarning: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#b45309',
    backgroundColor: '#fffbeb',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid #fde68a'
  },
  statusBadgePending: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid #fde68a'
  },
  statusBadgeVoid: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    padding: '4px 10px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid #fecaca'
  },
  applyStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '14px'
  },
  applyStatBox: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--neutral-50)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  applyStatLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--neutral-500)',
    textTransform: 'uppercase'
  },
  applyStatVal: {
    fontSize: '18px',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  applyWarningBox: {
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    marginBottom: '14px'
  },
  discrepancyListWrap: {
    maxHeight: '180px',
    overflowY: 'auto',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: '#f8fafc'
  },
  discrepancyRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #e2e8f0'
  },
  creatorMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '4px'
  },
  metaRow: {
    fontSize: '13px',
    color: 'var(--neutral-700)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap'
  },
  metaLabel: {
    color: 'var(--neutral-500)',
    fontSize: '12.5px'
  },
  roleSubtext: {
    color: 'var(--neutral-500)',
    fontSize: '12px'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  // Table Card
  tableCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden'
  },
  tableCardHeader: {
    padding: '14px 18px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  pillGroup: {
    display: 'flex',
    backgroundColor: 'var(--neutral-200)',
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
    color: 'var(--neutral-700)',
    cursor: 'pointer'
  },
  pillBtnActive: {
    backgroundColor: '#FFFFFF',
    color: 'var(--neutral-900)',
    boxShadow: 'var(--shadow-xs)'
  },
  pillBtnActiveGreen: {
    backgroundColor: '#FFFFFF',
    color: '#065f46',
    boxShadow: 'var(--shadow-xs)'
  },
  pillBtnActiveRed: {
    backgroundColor: '#FFFFFF',
    color: '#991b1b',
    boxShadow: 'var(--shadow-xs)'
  },
  summarySubtext: {
    fontSize: '12px',
    color: 'var(--neutral-500)'
  },

  // Table
  tableResponsive: {
    width: '100%',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeaderRow: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid var(--border-color)'
  },
  th: {
    padding: '12px 18px',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--neutral-600)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.15s ease'
  },
  td: {
    padding: '14px 18px',
    fontSize: '13px',
    verticalAlign: 'middle'
  },
  emptyTd: {
    padding: '30px',
    textAlign: 'center',
    color: 'var(--neutral-500)',
    fontSize: '13px'
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
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden'
  },
  modalCardSmall: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    maxWidth: '480px',
    width: '100%',
    maxHeight: '80vh',
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
  modalFooter: {
    padding: '14px 20px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },

  // Diff Box
  diffAlertBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '14px'
  },
  diffLine: {
    fontSize: '12px',
    color: '#1e3a8a',
    display: 'flex',
    justifyContent: 'space-between'
  },
  editItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px'
  },
  editInput: {
    width: '75px',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    fontSize: '14px',
    fontWeight: 700,
    textAlign: 'center',
    outline: 'none',
    backgroundColor: '#FFFFFF'
  },
  reasonWrap: {
    marginTop: '12px'
  },
  reasonLabel: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: 'var(--neutral-700)',
    display: 'block',
    marginBottom: '4px'
  },
  reasonInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '13px',
    outline: 'none'
  },

  // History Log Entry
  historyEntry: {
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  historyTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  historyTime: {
    fontSize: '11px',
    color: 'var(--neutral-400)'
  },
  historyAction: {
    fontSize: '12.5px',
    color: 'var(--neutral-700)'
  },
  historyReason: {
    fontSize: '11.5px',
    color: 'var(--neutral-500)',
    fontStyle: 'italic'
  },
  historyDiff: {
    fontSize: '11.5px',
    color: 'var(--blue-700)',
    marginTop: '2px'
  },

  // Mobile Card Styles (Matching Kasir stock opname)
  rowNumberTag: {
    fontSize: '11px',
    fontWeight: 800,
    color: 'var(--neutral-600)',
    backgroundColor: 'var(--neutral-100)',
    padding: '2px 7px',
    borderRadius: '6px',
    flexShrink: 0
  },
  categoryBadge: {
    fontSize: '10.5px',
    fontWeight: 600,
    color: 'var(--neutral-500)',
    backgroundColor: 'var(--neutral-100)',
    padding: '2px 8px',
    borderRadius: '4px',
    flexShrink: 0
  },
  mobileItemCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxSizing: 'border-box'
  },
  mobileItemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px'
  },
  mobileItemName: {
    fontSize: '0.938rem',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    wordBreak: 'break-word',
    lineHeight: 1.25
  },
  mobileItemMetricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    backgroundColor: 'var(--neutral-50)',
    borderRadius: '8px',
    padding: '10px 12px',
    border: '1px solid var(--border-subtle, #f1f5f9)'
  },
  mobileMetricCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0
  },
  mobileMetricLabel: {
    fontSize: '10.5px',
    fontWeight: 600,
    color: 'var(--neutral-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  mobileMetricValSystem: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: 'var(--neutral-700)'
  },
  mobileMetricValActual: {
    fontSize: '13.5px',
    fontWeight: 800,
    color: 'var(--neutral-900)'
  },
  mobileMetricValDiff: {
    fontSize: '13px',
    fontWeight: 800
  },
  mobileItemStatusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  statusPillMatch: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#065f46',
    backgroundColor: '#d1fae5',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid #a7f3d0'
  },
  statusPillDeficit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#991b1b',
    backgroundColor: '#fee2e2',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid #fecaca'
  },
  statusPillSurplus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#1e40af',
    backgroundColor: '#dbeafe',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid #bfdbfe'
  },
  mobileEmptyCard: {
    padding: '32px 16px',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid var(--border-color)'
  }
};
