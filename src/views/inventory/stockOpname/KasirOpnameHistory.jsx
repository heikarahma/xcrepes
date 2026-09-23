import React, { useState } from 'react';
import { useStockOpname } from '../../../controllers/StockOpnameController';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Edit3, 
  Eye, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  ClipboardCheck,
  Search, 
  X,
  User,
  Check,
  Ban
} from 'lucide-react';
import { formatDateIndonesian, formatDateTimeIndonesian } from '../../../utils/dateUtils';

export const KasirOpnameHistory = ({ onBackToForm, onViewDetail, onEditReport }) => {
  const { reports, canKasirEdit } = useStockOpname();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (r.id || '').toLowerCase().includes(q) ||
           (r.displayDate || r.opnameDate || '').toLowerCase().includes(q) ||
           (r.submittedBy?.name || r.createdBy?.name || '').toLowerCase().includes(q);
  });

  return (
    <div className="kasir-opname-history animate-fade-in" style={styles.container}>
      {/* 1. TOP HEADER SECTION */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={styles.title}>Riwayat Laporan Stock Opname</h1>
            <Badge variant="primary" withDot>
              Arsip Kasir
            </Badge>
          </div>
          <p style={styles.subtitle}>
            Daftar laporan harian outlet. Anda dapat mengedit laporan dalam rentang waktu <strong>hari ini dan kemarin (1 hari)</strong>.
          </p>
        </div>

        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={onBackToForm}
        >
          Kembali ke Form Opname
        </Button>
      </div>

      {/* 2. SECTION BOX (Matches Riwayat Transaksi Penjualan Box) */}
      <div className="reports-section-box animate-fade-in" style={styles.sectionBox}>
        <div className="reports-section-box-header" style={styles.sectionBoxHeader}>
          <div style={styles.sectionHeaderLeft}>
            <div style={styles.sectionIconBadge}>
              <ClipboardCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={styles.sectionMainTitle}>Daftar Laporan Stock Opname</h2>
                <span style={styles.sectionCounterBadge}>
                  {filteredReports.length} Laporan
                </span>
              </div>
              <p style={styles.sectionSubtitle}>
                Daftar arsip seluruh pencatatan stok fisik, nomor laporan, kasir bertugas, dan status penguncian
              </p>
            </div>
          </div>

          {/* Section Controls: Search */}
          <div className="reports-section-controls" style={styles.sectionHeaderRight}>
            <div className="reports-search-wrapper" style={styles.searchWrapper}>
              <Search size={15} color="var(--neutral-400)" style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Cari ID, tanggal, kasir..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={styles.clearSearchBtn}
                  title="Hapus kata kunci pencarian"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Card (Matches Riwayat Transaksi Table Card) */}
        <div className="transaction-table-card" style={styles.tableCard}>
          {filteredReports.length === 0 ? (
            <EmptyState
              title="Tidak ada riwayat stock opname"
              description={searchQuery ? "Tidak ditemukan laporan yang cocok dengan kata kunci pencarian." : "Belum ada riwayat laporan stock opname."}
              icon={ClipboardCheck}
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="transaction-desktop-table" style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>No. Laporan & Waktu</th>
                      <th style={styles.th}>Petugas</th>
                      <th style={styles.th}>Bahan Baku</th>
                      <th style={styles.th}>Status Selisih</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Versi</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Status Edit</th>
                      <th style={{ ...styles.th, textAlign: 'center', width: '150px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => {
                      const editable = canKasirEdit(report.opnameDate || report.date);
                      const isVoid = report.status === 'VOID';
                      const discrepancyCount = (report.summary?.deficitCount || 0) + (report.summary?.surplusCount || 0);

                      return (
                        <tr 
                          key={report.id} 
                          style={{
                            ...styles.tableRow,
                            backgroundColor: isVoid ? '#fff1f2' : undefined
                          }}
                        >
                          {/* 1. No. Laporan & Waktu */}
                          <td style={styles.td}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={styles.invoiceBadge}>{report.id}</span>
                                {isVoid ? (
                                  <span style={styles.statusVoidBadge}>
                                    <Ban size={10} /> DIBATALKAN
                                  </span>
                                ) : (
                                  <span style={styles.statusSubmittedBadge}>
                                    <Check size={10} /> TERKIRIM
                                  </span>
                                )}
                              </div>
                              <div style={styles.timeSubtext}>
                                <Clock size={11} color="var(--neutral-400)" />
                                <span>{formatDateIndonesian(report.opnameDate || report.date)}</span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Petugas */}
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={styles.userAvatar}>
                                <User size={13} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '13px' }}>
                                  {report.submittedBy?.name || report.createdBy?.name || 'Kasir'}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--neutral-400)' }}>
                                  Petugas Kasir
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 3. Bahan Baku */}
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '13px' }}>
                              {report.summary?.totalMaterials || report.items?.length || 0} Bahan Baku
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--neutral-400)', marginTop: '2px' }}>
                              Katalog Master Aktif
                            </div>
                          </td>

                          {/* 4. Status Selisih */}
                          <td style={styles.td}>
                            {discrepancyCount > 0 ? (
                              <span style={styles.badgeDiscrepancy}>
                                {discrepancyCount} Ada Selisih
                              </span>
                            ) : (
                              <span style={styles.badgeMatch}>
                                Cocok (0 Selisih)
                              </span>
                            )}
                          </td>

                          {/* 5. Versi */}
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <span style={styles.versionPill}>v{report.version || 1}</span>
                          </td>

                          {/* 6. Status Edit */}
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            {isVoid ? (
                              <span style={styles.statusVoidBadge}>
                                <Ban size={10} /> Dibatalkan
                              </span>
                            ) : editable ? (
                              <span style={styles.statusEditableBadge}>
                                <Clock size={10} /> Dapat Diedit
                              </span>
                            ) : (
                              <span style={styles.statusLockedBadge}>
                                <Lock size={10} /> Terkunci
                              </span>
                            )}
                          </td>

                          {/* 7. Aksi */}
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => onViewDetail && onViewDetail(report)}
                                style={styles.actionBtn}
                                title="Lihat Detail Laporan"
                              >
                                <Eye size={13} />
                                <span>Detail</span>
                              </button>

                              {editable && !isVoid && (
                                <button
                                  type="button"
                                  onClick={() => onEditReport && onEditReport(report)}
                                  style={{
                                    ...styles.actionBtn,
                                    borderColor: '#93c5fd',
                                    color: '#1d4ed8',
                                    backgroundColor: '#eff6ff'
                                  }}
                                  title="Edit Laporan"
                                >
                                  <Edit3 size={13} />
                                  <span>Edit</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="transaction-mobile-cards">
                {filteredReports.map((report) => {
                  const editable = canKasirEdit(report.opnameDate || report.date);
                  const isVoid = report.status === 'VOID';
                  const discrepancyCount = (report.summary?.deficitCount || 0) + (report.summary?.surplusCount || 0);
                  const borderLeftColor = isVoid ? '#ef4444' : discrepancyCount > 0 ? '#f59e0b' : 'var(--blue-600)';

                  return (
                    <div
                      key={`mob-${report.id}`}
                      className="transaction-mobile-card"
                      style={{
                        ...styles.mobileCard,
                        borderLeft: `4px solid ${borderLeftColor}`
                      }}
                    >
                      {/* Header Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={styles.invoiceBadge}>{report.id}</span>
                          {isVoid ? (
                            <span style={styles.statusVoidBadge}>
                              <Ban size={10} /> DIBATALKAN
                            </span>
                          ) : (
                            <span style={styles.statusSubmittedBadge}>
                              <Check size={10} /> TERKIRIM
                            </span>
                          )}
                          <span style={styles.versionPill}>v{report.version || 1}</span>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} color="var(--neutral-400)" />
                          <span>{formatDateIndonesian(report.opnameDate || report.date)}</span>
                        </div>
                      </div>

                      {/* Middle Row */}
                      <div style={styles.mobileMiddleBox}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={13} color="var(--neutral-500)" />
                          <span>Petugas: <strong>{report.submittedBy?.name || report.createdBy?.name || 'Kasir'}</strong></span>
                        </div>
                        <div>
                          <span><strong>{report.summary?.totalMaterials || report.items?.length || 0}</strong> Bahan</span>
                        </div>
                      </div>

                      {/* Status Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
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
                            <span style={styles.statusVoidBadge}>Dibatalkan</span>
                          ) : editable ? (
                            <span style={styles.statusEditableBadge}><Clock size={10} /> Dapat Diedit</span>
                          ) : (
                            <span style={styles.statusLockedBadge}><Lock size={10} /> Terkunci</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={styles.mobileCardActions}>
                        <button
                          type="button"
                          onClick={() => onViewDetail && onViewDetail(report)}
                          style={{ ...styles.actionBtn, flex: 1, justifyContent: 'center' }}
                        >
                          <Eye size={13} />
                          <span>Detail</span>
                        </button>
                        {editable && !isVoid && (
                          <button
                            type="button"
                            onClick={() => onEditReport && onEditReport(report)}
                            style={{
                              ...styles.actionBtn,
                              flex: 1,
                              justifyContent: 'center',
                              borderColor: '#93c5fd',
                              color: '#1d4ed8',
                              backgroundColor: '#eff6ff'
                            }}
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .transaction-desktop-table {
          display: block;
          width: 100%;
          overflow-x: auto;
        }
        .transaction-mobile-cards {
          display: none;
        }

        @media (max-width: 1024px) {
          .transaction-desktop-table {
            display: none !important;
          }
          .transaction-table-card {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          .transaction-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    paddingBottom: '40px'
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: 'var(--neutral-500)'
  },

  // Section Box Card Container (Matches Riwayat Transaksi Penjualan Box)
  sectionBox: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '18px 20px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  sectionBoxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '14px',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '14px'
  },
  sectionHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sectionIconBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    color: 'var(--blue-600)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  sectionMainTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--neutral-900)',
    margin: 0,
    letterSpacing: '-0.01em'
  },
  sectionCounterBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
    color: 'var(--blue-600)',
    border: '1px solid #bfdbfe'
  },
  sectionSubtitle: {
    fontSize: '12px',
    color: 'var(--neutral-500)',
    margin: '3px 0 0 0'
  },
  sectionHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '240px'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px'
  },
  searchInput: {
    width: '100%',
    padding: '8px 28px 8px 32px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: 'var(--neutral-900)'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--neutral-400)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px'
  },

  // Table Card
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    overflow: 'hidden'
  },
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
    backgroundColor: 'var(--neutral-50)',
    borderBottom: '1px solid var(--border-color)'
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--neutral-600)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.15s ease'
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    verticalAlign: 'middle'
  },
  invoiceBadge: {
    fontFamily: 'monospace',
    fontWeight: 700,
    fontSize: '12px',
    color: 'var(--blue-600)',
    backgroundColor: 'var(--blue-50)',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  timeSubtext: {
    fontSize: '11.5px',
    color: 'var(--neutral-500)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px'
  },
  userAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    color: 'var(--blue-600)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statusSubmittedBadge: {
    fontSize: '0.656rem',
    fontWeight: 800,
    color: '#065f46',
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
    padding: '1px 6px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
  },
  statusVoidBadge: {
    fontSize: '0.656rem',
    fontWeight: 800,
    color: '#991b1b',
    backgroundColor: '#fee2e2',
    border: '1px solid #f87171',
    padding: '1px 6px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
  },
  statusEditableBadge: {
    fontSize: '0.688rem',
    fontWeight: 700,
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    padding: '2px 8px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
  },
  statusLockedBadge: {
    fontSize: '0.688rem',
    fontWeight: 600,
    color: 'var(--neutral-500)',
    backgroundColor: 'var(--neutral-100)',
    padding: '2px 8px',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px'
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
  versionPill: {
    fontSize: '10px',
    fontWeight: 700,
    backgroundColor: 'var(--neutral-100)',
    color: 'var(--neutral-700)',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: 'var(--neutral-50)',
    border: '1px solid var(--border-color)',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--neutral-700)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease'
  },

  // Mobile Cards
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
