import React, { useMemo } from 'react';
import { useStockOpname } from '../../../controllers/StockOpnameController';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  Plus, 
  Eye, 
  Calendar, 
  User, 
  AlertTriangle,
  ArrowRight,
  Clock,
  Lock,
  Ban
} from 'lucide-react';
import { formatDateIndonesian, formatDateTimeIndonesian, getLocalDateStr } from '../../../utils/dateUtils';

export const AdminOpnameMainView = ({ 
  onOpenReport, 
  onCreateTodayOpname 
}) => {
  const { reports = [], todayReport, isLoading } = useStockOpname();

  const todayStr = useMemo(() => getLocalDateStr(), []);
  const todayDisplay = useMemo(() => formatDateIndonesian(todayStr), [todayStr]);

  // Past reports (excluding today, sorted by date descending)
  const historyReports = useMemo(() => {
    return (reports || [])
      .filter(r => (r.opnameDate || r.date) !== todayStr && r.status !== 'VOID')
      .sort((a, b) => (b.opnameDate || b.date || '').localeCompare(a.opnameDate || a.date || ''));
  }, [reports, todayStr]);

  return (
    <div className="stock-opname-admin-page animate-fade-in" style={styles.container}>
      {/* Header */}
      <div className="stock-opname-header" style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={styles.title}>Stock Opname</h1>
            <Badge variant="primary" withDot>Audit Stok Fisik</Badge>
          </div>
          <p style={styles.subtitle}>
            Pantau dan rekonsiliasi stok fisik harian toko vs data saldo sistem
          </p>
        </div>
      </div>

      {/* 1. HARI INI CARD (Section 6, 15, 16, 17) */}
      <div className="stock-opname-today-card" style={styles.todayCard}>
        <div className="today-card-header" style={styles.todayCardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <Calendar size={18} color="var(--blue-600, #005BC6)" style={{ flexShrink: 0 }} />
            <h2 className="today-card-title" style={styles.todayCardTitle}>Hari ini — {todayDisplay}</h2>
          </div>
          {todayReport && (
            todayReport.status === 'VOID' ? (
              <span style={styles.statusVoidBadge}>
                <Ban size={12} /> Dibatalkan
              </span>
            ) : todayReport.needsReapply ? (
              <span style={styles.statusReapplyBadge}>
                <AlertTriangle size={12} /> Perlu Diterapkan Ulang
              </span>
            ) : (todayReport.isApplied || todayReport.status === 'APPLIED') ? (
              <span style={styles.statusAppliedBadge}>
                <CheckCircle2 size={12} /> Diterapkan ke Stok (Terkunci)
              </span>
            ) : (
              <span style={styles.statusPendingBadge}>
                <Clock size={12} /> Menunggu Penerapan
              </span>
            )
          )}
        </div>

        <div className="today-card-body" style={styles.todayCardBody}>
          {todayReport ? (
            /* Laporan Sudah Dibuat (Section 16) */
            <div className="today-report-content" style={styles.todayReportContent}>
              <div className="today-info-box" style={styles.todayInfoBox}>
                <div className="info-meta-row" style={styles.infoMetaRow}>
                  <span className="info-label" style={styles.infoLabel}>Status:</span>
                  <div className="info-value" style={styles.infoValue}>
                    {todayReport.status === 'VOID' ? (
                      <strong style={{ color: '#dc2626' }}>Dibatalkan (VOID)</strong>
                    ) : todayReport.needsReapply ? (
                      <strong style={{ color: '#d97706' }}>Perlu Diterapkan Ulang</strong>
                    ) : (todayReport.isApplied || todayReport.status === 'APPLIED') ? (
                      <strong style={{ color: '#059669' }}>Diterapkan ke Stok (Terkunci)</strong>
                    ) : (
                      <strong style={{ color: '#d97706' }}>Menunggu Penerapan</strong>
                    )}
                  </div>
                </div>

                <div className="info-meta-row" style={styles.infoMetaRow}>
                  <span className="info-label" style={styles.infoLabel}>Dibuat oleh:</span>
                  <div className="info-value" style={styles.infoValue}>
                    <strong>{todayReport.createdBy?.name || 'Kasir'}</strong> 
                    <span style={{ color: 'var(--neutral-400)', marginLeft: '4px' }}>
                      ({todayReport.createdBy?.role === 'superadmin' ? 'Admin' : 'Kasir'})
                    </span>
                  </div>
                </div>

                {todayReport.lastModifiedBy && todayReport.lastModifiedBy.name !== todayReport.createdBy?.name && (
                  <div className="info-meta-row" style={styles.infoMetaRow}>
                    <span className="info-label" style={styles.infoLabel}>Terakhir diedit:</span>
                    <div className="info-value" style={styles.infoValue}>
                      {todayReport.lastModifiedBy.name} ({todayReport.lastModifiedBy.role === 'superadmin' ? 'Admin' : 'Kasir'})
                    </div>
                  </div>
                )}

                {(todayReport.isApplied || todayReport.status === 'APPLIED') && todayReport.appliedBy && (
                  <div className="info-meta-row" style={styles.infoMetaRow}>
                    <span className="info-label" style={styles.infoLabel}>Diterapkan:</span>
                    <div className="info-value" style={styles.infoValue}>
                      <span style={{ color: '#059669', fontWeight: 700 }}>
                        {todayReport.appliedBy.name || 'Super Admin'}
                      </span>
                      {todayReport.appliedAt && (
                        <span style={{ color: 'var(--neutral-500)', fontSize: '11px', display: 'block', marginTop: '1px' }}>
                          {formatDateTimeIndonesian(todayReport.appliedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="info-meta-row" style={styles.infoMetaRow}>
                  <span className="info-label" style={styles.infoLabel}>Pemeriksaan:</span>
                  <div className="info-value" style={styles.infoValue}>
                    <strong>{todayReport.summary?.totalMaterials || todayReport.items?.length || 0}</strong> bahan baku
                  </div>
                </div>
              </div>

              <div className="today-action-right" style={styles.todayActionRight}>
                <Button
                  variant="primary"
                  icon={Eye}
                  onClick={() => onOpenReport(todayReport)}
                  size="md"
                >
                  Lihat Laporan
                </Button>
              </div>
            </div>
          ) : (
            /* Belum Ada Laporan (Section 17) */
            <div className="today-empty-content" style={styles.todayEmptyContent}>
              <div>
                <p style={styles.emptyStatusText}>Belum ada laporan stock opname untuk hari ini.</p>
                <p style={styles.emptySubtext}>Kasir atau Admin dapat mencatat stok fisik sebelum toko closing.</p>
              </div>
              <div>
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={onCreateTodayOpname}
                  size="md"
                >
                  Stock Opname
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. RIWAYAT STOCK OPNAME (Section 6) */}
      <div className="stock-opname-history-card" style={styles.historyCard}>
        <div className="history-card-header" style={styles.historyCardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <ClipboardCheck size={18} color="var(--neutral-600)" style={{ flexShrink: 0 }} />
            <h3 className="history-card-title" style={styles.historyTitle}>Riwayat Stock Opname</h3>
          </div>
          <span className="history-counter-pill" style={styles.historyCounter}>
            {historyReports.length} Laporan
          </span>
        </div>

        {historyReports.length === 0 ? (
          <div style={styles.historyEmpty}>
            <div style={styles.emptyIconCircle}>
              <ClipboardCheck size={22} color="var(--neutral-400)" />
            </div>
            <p style={styles.emptyTitle}>Belum Ada Riwayat Laporan</p>
            <p style={styles.emptySubtitle}>
              Laporan stock opname hari-hari sebelumnya akan tersimpan di sini.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-history-desktop-table" style={styles.tableResponsive}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Tanggal</th>
                    <th style={styles.th}>Dibuat Oleh</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'center', width: '100px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {historyReports.map((report) => {
                    return (
                      <tr key={report.id} style={styles.tableRow}>
                        {/* Tanggal */}
                        <td style={styles.td}>
                          <div style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>
                            {report.displayDate || formatDateIndonesian(report.opnameDate || report.date)}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--neutral-400)', fontFamily: 'monospace' }}>
                            {report.id}
                          </div>
                        </td>

                        {/* Dibuat Oleh */}
                        <td style={styles.td}>
                          <div style={{ fontWeight: 600, color: 'var(--neutral-800)', fontSize: '13px' }}>
                            {report.createdBy?.name || report.submittedBy?.name || 'Kasir'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--neutral-500)' }}>
                            {report.createdBy?.role === 'superadmin' ? 'Admin' : 'Kasir'}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={styles.td}>
                          {report.status === 'VOID' ? (
                            <span style={styles.statusVoidBadge}>
                              <Ban size={11} /> Dibatalkan
                            </span>
                          ) : report.needsReapply ? (
                            <span style={styles.statusReapplyBadge}>
                              <AlertTriangle size={11} /> Perlu Diterapkan Ulang
                            </span>
                          ) : (report.isApplied || report.status === 'APPLIED') ? (
                            <span style={styles.statusAppliedBadge}>
                              <CheckCircle2 size={11} /> Diterapkan
                            </span>
                          ) : (
                            <span style={styles.statusPendingBadge}>
                              <Clock size={11} /> Belum Diterapkan
                            </span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <Button
                            variant="secondary"
                            icon={Eye}
                            onClick={() => onOpenReport(report)}
                            size="sm"
                          >
                            Lihat
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Same as Kasir Stock Opname Mobile Cards) */}
            <div className="admin-history-mobile-cards">
              {historyReports.map((report) => {
                const isVoid = report.status === 'VOID';
                const isApplied = Boolean(report.isApplied || report.status === 'APPLIED');
                const needsReapply = Boolean(report.needsReapply);
                const discrepancyCount = (report.summary?.deficitCount || 0) + (report.summary?.surplusCount || 0);
                const borderLeftColor = isVoid ? '#ef4444' : needsReapply ? '#d97706' : isApplied ? '#059669' : discrepancyCount > 0 ? '#f59e0b' : 'var(--blue-600)';
                const totalMaterials = report.summary?.totalMaterials || report.items?.length || 0;
                const creatorName = report.createdBy?.name || report.submittedBy?.name || 'Kasir';
                const creatorRole = (report.createdBy?.role === 'superadmin' || report.submittedBy?.role === 'superadmin') ? 'Admin' : 'Kasir';

                return (
                  <div
                    key={`mob-${report.id}`}
                    className="admin-history-mobile-card"
                    style={{
                      ...styles.mobileCard,
                      borderLeft: `4px solid ${borderLeftColor}`
                    }}
                  >
                    {/* Header Row: ID, Version, Date */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={styles.invoiceBadge}>{report.id}</span>
                        <span style={styles.versionPill}>v{report.version || 1}</span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} color="var(--neutral-400)" />
                        <span>{report.displayDate || formatDateIndonesian(report.opnameDate || report.date)}</span>
                      </div>
                    </div>

                    {/* Middle Row: Petugas & Total Bahan */}
                    <div style={styles.mobileMiddleBox}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} color="var(--neutral-500)" />
                        <span>Petugas: <strong>{creatorName}</strong> <span style={{ color: 'var(--neutral-400)', fontSize: '11px' }}>({creatorRole})</span></span>
                      </div>
                      <div>
                        <span><strong>{totalMaterials}</strong> Bahan</span>
                      </div>
                    </div>

                    {/* Status & Discrepancy Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <div>
                        {discrepancyCount > 0 ? (
                          <span style={styles.badgeDiscrepancy}>
                            {discrepancyCount} Ada Selisih
                          </span>
                        ) : (
                          <span style={styles.badgeMatch}>
                            Cocok (0 Selisih)
                          </span>
                        )}
                      </div>
                      <div>
                        {isVoid ? (
                          <span style={styles.statusVoidBadge}>
                            <Ban size={10} /> Dibatalkan
                          </span>
                        ) : needsReapply ? (
                          <span style={styles.statusReapplyBadge}>
                            <AlertTriangle size={10} /> Perlu Diterapkan Ulang
                          </span>
                        ) : isApplied ? (
                          <span style={styles.statusAppliedBadge}>
                            <CheckCircle2 size={10} /> Diterapkan
                          </span>
                        ) : (
                          <span style={styles.statusPendingBadge}>
                            <Clock size={10} /> Belum Diterapkan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div style={styles.mobileCardActions}>
                      <Button
                        variant="secondary"
                        icon={Eye}
                        onClick={() => onOpenReport(report)}
                        size="sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        Lihat Laporan
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Embedded Mobile Responsive Styles (16px spacing rules) */}
      <style>{`
        .admin-history-desktop-table {
          display: block;
          width: 100%;
          overflow-x: auto;
        }
        .admin-history-mobile-cards {
          display: none;
        }

        @media (max-width: 768px) {
          .admin-history-desktop-table {
            display: none !important;
          }
          .admin-history-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 14px 16px !important;
          }
          .stock-opname-admin-page {
            padding: 0 0 100px 0 !important;
            margin: 0 !important;
            gap: 14px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .stock-opname-header {
            margin-bottom: 0 !important;
            gap: 6px !important;
          }
          .stock-opname-today-card,
          .stock-opname-history-card {
            margin-bottom: 14px !important;
            border-radius: 12px !important;
            overflow: hidden !important;
          }
          .today-card-header {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
            padding: 14px 16px !important;
            border-bottom: 1px solid var(--border-color) !important;
          }
          .today-card-title {
            font-size: 15px !important;
            line-height: 1.3 !important;
          }
          .today-card-body {
            padding: 14px 16px !important;
          }
          .today-report-content {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0 !important;
          }
          .today-info-box {
            display: flex !important;
            flex-direction: column !important;
            gap: 0 !important;
            width: 100% !important;
            background-color: var(--neutral-50, #f8fafc) !important;
            border: 1px solid var(--border-color, #e2e8f0) !important;
            border-radius: 10px !important;
            padding: 4px 12px !important;
            box-sizing: border-box !important;
          }
          .info-meta-row {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            gap: 10px !important;
            padding: 9px 0 !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
          }
          .info-meta-row:last-child {
            border-bottom: none !important;
          }
          .info-label {
            width: auto !important;
            min-width: 85px !important;
            font-size: 12px !important;
            color: var(--neutral-500) !important;
            flex-shrink: 0 !important;
          }
          .info-value {
            text-align: right !important;
            font-size: 12.5px !important;
            color: var(--neutral-800) !important;
            flex: 1 !important;
            word-break: break-word !important;
          }
          .today-action-right {
            width: 100% !important;
            margin-top: 14px !important;
          }
          .today-action-right > button {
            width: 100% !important;
            height: 42px !important;
            justify-content: center !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            border-radius: 8px !important;
          }
          .today-empty-content {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }
          .today-empty-content button {
            width: 100% !important;
            justify-content: center !important;
          }
          .history-card-header {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 14px 16px !important;
            border-bottom: 1px solid var(--border-color) !important;
          }
          .history-card-title {
            font-size: 14.5px !important;
            margin: 0 !important;
          }
          .history-counter-pill {
            font-size: 11px !important;
            font-weight: 700 !important;
            padding: 2px 8px !important;
            border-radius: 12px !important;
            background-color: #eff6ff !important;
            color: var(--blue-600) !important;
            border: 1px solid #bfdbfe !important;
            white-space: nowrap !important;
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
    gap: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    margin: 0,
    letterSpacing: '-0.02em'
  },
  subtitle: {
    fontSize: '13.5px',
    color: 'var(--neutral-500)',
    margin: '4px 0 0 0'
  },

  // Today Card
  todayCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden'
  },
  todayCardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  todayCardTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    margin: 0
  },
  statusReportedBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#065f46',
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  statusAppliedBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#065f46',
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  statusReapplyBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#b45309',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  statusPendingBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#b45309',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  statusVoidBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    padding: '3px 8px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  todayCardBody: {
    padding: '20px'
  },
  todayReportContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  todayInfoBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  infoMetaRow: {
    fontSize: '13.5px',
    color: 'var(--neutral-800)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  infoLabel: {
    color: 'var(--neutral-500)',
    width: '110px'
  },
  infoValue: {
    fontSize: '13.5px',
    color: 'var(--neutral-800)'
  },
  todayActionRight: {
    display: 'flex',
    alignItems: 'center'
  },
  todayEmptyContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  emptyStatusText: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--neutral-800)',
    margin: 0
  },
  emptySubtext: {
    fontSize: '13px',
    color: 'var(--neutral-500)',
    margin: '4px 0 0 0'
  },

  // History Card
  historyCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden'
  },
  historyCardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  historyTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--neutral-900)',
    margin: 0
  },
  historyCounter: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--blue-600)',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    padding: '2px 8px',
    borderRadius: '12px',
    whiteSpace: 'nowrap'
  },
  historyEmpty: {
    padding: '28px 16px',
    textAlign: 'center'
  },
  emptyIconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: 'var(--neutral-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 8px'
  },
  emptyTitle: {
    margin: 0,
    fontSize: '13.5px',
    fontWeight: 700,
    color: 'var(--neutral-700)'
  },
  emptySubtitle: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: 'var(--neutral-400)'
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
    backgroundColor: '#f8fafc',
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
  statusSuccessBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#065f46',
    backgroundColor: '#d1fae5',
    padding: '2px 8px',
    borderRadius: '4px'
  },

  // Mobile Card Styles (Matching Kasir)
  invoiceBadge: {
    fontFamily: 'monospace',
    fontWeight: 700,
    fontSize: '12px',
    color: 'var(--blue-600)',
    backgroundColor: 'var(--blue-50)',
    padding: '3px 7px',
    borderRadius: '6px'
  },
  versionPill: {
    fontSize: '10px',
    fontWeight: 700,
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-700)',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  badgeMatch: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#059669',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  badgeDiscrepancy: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 700,
    color: '#b45309',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  mobileCard: {
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
  mobileMiddleBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--neutral-50)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.813rem'
  },
  mobileCardActions: {
    display: 'flex',
    gap: '8px',
    paddingTop: '6px',
    borderTop: '1px solid var(--neutral-100)'
  }
};
