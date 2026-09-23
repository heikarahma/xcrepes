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
  RotateCcw
} from 'lucide-react';
import { formatDateIndonesian, formatDateTimeIndonesian } from '../../../utils/dateUtils';
import { toast } from '../../components/Toast';

export const AdminOpnameDetailView = ({ report, onBack }) => {
  const { currentUser } = useAuth();
  const { reports = [], submitAdminCorrection, isSubmitting } = useStockOpname();

  // Always use the freshest report from controller state
  const activeReport = useMemo(() => {
    return reports.find(r => r.id === report?.id) || report;
  }, [reports, report]);

  // Active Report Data
  const reportDate = activeReport?.opnameDate || activeReport?.date;
  const displayDate = useMemo(() => formatDateIndonesian(reportDate), [reportDate]);

  // Filter State: 'ALL' | 'MATCH' | 'DISCREPANCY' (Section 9)
  const [filterMode, setFilterMode] = useState('ALL');

  // Edit Modal State (Section 11 & 12)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editValues, setEditValues] = useState({}); // { [matId]: number | string }
  const [editReason, setEditReason] = useState('');

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
            <span style={styles.statusBadge}>
              <CheckCircle2 size={12} /> Selesai
            </span>
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
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.headerActions}>
          {(activeReport.auditTrail || []).length > 1 && (
            <Button
              variant="secondary"
              icon={History}
              onClick={() => setIsHistoryModalOpen(true)}
              size="sm"
            >
              Lihat Riwayat ({activeReport.auditTrail.length})
            </Button>
          )}

          <Button
            variant="primary"
            icon={Edit3}
            onClick={handleOpenEditModal}
            size="sm"
          >
            Edit Laporan
          </Button>
        </div>
      </div>

      {/* Main Table Card (Section 7, 8, 9) */}
      <div className="stock-opname-table-card" style={styles.tableCard}>
        {/* Filter Pills Header (Section 9) */}
        <div style={styles.tableCardHeader}>
          <div style={styles.pillGroup}>
            <button
              type="button"
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

        {/* Comparison Table (Section 7) */}
        <div style={styles.tableResponsive}>
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
      </div>

      {/* EDIT MODAL (Section 11 & 12) */}
      {isEditModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
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

            <div style={styles.modalBody}>
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

            <div style={styles.modalFooter}>
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
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardSmall}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--primary-600)" />
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

            <div style={styles.modalBody}>
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

            <div style={styles.modalFooter}>
              <Button variant="secondary" onClick={() => setIsHistoryModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Mobile Responsive Styles (16px spacing rules) */}
      <style>{`
        @media (max-width: 768px) {
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
            border-radius: 10px !important;
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
  }
};
