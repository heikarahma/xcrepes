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
  Clock
} from 'lucide-react';
import { formatDateIndonesian, getLocalDateStr } from '../../../utils/dateUtils';

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
        <div style={styles.todayCardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--primary-600)" />
            <h2 style={styles.todayCardTitle}>Hari ini — {todayDisplay}</h2>
          </div>
          {todayReport && (
            <span style={styles.statusReportedBadge}>
              <CheckCircle2 size={12} /> Dilaporkan
            </span>
          )}
        </div>

        <div style={styles.todayCardBody}>
          {todayReport ? (
            /* Laporan Sudah Dibuat (Section 16) */
            <div style={styles.todayReportContent}>
              <div style={styles.todayInfoLeft}>
                <div style={styles.infoMetaRow}>
                  <span style={styles.infoLabel}>Status:</span>
                  <strong style={{ color: '#059669' }}>Dilaporkan (Terkirim)</strong>
                </div>
                <div style={styles.infoMetaRow}>
                  <span style={styles.infoLabel}>Dibuat oleh:</span>
                  <span>
                    <strong>{todayReport.createdBy?.name || 'Kasir'}</strong> 
                    <span style={{ color: 'var(--neutral-400)', marginLeft: '4px' }}>
                      ({todayReport.createdBy?.role === 'superadmin' ? 'Admin' : 'Kasir'})
                    </span>
                  </span>
                </div>
                {todayReport.lastModifiedBy && todayReport.lastModifiedBy.name !== todayReport.createdBy?.name && (
                  <div style={styles.infoMetaRow}>
                    <span style={styles.infoLabel}>Terakhir diedit:</span>
                    <span>
                      {todayReport.lastModifiedBy.name} ({todayReport.lastModifiedBy.role === 'superadmin' ? 'Admin' : 'Kasir'})
                    </span>
                  </div>
                )}
                <div style={styles.infoMetaRow}>
                  <span style={styles.infoLabel}>Pemeriksaan:</span>
                  <span>
                    {todayReport.summary?.totalMaterials || todayReport.items?.length || 0} bahan
                  </span>
                </div>
              </div>

              <div style={styles.todayActionRight}>
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
            <div style={styles.todayEmptyContent}>
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
        <div style={styles.historyCardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardCheck size={18} color="var(--neutral-600)" />
            <h3 style={styles.historyTitle}>Riwayat Stock Opname</h3>
          </div>
          <span style={styles.historyCounter}>{historyReports.length} Laporan Tersimpan</span>
        </div>

        {historyReports.length === 0 ? (
          <div style={styles.historyEmpty}>
            <p style={{ margin: 0, color: 'var(--neutral-500)', fontSize: '13px' }}>
              Belum ada riwayat laporan stock opname sebelumnya.
            </p>
          </div>
        ) : (
          <div style={styles.tableResponsive}>
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
                        <span style={styles.statusSuccessBadge}>
                          Selesai
                        </span>
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
        )}
      </div>

      {/* Embedded Mobile Responsive Styles (16px spacing rules) */}
      <style>{`
        @media (max-width: 768px) {
          .stock-opname-admin-page {
            padding: 0 0 100px 0 !important;
            margin: 0 !important;
            gap: 16px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .stock-opname-today-card,
          .stock-opname-history-card {
            margin-bottom: 16px !important;
            padding: 16px !important;
            border-radius: 10px !important;
          }
          .stock-opname-header {
            margin-bottom: 0 !important;
            gap: 8px !important;
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
  todayInfoLeft: {
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
    fontSize: '12px',
    color: 'var(--neutral-500)'
  },
  historyEmpty: {
    padding: '30px',
    textAlign: 'center'
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
  }
};
